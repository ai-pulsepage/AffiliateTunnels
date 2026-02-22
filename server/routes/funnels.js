const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { tierGate } = require('../middleware/tierGate');

const router = express.Router();

router.use(authenticate);

// GET /api/funnels
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT f.*,
        (SELECT COUNT(*) FROM pages WHERE funnel_id = f.id) as page_count,
        (SELECT COUNT(*) FROM analytics_events WHERE funnel_id = f.id AND event_type = 'pageview') as total_views,
        (SELECT COUNT(*) FROM leads WHERE funnel_id = f.id) as lead_count
       FROM funnels f
       WHERE f.user_id = $1
       ORDER BY f.updated_at DESC`,
            [req.user.id]
        );
        res.json({ funnels: result.rows });
    } catch (err) {
        console.error('List funnels error:', err);
        res.status(500).json({ error: 'Failed to list funnels' });
    }
});

// POST /api/funnels
router.post('/', tierGate('funnels'), async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name) return res.status(400).json({ error: 'Funnel name is required' });

        const funnelSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check slug uniqueness
        const exists = await query('SELECT id FROM funnels WHERE slug = $1', [funnelSlug]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'Slug already taken' });
        }

        const result = await query(
            `INSERT INTO funnels (user_id, name, slug) VALUES ($1, $2, $3) RETURNING *`,
            [req.user.id, name, funnelSlug]
        );

        res.status(201).json({ funnel: result.rows[0] });
    } catch (err) {
        console.error('Create funnel error:', err);
        res.status(500).json({ error: 'Failed to create funnel' });
    }
});

// GET /api/funnels/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT f.*,
        (SELECT COUNT(*) FROM analytics_events WHERE funnel_id = f.id AND event_type = 'pageview') as total_views,
        (SELECT COUNT(*) FROM leads WHERE funnel_id = f.id) as lead_count,
        (SELECT COUNT(*) FROM leads WHERE funnel_id = f.id AND is_unsubscribed = false) as active_leads
       FROM funnels f
       WHERE f.id = $1 AND f.user_id = $2`,
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Funnel not found' });
        }

        // Get pages
        const pages = await query(
            'SELECT * FROM pages WHERE funnel_id = $1 ORDER BY step_order ASC',
            [req.params.id]
        );

        // Get drip campaign
        const drip = await query(
            `SELECT dc.*, 
        (SELECT json_agg(de ORDER BY de.step_order) FROM drip_emails de WHERE de.drip_campaign_id = dc.id) as emails
       FROM drip_campaigns dc WHERE dc.funnel_id = $1`,
            [req.params.id]
        );

        res.json({
            funnel: result.rows[0],
            pages: pages.rows,
            drip: drip.rows[0] || null,
        });
    } catch (err) {
        console.error('Get funnel error:', err);
        res.status(500).json({ error: 'Failed to get funnel' });
    }
});

// PUT /api/funnels/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, slug, status, brand_colors, brand_fonts, seo_title, seo_description, og_image_url, ga4_id, fb_pixel_id } = req.body;

        const result = await query(
            `UPDATE funnels SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        status = COALESCE($3, status),
        brand_colors = COALESCE($4, brand_colors),
        brand_fonts = COALESCE($5, brand_fonts),
        seo_title = COALESCE($6, seo_title),
        seo_description = COALESCE($7, seo_description),
        og_image_url = COALESCE($8, og_image_url),
        ga4_id = COALESCE($9, ga4_id),
        fb_pixel_id = COALESCE($10, fb_pixel_id),
        updated_at = NOW()
       WHERE id = $11 AND user_id = $12 RETURNING *`,
            [name, slug, status, JSON.stringify(brand_colors), JSON.stringify(brand_fonts), seo_title, seo_description, og_image_url, ga4_id, fb_pixel_id, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Funnel not found' });
        }

        res.json({ funnel: result.rows[0] });
    } catch (err) {
        console.error('Update funnel error:', err);
        res.status(500).json({ error: 'Failed to update funnel' });
    }
});

// DELETE /api/funnels/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM funnels WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Funnel not found' });
        }

        res.json({ message: 'Funnel deleted' });
    } catch (err) {
        console.error('Delete funnel error:', err);
        res.status(500).json({ error: 'Failed to delete funnel' });
    }
});

// POST /api/funnels/:id/duplicate
router.post('/:id/duplicate', tierGate('funnels'), async (req, res) => {
    try {
        const original = await query('SELECT * FROM funnels WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (original.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        const f = original.rows[0];
        const newSlug = f.slug + '-copy-' + Date.now().toString(36);

        const newFunnel = await query(
            `INSERT INTO funnels (user_id, name, slug, brand_colors, brand_fonts, seo_title, seo_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, f.name + ' (Copy)', newSlug, f.brand_colors, f.brand_fonts, f.seo_title, f.seo_description]
        );

        // Duplicate pages
        const pages = await query('SELECT * FROM pages WHERE funnel_id = $1 ORDER BY step_order', [req.params.id]);
        for (const p of pages.rows) {
            await query(
                `INSERT INTO pages (funnel_id, name, slug, step_order, page_type, grapes_data, custom_head, custom_body, seo_title, seo_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [newFunnel.rows[0].id, p.name, p.slug, p.step_order, p.page_type, p.grapes_data, p.custom_head, p.custom_body, p.seo_title, p.seo_description]
            );
        }

        res.status(201).json({ funnel: newFunnel.rows[0] });
    } catch (err) {
        console.error('Duplicate funnel error:', err);
        res.status(500).json({ error: 'Failed to duplicate funnel' });
    }
});

// === Pages sub-routes ===

// GET /api/funnels/:funnelId/pages
router.get('/:funnelId/pages', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM pages WHERE funnel_id = $1 ORDER BY step_order ASC',
            [req.params.funnelId]
        );
        res.json({ pages: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list pages' });
    }
});

// POST /api/funnels/:funnelId/pages
router.post('/:funnelId/pages', tierGate('pagesPerFunnel'), async (req, res) => {
    try {
        const { name, page_type = 'landing' } = req.body;
        if (!name) return res.status(400).json({ error: 'Page name is required' });

        // Verify funnel ownership
        const funnel = await query('SELECT id FROM funnels WHERE id = $1 AND user_id = $2', [req.params.funnelId, req.user.id]);
        if (funnel.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        const maxOrder = await query('SELECT COALESCE(MAX(step_order), -1) + 1 as next FROM pages WHERE funnel_id = $1', [req.params.funnelId]);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const result = await query(
            `INSERT INTO pages (funnel_id, name, slug, step_order, page_type, grapes_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.params.funnelId, name, slug, maxOrder.rows[0].next, page_type, JSON.stringify({ components: [], styles: [] })]
        );

        res.status(201).json({ page: result.rows[0] });
    } catch (err) {
        console.error('Create page error:', err);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// GET /api/funnels/:funnelId/pages/:id
router.get('/:funnelId/pages/:id', async (req, res) => {
    try {
        const result = await query(
            'SELECT p.* FROM pages p JOIN funnels f ON p.funnel_id = f.id WHERE p.id = $1 AND p.funnel_id = $2 AND f.user_id = $3',
            [req.params.id, req.params.funnelId, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
        res.json({ page: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get page' });
    }
});

// PUT /api/funnels/:funnelId/pages/:id - Save page (GrapeJS state)
router.put('/:funnelId/pages/:id', async (req, res) => {
    try {
        const { name, slug, grapes_data, html_output, css_output, custom_head, custom_body, seo_title, seo_description, og_image_url } = req.body;

        // Save version before updating
        if (grapes_data) {
            const current = await query('SELECT grapes_data FROM pages WHERE id = $1', [req.params.id]);
            if (current.rows.length > 0 && current.rows[0].grapes_data) {
                const versionCount = await query('SELECT COALESCE(MAX(version_number), 0) + 1 as next FROM page_versions WHERE page_id = $1', [req.params.id]);
                await query(
                    'INSERT INTO page_versions (page_id, version_number, grapes_data) VALUES ($1, $2, $3)',
                    [req.params.id, versionCount.rows[0].next, current.rows[0].grapes_data]
                );

                // Purge old versions (keep last 10)
                await query(
                    `DELETE FROM page_versions WHERE page_id = $1 AND version_number NOT IN (
            SELECT version_number FROM page_versions WHERE page_id = $1 ORDER BY version_number DESC LIMIT 10
          )`,
                    [req.params.id]
                );
            }
        }

        const result = await query(
            `UPDATE pages SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        grapes_data = COALESCE($3, grapes_data),
        html_output = COALESCE($4, html_output),
        css_output = COALESCE($5, css_output),
        custom_head = COALESCE($6, custom_head),
        custom_body = COALESCE($7, custom_body),
        seo_title = COALESCE($8, seo_title),
        seo_description = COALESCE($9, seo_description),
        og_image_url = COALESCE($10, og_image_url),
        updated_at = NOW()
       WHERE id = $11 AND funnel_id = $12 RETURNING *`,
            [name, slug, JSON.stringify(grapes_data), html_output, css_output, custom_head, custom_body, seo_title, seo_description, og_image_url, req.params.id, req.params.funnelId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
        res.json({ page: result.rows[0] });
    } catch (err) {
        console.error('Update page error:', err);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// DELETE /api/funnels/:funnelId/pages/:id
router.delete('/:funnelId/pages/:id', async (req, res) => {
    try {
        const result = await query(
            `DELETE FROM pages p USING funnels f WHERE p.id = $1 AND p.funnel_id = $2 AND f.id = p.funnel_id AND f.user_id = $3 RETURNING p.id`,
            [req.params.id, req.params.funnelId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
        res.json({ message: 'Page deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

// GET /api/funnels/:funnelId/pages/:id/versions
router.get('/:funnelId/pages/:id/versions', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, version_number, created_at FROM page_versions WHERE page_id = $1 ORDER BY version_number DESC LIMIT 10',
            [req.params.id]
        );
        res.json({ versions: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list versions' });
    }
});

// PUT /api/funnels/:funnelId/pages/:id/rollback/:versionId
router.put('/:funnelId/pages/:id/rollback/:versionId', async (req, res) => {
    try {
        const version = await query('SELECT grapes_data FROM page_versions WHERE id = $1 AND page_id = $2', [req.params.versionId, req.params.id]);
        if (version.rows.length === 0) return res.status(404).json({ error: 'Version not found' });

        await query(
            'UPDATE pages SET grapes_data = $1, updated_at = NOW() WHERE id = $2',
            [version.rows[0].grapes_data, req.params.id]
        );

        res.json({ message: 'Rolled back successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to rollback' });
    }
});

module.exports = router;
