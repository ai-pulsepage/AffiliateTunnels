const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { scrapeProductData } = require('../services/scraper');
const { refineProductCopy } = require('../services/ai-writer');
const { pushToShopify } = require('../services/store-sync');

const router = express.Router();
router.use(authenticate);

// 1. Queue URLs for Batch Scraping
router.post('/scrape', async (req, res) => {
    try {
        const { source_urls } = req.body;
        if (!source_urls || !Array.isArray(source_urls) || source_urls.length === 0) {
            return res.status(400).json({ error: 'source_urls array is required' });
        }

        const { v4: uuidv4 } = require('uuid');
        const batchId = uuidv4();

        // Insert all URLs as pending
        for (const url of source_urls) {
            let vendorName = '';
            try { vendorName = new URL(url).hostname.replace('www.', ''); } catch(e) {}

            await query(`
                INSERT INTO vendor_products (
                    user_id, source_url, vendor_name, status, batch_id
                ) VALUES ($1, $2, $3, 'pending_scrape', $4)
            `, [req.user.id, url, vendorName, batchId]);
        }

        res.json({ success: true, batch_id: batchId, message: `Queued ${source_urls.length} products for scraping` });
    } catch (err) {
        console.error('Vendor Queue Error:', err);
        res.status(500).json({ error: err.message || 'Failed to queue products' });
    }
});

// 2. Get Pending Queue
router.get('/queue', async (req, res) => {
    try {
        const result = await query(`
            SELECT * FROM vendor_products 
            WHERE user_id = $1 AND status IN ('pending_scrape', 'scraping', 'pending_review', 'failed')
            ORDER BY created_at DESC
        `, [req.user.id]);
        
        res.json({ queue: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
});

// 3. Update Refined Copy & Shipping Class
router.put('/:id', async (req, res) => {
    try {
        const { refined_title, refined_desc, target_store_id, shipping_class_id } = req.body;
        const result = await query(`
            UPDATE vendor_products 
            SET refined_title = COALESCE($1, refined_title),
                refined_desc = COALESCE($2, refined_desc),
                target_store_id = COALESCE($3, target_store_id),
                shipping_class_id = COALESCE($4, shipping_class_id),
                updated_at = NOW()
            WHERE id = $5 AND user_id = $6
            RETURNING *
        `, [refined_title, refined_desc, target_store_id, shipping_class_id, req.params.id, req.user.id]);
        
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
            price: product.original_price, 
            images: product.original_images,
            sku: product.sku || '',
            vendor_name: product.vendor_name,
            shipping_class_id: product.shipping_class_id,
            tags: product.tags
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
