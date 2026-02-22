const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { uploadPublishedPage } = require('../services/r2');
const { generatePublishedHTML } = require('../services/publisher');

const router = express.Router();

// POST /api/publish/:funnelId/:pageId - Publish a page
router.post('/:funnelId/:pageId', authenticate, async (req, res) => {
    try {
        // Get funnel + page
        const funnelResult = await query('SELECT * FROM funnels WHERE id = $1 AND user_id = $2', [req.params.funnelId, req.user.id]);
        if (funnelResult.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        const pageResult = await query('SELECT * FROM pages WHERE id = $1 AND funnel_id = $2', [req.params.pageId, req.params.funnelId]);
        if (pageResult.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

        const funnel = funnelResult.rows[0];
        const page = pageResult.rows[0];

        // Generate standalone HTML
        const html = generatePublishedHTML(page, funnel);

        // Upload to R2
        const uploaded = await uploadPublishedPage(html, funnel.slug, page.slug);

        // Update page record
        await query(
            `UPDATE pages SET is_published = true, published_url = $1, updated_at = NOW() WHERE id = $2`,
            [uploaded.url, page.id]
        );

        // Update funnel status
        await query(
            `UPDATE funnels SET status = 'published', updated_at = NOW() WHERE id = $1`,
            [funnel.id]
        );

        res.json({ url: uploaded.url, message: 'Page published successfully' });
    } catch (err) {
        console.error('Publish error:', err);
        res.status(500).json({ error: err.message || 'Failed to publish page' });
    }
});

// POST /api/publish/:funnelId - Publish all pages in funnel
router.post('/:funnelId', authenticate, async (req, res) => {
    try {
        const funnelResult = await query('SELECT * FROM funnels WHERE id = $1 AND user_id = $2', [req.params.funnelId, req.user.id]);
        if (funnelResult.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        const funnel = funnelResult.rows[0];
        const pages = await query('SELECT * FROM pages WHERE funnel_id = $1 ORDER BY step_order', [funnel.id]);

        const results = [];
        for (const page of pages.rows) {
            const html = generatePublishedHTML(page, funnel);
            const uploaded = await uploadPublishedPage(html, funnel.slug, page.slug);
            await query('UPDATE pages SET is_published = true, published_url = $1, updated_at = NOW() WHERE id = $2', [uploaded.url, page.id]);
            results.push({ page: page.name, url: uploaded.url });
        }

        await query('UPDATE funnels SET status = $1, updated_at = NOW() WHERE id = $2', ['published', funnel.id]);

        res.json({ pages: results, message: 'All pages published' });
    } catch (err) {
        console.error('Publish all error:', err);
        res.status(500).json({ error: err.message || 'Failed to publish funnel' });
    }
});

// PUT /api/publish/:funnelId/unpublish
router.put('/:funnelId/unpublish', authenticate, async (req, res) => {
    try {
        await query('UPDATE pages SET is_published = false WHERE funnel_id = $1', [req.params.funnelId]);
        await query('UPDATE funnels SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', ['draft', req.params.funnelId, req.user.id]);
        res.json({ message: 'Funnel unpublished' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unpublish' });
    }
});

module.exports = router;
