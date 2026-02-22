const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadFile, deleteFile } = require('../services/r2');

const router = express.Router();
router.use(authenticate);

// ─── FOLDERS ────────────────────────────────────

// GET /api/media/folders
router.get('/folders', async (req, res) => {
    try {
        const result = await query(
            `SELECT mf.*, f.name as funnel_name,
              (SELECT COUNT(*) FROM media m WHERE m.folder_id = mf.id) as file_count
       FROM media_folders mf
       LEFT JOIN funnels f ON mf.funnel_id = f.id
       WHERE mf.user_id = $1
       ORDER BY mf.created_at DESC`,
            [req.user.id]
        );
        res.json({ folders: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list folders' });
    }
});

// POST /api/media/folders
router.post('/folders', async (req, res) => {
    try {
        const { name, funnel_id } = req.body;
        if (!name) return res.status(400).json({ error: 'Folder name required' });

        const result = await query(
            `INSERT INTO media_folders (user_id, name, funnel_id) VALUES ($1, $2, $3) RETURNING *`,
            [req.user.id, name, funnel_id || null]
        );
        res.status(201).json({ folder: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// DELETE /api/media/folders/:id
router.delete('/folders/:id', async (req, res) => {
    try {
        // Unlink media from folder first (don't delete files)
        await query('UPDATE media SET folder_id = NULL WHERE folder_id = $1', [req.params.id]);
        const result = await query(
            'DELETE FROM media_folders WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Folder not found' });
        res.json({ message: 'Folder deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// ─── FILE UPLOAD ────────────────────────────────

// POST /api/media/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });

        const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

        const result = await query(
            `INSERT INTO media (user_id, filename, file_url, file_key, file_size, mime_type, folder_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, req.file.originalname, uploaded.url, uploaded.key, uploaded.size, uploaded.mimetype, req.body.folder_id || null]
        );

        res.status(201).json({ media: result.rows[0] });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message || 'Failed to upload file' });
    }
});

// ─── FILE LIST ──────────────────────────────────

// GET /api/media
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, folder_id, funnel_id } = req.query;
        const offset = (page - 1) * limit;

        let where = 'WHERE m.user_id = $1';
        const params = [req.user.id];

        if (folder_id) {
            params.push(folder_id);
            where += ` AND m.folder_id = $${params.length}`;
        } else if (funnel_id) {
            params.push(funnel_id);
            where += ` AND m.folder_id IN (SELECT id FROM media_folders WHERE funnel_id = $${params.length})`;
        }

        params.push(parseInt(limit), parseInt(offset));
        const result = await query(
            `SELECT m.* FROM media m ${where} ORDER BY m.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        // Count with same filter
        const countParams = params.slice(0, -2);
        const count = await query(
            `SELECT COUNT(*) as total FROM media m ${where}`,
            countParams
        );

        res.json({ media: result.rows, total: parseInt(count.rows[0].total) });
    } catch (err) {
        console.error('Media list error:', err);
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

        if (result.rows[0].file_key) {
            try { await deleteFile(result.rows[0].file_key); } catch (e) { console.warn('R2 delete failed:', e.message); }
        }

        res.json({ message: 'Media deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

module.exports = router;
