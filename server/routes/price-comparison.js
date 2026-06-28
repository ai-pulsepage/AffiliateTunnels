const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { 
    getShopifyCollections, 
    getShopifyProducts, 
    updateShopifyPrice,
    updateWooCommerceProduct
} = require('../services/store-sync');
const { 
    scourCompetitorPrices, 
    generatePricingSummary 
} = require('../services/price-scourer');
const { 
    queueOptimizationJob, 
    revertProductChange 
} = require('../services/woo-optimizer');

const router = express.Router();

// ─── MODULE 1: COMPETITOR PRICING MONITOR ENDPOINTS ──────────────────

// GET /api/price-comparison/sessions
router.get('/sessions', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT s.*, c.store_name,
               (SELECT COUNT(*) FROM price_comparison_products WHERE session_id = s.id) as product_count
             FROM price_comparison_sessions s
             LEFT JOIN connected_stores c ON s.store_id = c.id
             WHERE s.user_id = $1
             ORDER BY s.created_at DESC`,
            [req.user.id]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        console.error('Failed to get pricing sessions:', err);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// GET /api/price-comparison/sessions/:id
router.get('/sessions/:id', authenticate, async (req, res) => {
    try {
        const sessionRes = await query(
            `SELECT s.*, c.store_name, c.platform, c.store_url
             FROM price_comparison_sessions s
             LEFT JOIN connected_stores c ON s.store_id = c.id
             WHERE s.id = $1 AND s.user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (sessionRes.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionRes.rows[0];

        // Fetch products and their competitors
        const productsRes = await query(
            `SELECT * FROM price_comparison_products 
             WHERE session_id = $1 
             ORDER BY created_at ASC`,
            [session.id]
        );

        const products = await Promise.all(productsRes.rows.map(async (prod) => {
            const compsRes = await query(
                `SELECT competitor_name, competitor_price, competitor_url, stock_status 
                 FROM price_comparison_competitors 
                 WHERE product_id = $1 
                 ORDER BY competitor_price ASC`,
                [prod.id]
            );
            return {
                ...prod,
                competitors: compsRes.rows
            };
        }));

        // Fetch AI summary
        const summaryRes = await query(
            'SELECT * FROM price_comparison_summaries WHERE session_id = $1',
            [session.id]
        );

        res.json({
            session,
            products,
            summary: summaryRes.rows[0] || null
        });
    } catch (err) {
        console.error('Failed to get session details:', err);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// POST /api/price-comparison/sessions
router.post('/sessions', authenticate, async (req, res) => {
    try {
        const { name, source, store_id, shopify_collection, products } = req.body;

        if (!name || !source) {
            return res.status(400).json({ error: 'Missing name or source' });
        }

        let itemsToInsert = [];
        let createdSessionId;

        // Create Session
        const sessionRes = await query(
            `INSERT INTO price_comparison_sessions (user_id, store_id, name, source, shopify_collection, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [req.user.id, store_id || null, name, source, shopify_collection || null, 'pending']
        );
        createdSessionId = sessionRes.rows[0].id;

        if (source === 'shopify_scan') {
            if (!store_id) {
                return res.status(400).json({ error: 'Store ID required for scanning' });
            }
            const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1 AND user_id = $2', [store_id, req.user.id]);
            if (storeRes.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
            const store = storeRes.rows[0];

            // Fetch live products
            const shopifyProducts = await getShopifyProducts(store, shopify_collection);
            itemsToInsert = shopifyProducts.map(p => ({
                sku: p.sku,
                title: p.title,
                barcode: p.barcode,
                current_price: p.current_price,
                external_variant_id: p.external_variant_id,
                cost: 0.00
            }));
        } else if (source === 'excel_upload') {
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({ error: 'No products provided for upload' });
            }
            itemsToInsert = products.map(p => ({
                sku: p.sku || `NO-SKU-${Date.now()}-${Math.random()}`,
                title: p.title || 'Untitled Product',
                barcode: p.barcode || '',
                current_price: parseFloat(p.current_price) || 0.00,
                external_variant_id: p.external_variant_id || null,
                cost: parseFloat(p.cost) || 0.00
            }));
        }

        // Batch insert products
        for (const item of itemsToInsert) {
            await query(
                `INSERT INTO price_comparison_products 
                    (session_id, sku, title, barcode, external_variant_id, current_price, cost, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    createdSessionId, item.sku, item.title, 
                    item.barcode, item.external_variant_id, 
                    item.current_price, item.cost, 'pending'
                ]
            );
        }

        res.json({ success: true, sessionId: createdSessionId });
    } catch (err) {
        console.error('Failed to create pricing session:', err);
        res.status(500).json({ error: 'Failed to initialize session' });
    }
});

// POST /api/price-comparison/sessions/:id/scour
// Trigger asynchronous competitor scouring in background
router.post('/sessions/:id/scour', authenticate, async (req, res) => {
    try {
        const sessionRes = await query('SELECT * FROM price_comparison_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        
        // Update session status to scanning
        await query('UPDATE price_comparison_sessions SET status = $1, updated_at = NOW() WHERE id = $2', ['scanning', req.params.id]);

        // Start scouring asynchronously in background so client doesn't time out
        runBackgroundScour(req.params.id);

        res.json({ success: true, message: 'Scouring started in background' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to trigger price search' });
    }
});

// Helper for background competitor scanning
async function runBackgroundScour(sessionId) {
    try {
        const productsRes = await query('SELECT * FROM price_comparison_products WHERE session_id = $1', [sessionId]);
        
        for (const product of productsRes.rows) {
            try {
                // Update product state
                await query('UPDATE price_comparison_products SET status = $1 WHERE id = $2', ['scanning', product.id]);

                // Scour prices
                const competitors = await scourCompetitorPrices(product.sku, product.title, product.barcode, product.current_price);

                // Insert competitors
                for (const comp of competitors) {
                    await query(
                        `INSERT INTO price_comparison_competitors (product_id, competitor_name, competitor_price, competitor_url, stock_status)
                         VALUES ($1, $2, $3, $4, $5)`,
                         [product.id, comp.competitor_name, comp.competitor_price, comp.competitor_url, comp.stock_status]
                    );
                }

                // Calculate suggested price: lowest competitor price minus $1 to win buy box
                let suggestedPrice = product.current_price;
                const activeComps = competitors.filter(c => c.stock_status === 'in_stock');
                
                if (activeComps.length > 0) {
                    const lowestCompPrice = Math.min(...activeComps.map(c => parseFloat(c.competitor_price)));
                    suggestedPrice = Math.max(product.cost + 2.00, lowestCompPrice - 1.00); // Ensure at least $2 over cost
                }

                // Update product stats
                await query(
                    `UPDATE price_comparison_products 
                     SET status = $1, suggested_price = $2, scanned_at = NOW() 
                     WHERE id = $3`,
                    ['completed', suggestedPrice, product.id]
                );
            } catch (err) {
                console.error(`Scouring failed for product ${product.id}:`, err);
                await query('UPDATE price_comparison_products SET status = $1, error_message = $2 WHERE id = $3', ['failed', err.message, product.id]);
            }
        }

        // Mark session complete
        await query('UPDATE price_comparison_sessions SET status = $1, updated_at = NOW() WHERE id = $2', ['completed', sessionId]);
    } catch (err) {
        console.error('Background scouring crash:', err);
        await query('UPDATE price_comparison_sessions SET status = $1, updated_at = NOW() WHERE id = $2', ['failed', sessionId]);
    }
}

// POST /api/price-comparison/sessions/:id/summary
router.post('/sessions/:id/summary', authenticate, async (req, res) => {
    try {
        const sessionRes = await query('SELECT * FROM price_comparison_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        const session = sessionRes.rows[0];

        // Fetch products and their competitors
        const productsRes = await query('SELECT * FROM price_comparison_products WHERE session_id = $1', [session.id]);
        const products = await Promise.all(productsRes.rows.map(async (prod) => {
            const compsRes = await query('SELECT competitor_name, competitor_price FROM price_comparison_competitors WHERE product_id = $1', [prod.id]);
            return {
                ...prod,
                competitors: compsRes.rows
            };
        }));

        // Generate AI report
        const aiReport = await generatePricingSummary(products, session.name);

        // Save to DB
        await query(
            `INSERT INTO price_comparison_summaries (session_id, executive_summary, qa_insights)
             VALUES ($1, $2, $3)
             ON CONFLICT (session_id) DO UPDATE 
             SET executive_summary = EXCLUDED.executive_summary, 
                 qa_insights = EXCLUDED.qa_insights`,
            [session.id, aiReport.executiveSummary, JSON.stringify(aiReport.qaInsights)]
        );

        res.json({ success: true, report: aiReport });
    } catch (err) {
        console.error('Failed to generate summary:', err);
        res.status(500).json({ error: 'Failed to generate AI insights' });
    }
});

// PUT /api/price-comparison/products/:id
router.put('/products/:id', authenticate, async (req, res) => {
    try {
        const { cost, current_price, suggested_price } = req.body;

        const updateFields = [];
        const params = [];
        let index = 1;

        if (cost !== undefined) {
            updateFields.push(`cost = $${index++}`);
            params.push(parseFloat(cost));
        }
        if (current_price !== undefined) {
            updateFields.push(`current_price = $${index++}`);
            params.push(parseFloat(current_price));
        }
        if (suggested_price !== undefined) {
            updateFields.push(`suggested_price = $${index++}`);
            params.push(parseFloat(suggested_price));
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(req.params.id);
        const queryText = `UPDATE price_comparison_products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
        
        const result = await query(queryText, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, product: result.rows[0] });
    } catch (err) {
        console.error('Failed to update product fields:', err);
        res.status(500).json({ error: 'Failed to save edits' });
    }
});

// POST /api/price-comparison/products/:id/push
router.post('/products/:id/push', authenticate, async (req, res) => {
    try {
        // Get product details
        const prodRes = await query(
            `SELECT p.*, s.store_id
             FROM price_comparison_products p
             JOIN price_comparison_sessions s ON p.session_id = s.id
             WHERE p.id = $1 AND s.user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (prodRes.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const product = prodRes.rows[0];

        if (!product.store_id) {
            return res.status(400).json({ error: 'This session is not linked to an e-commerce store' });
        }

        // Get Store Connection
        const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1', [product.store_id]);
        if (storeRes.rows.length === 0) return res.status(404).json({ error: 'Connected store not found' });
        const store = storeRes.rows[0];

        const targetPrice = product.suggested_price || product.current_price;

        // Push price
        await query('UPDATE price_comparison_products SET sync_status = $1 WHERE id = $2', ['syncing', product.id]);

        if (store.platform === 'shopify') {
            if (!product.external_variant_id) {
                throw new Error('Missing external variant ID mapping for Shopify price update.');
            }
            await updateShopifyPrice(store, product.external_variant_id, targetPrice);
        } else if (store.platform === 'woocommerce') {
            // In WooCommerce, SKU search or ID mapping can be used. Let's see: if we have an external variant id, update it.
            // Or we look up the product by SKU. Let's look up WooCommerce product by SKU first
            const credentials = Buffer.from(`${store.api_key}:${store.api_secret}`).toString('base64');
            const searchRes = await fetch(`${store.store_url.startsWith('http') ? store.store_url : `https://${store.store_url}`}/wp-json/wc/v3/products?sku=${encodeURIComponent(product.sku)}`, {
                headers: { 'Authorization': `Basic ${credentials}` }
            });
            if (searchRes.ok) {
                const cats = await searchRes.json();
                if (cats.length > 0) {
                    await updateWooCommerceProduct(store, cats[0].id, { regular_price: targetPrice.toString() });
                } else {
                    throw new Error(`No WooCommerce product matches SKU ${product.sku}`);
                }
            } else {
                throw new Error('Failed to find WooCommerce product SKU.');
            }
        } else {
            throw new Error('Unsupported store platform');
        }

        await query('UPDATE price_comparison_products SET sync_status = $1, sync_error = NULL WHERE id = $2', ['synced', product.id]);
        res.json({ success: true });

    } catch (err) {
        console.error('Failed to update store pricing:', err);
        await query('UPDATE price_comparison_products SET sync_status = $1, sync_error = $2 WHERE id = $3', ['error', err.message, req.params.id]);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/price-comparison/sessions/:id
router.delete('/sessions/:id', authenticate, async (req, res) => {
    try {
        await query('DELETE FROM price_comparison_sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete pricing report' });
    }
});


// ─── MODULE 2: WOOCOMMERCE PRODUCT OPTIMIZER ENDPOINTS ────────────────

// GET /api/price-comparison/woo/jobs
router.get('/woo/jobs', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT j.*, s.store_name, s.store_url
             FROM woocommerce_optimization_jobs j
             JOIN connected_stores s ON j.store_id = s.id
             WHERE j.user_id = $1
             ORDER BY j.created_at DESC`,
            [req.user.id]
        );
        res.json({ jobs: result.rows });
    } catch (err) {
        console.error('Failed to get woo jobs:', err);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// GET /api/price-comparison/woo/jobs/:id
router.get('/woo/jobs/:id', authenticate, async (req, res) => {
    try {
        const jobRes = await query(
            `SELECT j.*, s.store_name 
             FROM woocommerce_optimization_jobs j
             JOIN connected_stores s ON j.store_id = s.id
             WHERE j.id = $1 AND j.user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (jobRes.rows.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const job = jobRes.rows[0];

        // Fetch logs
        const changesRes = await query(
            'SELECT * FROM woocommerce_product_changes WHERE job_id = $1 ORDER BY created_at DESC',
            [job.id]
        );

        res.json({
            job,
            changes: changesRes.rows
        });
    } catch (err) {
        console.error('Failed to get woo job details:', err);
        res.status(500).json({ error: 'Failed to fetch job details' });
    }
});

// POST /api/price-comparison/woo/jobs
router.post('/woo/jobs', authenticate, async (req, res) => {
    try {
        const { store_id } = req.body;
        if (!store_id) {
            return res.status(400).json({ error: 'Store ID is required' });
        }

        // Validate store ownership and WooCommerce type
        const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1 AND user_id = $2', [store_id, req.user.id]);
        if (storeRes.rows.length === 0) return res.status(404).json({ error: 'WooCommerce store not found' });
        
        const store = storeRes.rows[0];
        if (store.platform !== 'woocommerce') {
            return res.status(400).json({ error: 'AI Copy Optimizer is only supported for WooCommerce stores.' });
        }

        // Create job
        const jobRes = await query(
            `INSERT INTO woocommerce_optimization_jobs (user_id, store_id, status)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [req.user.id, store_id, 'pending']
        );
        const jobId = jobRes.rows[0].id;

        // Start background processing
        queueOptimizationJob(jobId);

        res.json({ success: true, jobId });
    } catch (err) {
        console.error('Failed to start WooCommerce job:', err);
        res.status(500).json({ error: 'Failed to initialize optimization job' });
    }
});

// POST /api/price-comparison/woo/changes/:id/revert
router.post('/woo/changes/:id/revert', authenticate, async (req, res) => {
    try {
        await revertProductChange(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to revert change:', err);
        res.status(500).json({ error: err.message || 'Failed to revert optimization' });
    }
});

module.exports = router;
