const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { scrapeProductData } = require('../services/scraper');
const { refineProductCopy } = require('../services/ai-writer');
const { pushToShopify } = require('../services/store-sync');

const router = express.Router();
router.use(authenticate);

// 1. Scrape and Refine (Ingestion)
router.post('/scrape', async (req, res) => {
    try {
        const { source_url } = req.body;
        if (!source_url) return res.status(400).json({ error: 'source_url is required' });

        // Scrape raw data
        const rawData = await scrapeProductData(source_url);

        // Parse vendor name roughly from URL
        let vendorName = '';
        try {
            vendorName = new URL(source_url).hostname.replace('www.', '');
        } catch(e) {}

        // Run AI Refinement
        const refined = await refineProductCopy(rawData.title, rawData.rawText);

        // Save to DB
        const result = await query(`
            INSERT INTO vendor_products (
                user_id, source_url, vendor_name, 
                original_title, original_desc, original_images, original_price,
                refined_title, refined_desc, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_review')
            RETURNING *
        `, [
            req.user.id, source_url, vendorName,
            rawData.title, rawData.rawText, JSON.stringify(rawData.images), rawData.price,
            refined.title, refined.description
        ]);

        res.json({ product: result.rows[0] });
    } catch (err) {
        console.error('Vendor Scrape Error:', err);
        res.status(500).json({ error: err.message || 'Failed to scrape and refine product' });
    }
});

// 2. Get Pending Queue
router.get('/queue', async (req, res) => {
    try {
        const result = await query(`
            SELECT * FROM vendor_products 
            WHERE user_id = $1 AND status = 'pending_review'
            ORDER BY created_at DESC
        `, [req.user.id]);
        
        res.json({ queue: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
});

// 3. Update Refined Copy
router.put('/:id', async (req, res) => {
    try {
        const { refined_title, refined_desc, target_store_id } = req.body;
        const result = await query(`
            UPDATE vendor_products 
            SET refined_title = COALESCE($1, refined_title),
                refined_desc = COALESCE($2, refined_desc),
                target_store_id = COALESCE($3, target_store_id),
                updated_at = NOW()
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `, [refined_title, refined_desc, target_store_id, req.params.id, req.user.id]);
        
        res.json({ product: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// 4. Push to Store
router.post('/:id/push', async (req, res) => {
    try {
        // Get the product and the store credentials
        const prodRes = await query(`
            SELECT vp.*, cs.platform, cs.store_url, cs.api_key, cs.api_secret, cs.access_token 
            FROM vendor_products vp
            JOIN connected_stores cs ON vp.target_store_id = cs.id
            WHERE vp.id = $1 AND vp.user_id = $2
        `, [req.params.id, req.user.id]);

        if (prodRes.rows.length === 0) {
            return res.status(404).json({ error: 'Product or Target Store not found. Make sure you selected a store.' });
        }

        const product = prodRes.rows[0];

        // Format for store-sync
        const pushPayload = {
            product_name: product.refined_title,
            product_desc: product.refined_desc,
            price: product.original_price, // Assuming auto pricing tools handle the rest as per user
            images: product.original_images,
            sku: product.sku || '',
            vendor_name: product.vendor_name
        };

        let pushResult;
        if (product.platform === 'shopify') {
            pushResult = await pushToShopify(product, pushPayload);
        } else {
            throw new Error('Only Shopify is currently supported for direct push in this specific route');
        }

        // Mark as pushed
        await query(`UPDATE vendor_products SET status = 'pushed' WHERE id = $1`, [product.id]);

        res.json({ success: true, external_url: pushResult.external_url });
    } catch (err) {
        console.error('Push Error:', err);
        await query(`UPDATE vendor_products SET error_message = $1 WHERE id = $2`, [err.message, req.params.id]);
        res.status(500).json({ error: err.message || 'Failed to push product' });
    }
});

// 5. Delete from Queue
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM vendor_products WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
