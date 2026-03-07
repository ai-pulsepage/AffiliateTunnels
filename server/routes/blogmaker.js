/**
 * BlogMaker 3000 — API Routes (v2 Queue-Based)
 */
const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { generateBlogPost, smartSuggest } = require('../services/blogmaker-engine');

const router = express.Router();
router.use(authenticate);

// ═══════════════════════════════════════════════════════════════
// WORKERS
// ═══════════════════════════════════════════════════════════════

// LIST WORKERS
router.get('/workers', async (req, res) => {
    try {
        const result = await query(
            `SELECT w.*, m.subdomain, m.site_title,
                    (SELECT COUNT(*) FROM blog_posts bp WHERE bp.worker_id = w.id) AS post_count,
                    (SELECT COUNT(*) FROM blog_queue bq WHERE bq.worker_id = w.id AND bq.status = 'pending') AS queue_pending
             FROM blog_workers w
             LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE w.user_id = $1
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );
        res.json({ workers: result.rows });
    } catch (err) {
        console.error('List workers error:', err);
        res.status(500).json({ error: 'Failed to list workers' });
    }
});

// CREATE WORKER
router.post('/workers', async (req, res) => {
    try {
        const { microsite_id, worker_name, worker_title, worker_avatar, affiliate_links, reference_urls, prompt_template } = req.body;
        if (!worker_name) return res.status(400).json({ error: 'Worker name is required' });

        const result = await query(
            `INSERT INTO blog_workers (user_id, microsite_id, worker_name, worker_title, worker_avatar,
             affiliate_links, reference_urls, prompt_template)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [req.user.id, microsite_id || null, worker_name, worker_title || '',
            worker_avatar || '', JSON.stringify(affiliate_links || []),
            JSON.stringify(reference_urls || []), prompt_template || '']
        );
        res.json({ worker: result.rows[0] });
    } catch (err) {
        console.error('Create worker error:', err);
        res.status(500).json({ error: 'Failed to create worker' });
    }
});

// GET SINGLE WORKER
router.get('/workers/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT w.*, m.subdomain, m.site_title
             FROM blog_workers w LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE w.id = $1 AND w.user_id = $2`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ worker: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get worker' });
    }
});

// UPDATE WORKER
router.put('/workers/:id', async (req, res) => {
    try {
        const { worker_name, worker_title, worker_avatar, microsite_id, affiliate_links, reference_urls, prompt_template, status } = req.body;
        const result = await query(
            `UPDATE blog_workers SET
             worker_name = COALESCE($3, worker_name),
             worker_title = COALESCE($4, worker_title),
             worker_avatar = COALESCE($5, worker_avatar),
             microsite_id = COALESCE($6, microsite_id),
             affiliate_links = COALESCE($7, affiliate_links),
             reference_urls = COALESCE($8, reference_urls),
             prompt_template = COALESCE($9, prompt_template),
             status = COALESCE($10, status),
             updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id, worker_name, worker_title, worker_avatar,
                microsite_id, affiliate_links ? JSON.stringify(affiliate_links) : null,
            reference_urls ? JSON.stringify(reference_urls) : null,
                prompt_template, status]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ worker: result.rows[0] });
    } catch (err) {
        console.error('Update worker error:', err);
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

// DELETE WORKER
router.delete('/workers/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM blog_workers WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ message: 'Worker deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

// ═══════════════════════════════════════════════════════════════
// QUEUE
// ═══════════════════════════════════════════════════════════════

// GET QUEUE for a worker
router.get('/workers/:id/queue', async (req, res) => {
    try {
        const result = await query(
            `SELECT q.*, bp.title AS post_title, bp.slug AS post_slug
             FROM blog_queue q
             LEFT JOIN blog_posts bp ON q.post_id = bp.id
             WHERE q.worker_id = $1
             ORDER BY q.scheduled_at ASC NULLS LAST`,
            [req.params.id]
        );
        res.json({ queue: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get queue' });
    }
});

// ADD QUEUE ENTRIES (batch)
router.post('/workers/:id/queue', async (req, res) => {
    try {
        const { entries } = req.body; // [{reference_url, topic, target_keyword, scheduled_at}]
        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: 'entries array is required' });
        }

        // Verify worker ownership
        const worker = await query('SELECT id FROM blog_workers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (worker.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

        const inserted = [];
        for (const entry of entries) {
            if (!entry.reference_url || !entry.topic) continue;
            const result = await query(
                `INSERT INTO blog_queue (worker_id, reference_url, topic, target_keyword, scheduled_at)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [req.params.id, entry.reference_url, entry.topic, entry.target_keyword || null, entry.scheduled_at || null]
            );
            inserted.push(result.rows[0]);
        }

        res.json({ queue: inserted, message: `${inserted.length} entries added to queue` });
    } catch (err) {
        console.error('Add queue error:', err);
        res.status(500).json({ error: 'Failed to add queue entries' });
    }
});

// DELETE QUEUE ENTRY
router.delete('/queue/:id', async (req, res) => {
    try {
        await query('DELETE FROM blog_queue WHERE id = $1', [req.params.id]);
        res.json({ message: 'Queue entry removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove queue entry' });
    }
});

// PUT /api/blogmaker/queue/:id — edit a queue item
router.put('/queue/:id', async (req, res) => {
    try {
        const { topic, target_keyword, reference_url, scheduled_at } = req.body;
        const result = await query(
            `UPDATE blog_queue
             SET topic = COALESCE($2, topic),
                 target_keyword = COALESCE($3, target_keyword),
                 reference_url = COALESCE($4, reference_url),
                 scheduled_at = COALESCE($5, scheduled_at)
             WHERE id = $1 AND status = 'pending'
             RETURNING *`,
            [req.params.id, topic, target_keyword, reference_url, scheduled_at]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Queue entry not found or already processed' });
        res.json({ queue: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update queue entry' });
    }
});

// POST /api/blogmaker/process-now — manually trigger queue processing
router.post('/process-now', async (req, res) => {
    try {
        const { processQueue } = require('../services/blogmaker-scheduler');
        console.log('[BlogMaker] Manual process triggered by admin');
        processQueue().then(() => {
            console.log('[BlogMaker] Manual process complete');
        }).catch(err => {
            console.error('[BlogMaker] Manual process error:', err);
        });
        res.json({ message: 'Queue processing started — check Published tab in a few minutes' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to trigger processing' });
    }
});

// GET /api/blogmaker/scheduler-status — diagnostics
router.get('/scheduler-status', async (req, res) => {
    try {
        const pending = await query("SELECT COUNT(*) as count FROM blog_queue WHERE status = 'pending'");
        const overdue = await query("SELECT COUNT(*) as count FROM blog_queue WHERE status = 'pending' AND scheduled_at <= NOW()");
        const generating = await query("SELECT COUNT(*) as count FROM blog_queue WHERE status = 'generating'");
        const failed = await query("SELECT COUNT(*) as count FROM blog_queue WHERE status = 'failed'");
        const published = await query("SELECT COUNT(*) as count FROM blog_queue WHERE status = 'published'");

        const { getSetting } = require('../config/settings');
        const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');

        res.json({
            pending: parseInt(pending.rows[0].count),
            overdue: parseInt(overdue.rows[0].count),
            generating: parseInt(generating.rows[0].count),
            failed: parseInt(failed.rows[0].count),
            published: parseInt(published.rows[0].count),
            gemini_key_set: !!apiKey,
            server_time: new Date().toISOString(),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get scheduler status' });
    }
});

// SMART SUGGEST — paste URLs → get topic suggestions
router.post('/workers/:id/smart-suggest', async (req, res) => {
    try {
        const { reference_urls } = req.body;
        if (!reference_urls || !Array.isArray(reference_urls) || reference_urls.length === 0) {
            return res.status(400).json({ error: 'reference_urls array is required' });
        }

        const workerResult = await query(
            'SELECT * FROM blog_workers WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

        const suggestions = await smartSuggest(workerResult.rows[0], reference_urls);
        res.json({ suggestions });
    } catch (err) {
        console.error('Smart suggest error:', err);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// MANUAL GENERATE (immediate, no queue)
router.post('/workers/:id/generate', async (req, res) => {
    try {
        const { topic, reference_url } = req.body;
        const workerResult = await query(
            `SELECT w.*, m.subdomain, m.site_title
             FROM blog_workers w LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE w.id = $1 AND w.user_id = $2`,
            [req.params.id, req.user.id]
        );
        if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

        const worker = workerResult.rows[0];
        const queueItem = { topic, reference_url: reference_url || null, target_keyword: null };
        const post = await generateBlogPost(worker, queueItem, req.user.id);
        res.json({ post, message: 'Blog post generated and published' });
    } catch (err) {
        console.error('Generate post error:', err);
        res.status(500).json({ error: 'Failed to generate blog post: ' + err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════════

// GET WORKER'S POSTS
router.get('/workers/:id/posts', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, title, slug, excerpt, featured_image, status, category, target_keyword,
                    author_name, published_at, created_at
             FROM blog_posts WHERE worker_id = $1 AND user_id = $2
             ORDER BY created_at DESC`,
            [req.params.id, req.user.id]
        );
        res.json({ posts: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get worker posts' });
    }
});

// ALL POSTS (across all workers)
router.get('/posts', async (req, res) => {
    try {
        const result = await query(
            `SELECT bp.*, bw.worker_name, m.subdomain
             FROM blog_posts bp
             LEFT JOIN blog_workers bw ON bp.worker_id = bw.id
             LEFT JOIN microsites m ON bp.microsite_id = m.id
             WHERE bp.user_id = $1
             ORDER BY bp.created_at DESC`,
            [req.user.id]
        );
        res.json({ posts: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list posts' });
    }
});

// PUBLISH POST
router.post('/posts/:postId/publish', async (req, res) => {
    try {
        const result = await query(
            `UPDATE blog_posts SET status = 'published', published_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.postId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to publish post' });
    }
});

// UNPUBLISH POST
router.post('/posts/:postId/unpublish', async (req, res) => {
    try {
        const result = await query(
            `UPDATE blog_posts SET status = 'draft', updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.postId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unpublish post' });
    }
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS (admin management)
// ═══════════════════════════════════════════════════════════════

// LIST NOTIFICATIONS
router.get('/notifications', async (req, res) => {
    try {
        const result = await query(
            `SELECT bn.*, bp.title AS post_title, bp.slug AS post_slug
             FROM blog_notifications bn
             LEFT JOIN blog_posts bp ON bn.blog_post_id = bp.id
             WHERE bn.user_id = $1
             ORDER BY bn.created_at DESC`,
            [req.user.id]
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list notifications' });
    }
});

// APPROVE NOTIFICATION (paused → active)
router.post('/notifications/:id/approve', async (req, res) => {
    try {
        const result = await query(
            `UPDATE blog_notifications SET status = 'active', approved_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json({ notification: result.rows[0], message: 'Notification approved — will send shortly' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve notification' });
    }
});

// REJECT NOTIFICATION (delete it)
router.delete('/notifications/:id', async (req, res) => {
    try {
        await query('DELETE FROM blog_notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

module.exports = router;
