const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile } = require('../services/r2');

const router = express.Router();
router.use(authenticate);

// === Affiliate Content ===

// POST /api/affiliate/content
router.post('/content', upload.single('file'), async (req, res) => {
    try {
        const { content_type, title, body, product_name, metadata } = req.body;
        if (!content_type) return res.status(400).json({ error: 'content_type required' });

        let fileUrl = null;
        if (req.file) {
            const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'affiliate-content');
            fileUrl = uploaded.url;
        }

        const result = await query(
            `INSERT INTO affiliate_content (user_id, content_type, title, body, file_url, product_name, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, content_type, title || '', body || '', fileUrl, product_name || '', JSON.stringify(metadata || {})]
        );

        res.status(201).json({ content: result.rows[0] });
    } catch (err) {
        console.error('Content upload error:', err);
        res.status(500).json({ error: 'Failed to upload content' });
    }
});

// GET /api/affiliate/content
router.get('/content', async (req, res) => {
    try {
        const { content_type, product_name } = req.query;
        let sql = 'SELECT * FROM affiliate_content WHERE user_id = $1';
        const params = [req.user.id];
        let paramIndex = 2;

        if (content_type) {
            sql += ` AND content_type = $${paramIndex++}`;
            params.push(content_type);
        }
        if (product_name) {
            sql += ` AND product_name ILIKE $${paramIndex++}`;
            params.push(`%${product_name}%`);
        }

        sql += ' ORDER BY created_at DESC';
        const result = await query(sql, params);
        res.json({ content: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list content' });
    }
});

// DELETE /api/affiliate/content/:id
router.delete('/content/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM affiliate_content WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Content not found' });
        res.json({ message: 'Content deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

// === HopLinks ===

// POST /api/affiliate/hoplinks
router.post('/hoplinks', async (req, res) => {
    try {
        const { affiliate_id, vendor_id, product_name } = req.body;
        if (!affiliate_id || !vendor_id) return res.status(400).json({ error: 'affiliate_id and vendor_id required' });

        const result = await query(
            `INSERT INTO hop_links (user_id, affiliate_id, vendor_id, product_name) VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.id, affiliate_id, vendor_id, product_name || '']
        );
        res.status(201).json({ hopLink: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create HopLink' });
    }
});

// GET /api/affiliate/hoplinks
router.get('/hoplinks', async (req, res) => {
    try {
        const result = await query('SELECT * FROM hop_links WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json({ hopLinks: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list HopLinks' });
    }
});

// DELETE /api/affiliate/hoplinks/:id
router.delete('/hoplinks/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM hop_links WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'HopLink not found' });
        res.json({ message: 'HopLink deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete HopLink' });
    }
});

// === Cloaked Links ===

// POST /api/affiliate/cloaked-links
router.post('/cloaked-links', async (req, res) => {
    try {
        const { slug, destination_url } = req.body;
        if (!slug || !destination_url) return res.status(400).json({ error: 'slug and destination_url required' });

        const cleanSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        const result = await query(
            `INSERT INTO cloaked_links (user_id, slug, destination_url) VALUES ($1, $2, $3) RETURNING *`,
            [req.user.id, cleanSlug, destination_url]
        );
        res.status(201).json({ link: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Slug already taken' });
        res.status(500).json({ error: 'Failed to create cloaked link' });
    }
});

// GET /api/affiliate/cloaked-links
router.get('/cloaked-links', async (req, res) => {
    try {
        const result = await query('SELECT * FROM cloaked_links WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json({ links: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list cloaked links' });
    }
});

// DELETE /api/affiliate/cloaked-links/:id
router.delete('/cloaked-links/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM cloaked_links WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
        res.json({ message: 'Cloaked link deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete link' });
    }
});

module.exports = router;
