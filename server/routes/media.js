const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile, deleteFile } = require('../services/r2');

const router = express.Router();
router.use(authenticate);

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

        const result = await query(
            `INSERT INTO media (user_id, filename, file_url, file_key, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.id, req.file.originalname, uploaded.url, uploaded.key, uploaded.size, uploaded.mimetype]
        );

        res.status(201).json({ media: result.rows[0] });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to upload file' });
    }
});

// GET /api/media
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(
            'SELECT * FROM media WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [req.user.id, parseInt(limit), parseInt(offset)]
        );

        const count = await query('SELECT COUNT(*) as total FROM media WHERE user_id = $1', [req.user.id]);

        res.json({ media: result.rows, total: parseInt(count.rows[0].total) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list media' });
    }
});

// DELETE /api/media/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM media WHERE id = $1 AND user_id = $2 RETURNING file_key',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Media not found' });

        // Delete from R2
        if (result.rows[0].file_key) {
            try { await deleteFile(result.rows[0].file_key); } catch (e) { console.warn('R2 delete failed:', e.message); }
        }

        res.json({ message: 'Media deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

module.exports = router;
