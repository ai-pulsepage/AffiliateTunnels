/**
 * Storefront Routes — Public storefront API + showcase admin CRUD
 */
const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { generateStorefrontHTML } = require('../services/storefront');
const { getSettingSync } = require('../config/settings');

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// PUBLIC — No auth required
// ═══════════════════════════════════════════════════════════

// GET /api/storefront/page — Returns the full rendered storefront HTML
router.get('/page', async (req, res) => {
    try {
        // Get storefront settings (use first admin's settings)
        const settingsResult = await query(
            `SELECT * FROM storefront_settings LIMIT 1`
        );
        const settings = settingsResult.rows[0] || {};

        // Get categories sorted
        const catResult = await query(
            `SELECT * FROM showcase_categories ORDER BY sort_order, name`
        );

        // Get visible items with page URLs
        const itemsResult = await query(
            `SELECT si.*, p.slug AS page_slug, f.slug AS funnel_slug,
                    p.seo_title, p.og_image_url
             FROM showcase_items si
             JOIN pages p ON si.page_id = p.id
             JOIN funnels f ON p.funnel_id = f.id
             WHERE si.is_visible = true AND p.is_published = true
             ORDER BY si.sort_order, si.created_at DESC`
        );

        // Build page URLs for each item
        const appBaseUrl = getSettingSync('app_base_url') || '';
        const items = itemsResult.rows.map(item => ({
            ...item,
            page_url: appBaseUrl
                ? `${appBaseUrl}/p/${item.funnel_slug}/${item.page_slug}`
                : `/p/${item.funnel_slug}/${item.page_slug}`,
            // Fall back to page OG image if no card image set
            card_image_url: item.card_image_url || item.og_image_url || '',
        }));

        const html = generateStorefrontHTML(settings, catResult.rows, items);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.send(html);
    } catch (err) {
        console.error('Storefront page error:', err);
        res.status(500).send('Something went wrong');
    }
});

// GET /api/storefront/items — Public JSON API for items
router.get('/items', async (req, res) => {
    try {
        const { category } = req.query;

        let sql = `
            SELECT si.id, si.display_title, si.display_desc, si.card_image_url,
                   si.price_label, si.category_id, sc.name AS category_name, sc.slug AS category_slug,
                   p.slug AS page_slug, f.slug AS funnel_slug, p.og_image_url
            FROM showcase_items si
            JOIN pages p ON si.page_id = p.id
            JOIN funnels f ON p.funnel_id = f.id
            LEFT JOIN showcase_categories sc ON si.category_id = sc.id
            WHERE si.is_visible = true AND p.is_published = true
        `;
        const params = [];

        if (category && category !== 'all') {
            sql += ` AND sc.slug = $1`;
            params.push(category);
        }

        sql += ' ORDER BY si.sort_order, si.created_at DESC';
        const result = await query(sql, params);

        const appBaseUrl = getSettingSync('app_base_url') || '';
        const items = result.rows.map(item => ({
            ...item,
            page_url: appBaseUrl
                ? `${appBaseUrl}/p/${item.funnel_slug}/${item.page_slug}`
                : `/p/${item.funnel_slug}/${item.page_slug}`,
            card_image_url: item.card_image_url || item.og_image_url || '',
        }));

        res.json({ items });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load storefront items' });
    }
});

// ═══════════════════════════════════════════════════════════
// ADMIN — Auth required
// ═══════════════════════════════════════════════════════════

// ─── Storefront Settings ───

// GET /api/storefront/settings
router.get('/settings', authenticate, async (req, res) => {
    try {
        let result = await query('SELECT * FROM storefront_settings WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            // Create default settings
            result = await query(
                `INSERT INTO storefront_settings (user_id) VALUES ($1) RETURNING *`,
                [req.user.id]
            );
        }
        res.json({ settings: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load storefront settings' });
    }
});

// PUT /api/storefront/settings
router.put('/settings', authenticate, async (req, res) => {
    try {
        const { hero_headline, hero_subtitle, brand_name, logo_url, accent_color, footer_text } = req.body;

        const result = await query(
            `INSERT INTO storefront_settings (user_id, hero_headline, hero_subtitle, brand_name, logo_url, accent_color, footer_text)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id) DO UPDATE SET
                hero_headline = COALESCE($2, storefront_settings.hero_headline),
                hero_subtitle = COALESCE($3, storefront_settings.hero_subtitle),
                brand_name = COALESCE($4, storefront_settings.brand_name),
                logo_url = $5,
                accent_color = COALESCE($6, storefront_settings.accent_color),
                footer_text = COALESCE($7, storefront_settings.footer_text),
                updated_at = NOW()
             RETURNING *`,
            [req.user.id, hero_headline, hero_subtitle, brand_name, logo_url, accent_color, footer_text]
        );

        res.json({ settings: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update storefront settings' });
    }
});

// ─── Categories ───

// GET /api/storefront/categories
router.get('/categories', authenticate, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM showcase_categories WHERE user_id = $1 ORDER BY sort_order, name',
            [req.user.id]
        );
        res.json({ categories: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// POST /api/storefront/categories
router.post('/categories', authenticate, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Category name required' });

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const result = await query(
            `INSERT INTO showcase_categories (user_id, name, slug) VALUES ($1, $2, $3) RETURNING *`,
            [req.user.id, name, slug]
        );
        res.status(201).json({ category: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/storefront/categories/:id
router.put('/categories/:id', authenticate, async (req, res) => {
    try {
        const { name, sort_order } = req.body;
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

        const result = await query(
            `UPDATE showcase_categories
             SET name = COALESCE($1, name), slug = COALESCE($2, slug), sort_order = COALESCE($3, sort_order)
             WHERE id = $4 AND user_id = $5 RETURNING *`,
            [name, slug, sort_order, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ category: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/storefront/categories/:id
router.delete('/categories/:id', authenticate, async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM showcase_categories WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ─── Showcase Items ───

// GET /api/storefront/showcase
router.get('/showcase', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT si.*, sc.name AS category_name, p.name AS page_name,
                    f.name AS funnel_name, p.is_published, p.og_image_url
             FROM showcase_items si
             JOIN pages p ON si.page_id = p.id
             JOIN funnels f ON p.funnel_id = f.id
             LEFT JOIN showcase_categories sc ON si.category_id = sc.id
             WHERE si.user_id = $1
             ORDER BY si.sort_order, si.created_at DESC`,
            [req.user.id]
        );
        res.json({ items: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load showcase items' });
    }
});

// POST /api/storefront/showcase
router.post('/showcase', authenticate, async (req, res) => {
    try {
        const { page_id, category_id, display_title, display_desc, card_image_url, price_label } = req.body;
        if (!page_id) return res.status(400).json({ error: 'page_id required' });

        // Verify the page belongs to the user
        const pageCheck = await query(
            `SELECT p.id FROM pages p JOIN funnels f ON p.funnel_id = f.id WHERE p.id = $1 AND f.user_id = $2`,
            [page_id, req.user.id]
        );
        if (pageCheck.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

        const result = await query(
            `INSERT INTO showcase_items (user_id, page_id, category_id, display_title, display_desc, card_image_url, price_label)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, page_id, category_id || null, display_title || '', display_desc || '', card_image_url || '', price_label || '']
        );
        res.status(201).json({ item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add showcase item' });
    }
});

// PUT /api/storefront/showcase/:id
router.put('/showcase/:id', authenticate, async (req, res) => {
    try {
        const { category_id, display_title, display_desc, card_image_url, price_label, sort_order, is_visible } = req.body;

        const result = await query(
            `UPDATE showcase_items SET
                category_id = COALESCE($1, category_id),
                display_title = COALESCE($2, display_title),
                display_desc = COALESCE($3, display_desc),
                card_image_url = COALESCE($4, card_image_url),
                price_label = COALESCE($5, price_label),
                sort_order = COALESCE($6, sort_order),
                is_visible = COALESCE($7, is_visible)
             WHERE id = $8 AND user_id = $9 RETURNING *`,
            [category_id, display_title, display_desc, card_image_url, price_label, sort_order, is_visible, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update showcase item' });
    }
});

// DELETE /api/storefront/showcase/:id
router.delete('/showcase/:id', authenticate, async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM showcase_items WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item removed from showcase' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// ─── Published Pages List (for adding to showcase) ───

// GET /api/storefront/published-pages — list all user's published pages
router.get('/published-pages', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT p.id, p.name, p.slug AS page_slug, p.seo_title, p.og_image_url, p.published_url,
                    f.name AS funnel_name, f.slug AS funnel_slug,
                    (SELECT si.id FROM showcase_items si WHERE si.page_id = p.id AND si.user_id = $1 LIMIT 1) AS showcase_id
             FROM pages p
             JOIN funnels f ON p.funnel_id = f.id
             WHERE f.user_id = $1 AND p.is_published = true
             ORDER BY f.name, p.step_order`,
            [req.user.id]
        );
        res.json({ pages: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load published pages' });
    }
});

module.exports = router;
