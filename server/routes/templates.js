const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/templates
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let sql = 'SELECT * FROM templates WHERE (is_global = true OR user_id = $1)';
        const params = [req.user.id];

        if (category) {
            sql += ' AND category = $2';
            params.push(category);
        }

        sql += ' ORDER BY is_global DESC, created_at DESC';
        const result = await query(sql, params);
        res.json({ templates: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list templates' });
    }
});

// GET /api/templates/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM templates WHERE id = $1 AND (is_global = true OR user_id = $2)',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
        res.json({ template: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get template' });
    }
});

// POST /api/templates - Save as template
router.post('/', async (req, res) => {
    try {
        const { name, category, template_type, grapes_data, thumbnail_url } = req.body;
        if (!name || !grapes_data) return res.status(400).json({ error: 'Name and grapes_data required' });

        const result = await query(
            `INSERT INTO templates (user_id, name, category, template_type, grapes_data, thumbnail_url, is_global)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
            [req.user.id, name, category || null, template_type || 'page', JSON.stringify(grapes_data), thumbnail_url || null]
        );

        res.status(201).json({ template: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save template' });
    }
});

// DELETE /api/templates/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
        res.json({ message: 'Template deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// POST /api/templates/:id/apply/:pageId - Apply template to page
router.post('/:id/apply/:pageId', async (req, res) => {
    try {
        const template = await query('SELECT grapes_data FROM templates WHERE id = $1', [req.params.id]);
        if (template.rows.length === 0) return res.status(404).json({ error: 'Template not found' });

        const result = await query(
            'UPDATE pages SET grapes_data = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [template.rows[0].grapes_data, req.params.pageId]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
        res.json({ page: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to apply template' });
    }
});

module.exports = router;
