const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const googleTrends = require('google-trends-api');
const { discoverManufacturers, generatePitch } = require('../services/supplier-engine');

const router = express.Router();
router.use(authenticate);

// ─── Search & Discover ──────────────────────────────────────────

// GET /api/suppliers/search?niche=Saunas
router.get('/search', async (req, res) => {
    try {
        const { niche } = req.query;
        if (!niche) return res.status(400).json({ error: 'Niche is required' });

        // 1. Check database cache first (case-insensitive search)
        const cacheResult = await query(
            'SELECT * FROM manufacturers WHERE niche ILIKE $1 ORDER BY created_at DESC LIMIT 20',
            [`%${niche}%`]
        );

        let manufacturers = cacheResult.rows;

        // 2. If no cache or very few results, use Gemini to discover
        if (manufacturers.length < 3) {
            console.log(`[SupplierEngine] Fetching manufacturers for "${niche}" from Gemini...`);
            const discovered = await discoverManufacturers(niche);
            
            // Save discovered to database
            for (const item of discovered) {
                if (!item.name || !item.website_url) continue;
                
                try {
                    const insertRes = await query(
                        `INSERT INTO manufacturers (name, website_url, description, niche, estimated_size, country)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (website_url) DO UPDATE 
                         SET updated_at = NOW()
                         RETURNING *`,
                        [item.name, item.website_url, item.description, niche, item.estimated_size, item.country]
                    );
                    manufacturers.push(insertRes.rows[0]);
                } catch (dbErr) {
                    console.error('Error caching manufacturer:', dbErr);
                }
            }
        }

        // De-duplicate just in case
        const unique = [];
        const seenUrls = new Set();
        for (const m of manufacturers) {
            if (!seenUrls.has(m.website_url)) {
                seenUrls.add(m.website_url);
                unique.push(m);
            }
        }

        res.json({ manufacturers: unique });
    } catch (err) {
        console.error('Supplier search error:', err);
        res.status(500).json({ error: 'Failed to search suppliers' });
    }
});

// GET /api/suppliers/trends?keyword=Saunas
router.get('/trends', async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Last 12 months

        const result = await googleTrends.interestOverTime({
            keyword,
            startTime: startDate,
            geo: 'US'
        });

        res.json(JSON.parse(result));
    } catch (err) {
        console.error('Trends error:', err);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

// ─── CRM (My Manufacturers) ──────────────────────────────────────

// GET /api/suppliers/crm
router.get('/crm', async (req, res) => {
    try {
        const result = await query(
            `SELECT um.*, m.name, m.website_url, m.description, m.niche, m.country, ms.subdomain as linked_microsite_subdomain
             FROM user_manufacturers um
             JOIN manufacturers m ON um.manufacturer_id = m.id
             LEFT JOIN microsites ms ON um.linked_microsite_id = ms.id
             WHERE um.user_id = $1
             ORDER BY um.updated_at DESC`,
            [req.user.id]
        );
        res.json({ saved: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get CRM data' });
    }
});

// POST /api/suppliers/crm
router.post('/crm', async (req, res) => {
    try {
        const { manufacturer_id } = req.body;
        if (!manufacturer_id) return res.status(400).json({ error: 'manufacturer_id is required' });

        const result = await query(
            `INSERT INTO user_manufacturers (user_id, manufacturer_id, status)
             VALUES ($1, $2, 'Discovered')
             ON CONFLICT (user_id, manufacturer_id) DO NOTHING
             RETURNING *`,
            [req.user.id, manufacturer_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Already saved' });
        }
        res.json({ saved: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save to CRM' });
    }
});

// PUT /api/suppliers/crm/:id (Update notes/status/link)
router.put('/crm/:id', async (req, res) => {
    try {
        const { status, custom_notes, contact_name, contact_email, linked_microsite_id, ecommerce_store_url } = req.body;
        
        let updateQuery = `UPDATE user_manufacturers SET
                status = COALESCE($1, status),
                custom_notes = COALESCE($2, custom_notes),
                contact_name = COALESCE($3, contact_name),
                contact_email = COALESCE($4, contact_email),
                updated_at = NOW()`;
        
        const queryParams = [status, custom_notes, contact_name, contact_email];
        let paramIdx = 5;

        // Only update linked_microsite_id if it's explicitly passed in the body
        if (linked_microsite_id !== undefined) {
            updateQuery += `, linked_microsite_id = $${paramIdx}`;
            queryParams.push(linked_microsite_id || null);
            paramIdx++;
        }

        if (ecommerce_store_url !== undefined) {
            updateQuery += `, ecommerce_store_url = $${paramIdx}`;
            queryParams.push(ecommerce_store_url || null);
            paramIdx++;
        }

        updateQuery += ` WHERE id = $${paramIdx} AND user_id = $${paramIdx + 1} RETURNING *`;
        queryParams.push(req.params.id, req.user.id);
        
        const result = await query(updateQuery, queryParams);

        if (result.rows.length === 0) return res.status(404).json({ error: 'CRM entry not found' });
        res.json({ entry: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update CRM entry' });
    }
});

// DELETE /api/suppliers/crm/:id
router.delete('/crm/:id', async (req, res) => {
    try {
        await query(
            'DELETE FROM user_manufacturers WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Removed from CRM' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from CRM' });
    }
});

// POST /api/suppliers/crm/:id/generate-pitch
router.post('/crm/:id/generate-pitch', async (req, res) => {
    try {
        // Get the manufacturer and custom notes
        const crmResult = await query(
            `SELECT um.*, m.name, m.website_url, m.description
             FROM user_manufacturers um
             JOIN manufacturers m ON um.manufacturer_id = m.id
             WHERE um.id = $1 AND um.user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (crmResult.rows.length === 0) return res.status(404).json({ error: 'CRM entry not found' });
        
        const entry = crmResult.rows[0];
        
        const pitch = await generatePitch({
            name: entry.name,
            website_url: entry.website_url,
            description: entry.description
        }, entry.custom_notes);

        // Save pitch to DB
        const updated = await query(
            'UPDATE user_manufacturers SET generated_pitch = $1, updated_at = NOW() WHERE id = $2 RETURNING generated_pitch',
            [pitch, entry.id]
        );

        res.json({ pitch: updated.rows[0].generated_pitch });
    } catch (err) {
        console.error('Generate pitch error:', err);
        res.status(500).json({ error: 'Failed to generate pitch' });
    }
});

module.exports = router;
