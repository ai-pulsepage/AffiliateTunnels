const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { pushToShopify, pushToWooCommerce, getStoreMetrics } = require('../services/store-sync');

const router = express.Router();
router.use(authenticate);

// ─── CONNECTED STORES CRUD ──────────────────────────────────────────

// GET /api/stores
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, store_name, platform, store_url, is_active, created_at 
             FROM connected_stores 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [req.user.id]
        );
        
        // Fetch live metrics for each active store
        const stores = await Promise.all(result.rows.map(async (store) => {
            if (!store.is_active) return { ...store, metrics: null };
            
            // Get full store info to fetch metrics (we need the keys)
            const fullStore = await query('SELECT * FROM connected_stores WHERE id = $1', [store.id]);
            const metrics = await getStoreMetrics(fullStore.rows[0]);
            
            return { ...store, metrics };
        }));

        res.json({ stores });
    } catch (err) {
        console.error('Failed to get stores:', err);
        res.status(500).json({ error: 'Failed to get connected stores' });
    }
});

// POST /api/stores
router.post('/', async (req, res) => {
    try {
        const { store_name, platform, store_url, api_key, api_secret, access_token } = req.body;

        if (!store_name || !platform || !store_url) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let isActive = true;
        let authUrl = null;

        if (platform === 'shopify') {
            isActive = false; // Need to complete OAuth
        }

        const result = await query(
            `INSERT INTO connected_stores (user_id, store_name, platform, store_url, api_key, api_secret, access_token, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, store_name, platform, store_url, is_active`,
            [req.user.id, store_name, platform, store_url, api_key, api_secret, access_token, isActive]
        );

        const storeId = result.rows[0].id;

        if (platform === 'shopify') {
            const cleanUrl = store_url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const redirectUri = `${protocol}://${req.get('host')}/api/stores/shopify/callback`;
            authUrl = `https://${cleanUrl}/admin/oauth/authorize?client_id=${api_key}&scope=read_products,write_products,read_orders&redirect_uri=${redirectUri}&state=${storeId}`;
            return res.json({ store: result.rows[0], oauthUrl: authUrl });
        }

        res.json({ store: result.rows[0] });
    } catch (err) {
        console.error('Failed to add store:', err);
        res.status(500).json({ error: 'Failed to add store' });
    }
});

// GET /api/stores/shopify/callback
// (No auth middleware here because it's a redirect from Shopify)
router.get('/shopify/callback', async (req, res) => {
    try {
        const { code, shop, state } = req.query;
        if (!code || !shop || !state) {
            return res.status(400).send('Missing required parameters from Shopify');
        }

        // The state is our store ID
        const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1', [state]);
        if (storeRes.rows.length === 0) return res.status(404).send('Store not found');
        
        const store = storeRes.rows[0];

        // Exchange code for access token
        const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: store.api_key,
                client_secret: store.api_secret,
                code: code
            })
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error('Shopify Token Error:', errText);
            return res.status(400).send('Failed to get access token from Shopify');
        }

        const data = await tokenRes.json();
        const accessToken = data.access_token;

        // Update the store with the access token and mark active
        await query(
            'UPDATE connected_stores SET access_token = $1, is_active = true WHERE id = $2',
            [accessToken, store.id]
        );

        // Redirect back to the Store Manager
        res.redirect('/store-manager');
    } catch (err) {
        console.error('Shopify callback error:', err);
        res.status(500).send('Internal Server Error during Shopify authentication');
    }
});

// DELETE /api/stores/:id
router.delete('/:id', async (req, res) => {
    try {
        await query('DELETE FROM connected_stores WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

// ─── PRODUCT PUSHING ────────────────────────────────────────────────

// POST /api/stores/push
router.post('/push', async (req, res) => {
    try {
        const { store_id, product_id, product_data } = req.body;
        
        // 1. Get Store
        const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1 AND user_id = $2', [store_id, req.user.id]);
        if (storeRes.rows.length === 0) return res.status(404).json({ error: 'Store not found' });
        const store = storeRes.rows[0];

        // 2. Get/Update Product
        // We will update the microsite_products table with the new data passed from the frontend editor before pushing
        if (product_id && product_data) {
            await query(
                `UPDATE microsite_products SET
                    product_name = $1,
                    product_desc = $2,
                    price = $3,
                    compare_at_price = $4,
                    sku = $5,
                    barcode = $6,
                    weight = $7,
                    weight_unit = $8,
                    tags = $9,
                    vendor_name = $10
                 WHERE id = $11 AND user_id = $12`,
                 [
                    product_data.product_name, product_data.product_desc, 
                    product_data.price || null, product_data.compare_at_price || null, 
                    product_data.sku, product_data.barcode, 
                    product_data.weight || null, product_data.weight_unit || 'kg', 
                    product_data.tags, product_data.vendor_name,
                    product_id, req.user.id
                 ]
            );
        }

        // Fetch full product from DB to ensure we have images
        let productToPush = product_data;
        if (product_id) {
            const prodRes = await query('SELECT * FROM microsite_products WHERE id = $1 AND user_id = $2', [product_id, req.user.id]);
            if (prodRes.rows.length > 0) {
                productToPush = prodRes.rows[0];
            }
        }

        // 3. Push to Platform
        let syncResult;
        if (store.platform === 'shopify') {
            syncResult = await pushToShopify(store, productToPush);
        } else if (store.platform === 'woocommerce') {
            syncResult = await pushToWooCommerce(store, productToPush);
        } else {
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        // 4. Record Sync
        if (product_id) {
            await query(
                `INSERT INTO store_products (store_id, microsite_product_id, external_id, external_url)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (store_id, microsite_product_id) DO UPDATE 
                 SET external_id = EXCLUDED.external_id, 
                     external_url = EXCLUDED.external_url, 
                     last_synced_at = NOW(), 
                     sync_status = 'success'`,
                [store.id, product_id, syncResult.external_id, syncResult.external_url]
            );
        }

        res.json({ success: true, syncData: syncResult });
    } catch (err) {
        console.error('Push error:', err);
        
        // Record failure if we have a product ID
        if (req.body.product_id) {
            try {
                await query(
                    `INSERT INTO store_products (store_id, microsite_product_id, external_id, sync_status, last_synced_at)
                     VALUES ($1, $2, 'error', 'failed', NOW())
                     ON CONFLICT (store_id, microsite_product_id) DO UPDATE 
                     SET sync_status = 'failed', last_synced_at = NOW()`,
                    [req.body.store_id, req.body.product_id]
                );
            } catch(e) {}
        }
        
        res.status(500).json({ error: err.message || 'Failed to push product' });
    }
});

module.exports = router;
