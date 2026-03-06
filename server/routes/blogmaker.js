/**
 * BlogMaker 3000 — API Routes
 * CRUD for blog workers + manual generation trigger + topic suggestions
 */
const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { generateBlogPost, suggestTopics } = require('../services/blogmaker-engine');

const router = express.Router();
router.use(authenticate);

// ─── LIST WORKERS ───────────────────────────────────────────────
router.get('/workers', async (req, res) => {
    try {
        const result = await query(
            `SELECT w.*, m.subdomain, m.site_title,
                    (SELECT COUNT(*) FROM blog_posts bp WHERE bp.worker_id = w.id) AS post_count
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

// ─── CREATE WORKER ──────────────────────────────────────────────
router.post('/workers', async (req, res) => {
    try {
        const { microsite_id, worker_name, worker_title, worker_avatar, affiliate_links, reference_urls, prompt_template, schedule_cron, schedule_start, posts_requested } = req.body;
        if (!worker_name) return res.status(400).json({ error: 'Worker name is required' });

        const result = await query(
            `INSERT INTO blog_workers (user_id, microsite_id, worker_name, worker_title, worker_avatar,
             affiliate_links, reference_urls, prompt_template, schedule_cron, schedule_start, posts_requested)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
            [req.user.id, microsite_id || null, worker_name, worker_title || '',
            worker_avatar || '', JSON.stringify(affiliate_links || []),
            JSON.stringify(reference_urls || []), prompt_template || '',
            schedule_cron || '0 9 1,15 * *', schedule_start || null, posts_requested || 4]
        );
        res.json({ worker: result.rows[0] });
    } catch (err) {
        console.error('Create worker error:', err);
        res.status(500).json({ error: 'Failed to create worker' });
    }
});

// ─── GET SINGLE WORKER ──────────────────────────────────────────
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

// ─── UPDATE WORKER ──────────────────────────────────────────────
router.put('/workers/:id', async (req, res) => {
    try {
        const { worker_name, worker_title, worker_avatar, microsite_id, affiliate_links, reference_urls, topics, prompt_template, schedule_cron, schedule_start, posts_requested, status } = req.body;
        const result = await query(
            `UPDATE blog_workers SET
             worker_name = COALESCE($3, worker_name),
             worker_title = COALESCE($4, worker_title),
             worker_avatar = COALESCE($5, worker_avatar),
             microsite_id = COALESCE($6, microsite_id),
             affiliate_links = COALESCE($7, affiliate_links),
             reference_urls = COALESCE($8, reference_urls),
             topics = COALESCE($9, topics),
             prompt_template = COALESCE($10, prompt_template),
             schedule_cron = COALESCE($11, schedule_cron),
             schedule_start = COALESCE($12, schedule_start),
             posts_requested = COALESCE($13, posts_requested),
             status = COALESCE($14, status),
             updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id, worker_name, worker_title, worker_avatar,
                microsite_id, affiliate_links ? JSON.stringify(affiliate_links) : null,
            reference_urls ? JSON.stringify(reference_urls) : null,
            topics ? JSON.stringify(topics) : null,
                prompt_template, schedule_cron, schedule_start, posts_requested, status]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ worker: result.rows[0] });
    } catch (err) {
        console.error('Update worker error:', err);
        res.status(500).json({ error: 'Failed to update worker' });
    }
});

// ─── DELETE WORKER ──────────────────────────────────────────────
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

// ─── GET WORKER'S POSTS ─────────────────────────────────────────
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

// ─── SUGGEST TOPICS ─────────────────────────────────────────────
router.post('/workers/:id/suggest-topics', async (req, res) => {
    try {
        const workerResult = await query(
            'SELECT * FROM blog_workers WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

        const worker = workerResult.rows[0];
        const topics = await suggestTopics(worker);
        res.json({ topics });
    } catch (err) {
        console.error('Suggest topics error:', err);
        res.status(500).json({ error: 'Failed to suggest topics' });
    }
});

// ─── GENERATE BLOG POST (manual trigger) ────────────────────────
router.post('/workers/:id/generate', async (req, res) => {
    try {
        const { topic } = req.body;
        const workerResult = await query(
            `SELECT w.*, m.subdomain, m.site_title
             FROM blog_workers w LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE w.id = $1 AND w.user_id = $2`,
            [req.params.id, req.user.id]
        );
        if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

        const worker = workerResult.rows[0];
        const post = await generateBlogPost(worker, topic, req.user.id);
        res.json({ post, message: 'Blog post generated successfully' });
    } catch (err) {
        console.error('Generate post error:', err);
        res.status(500).json({ error: 'Failed to generate blog post: ' + err.message });
    }
});

// ─── PUBLISH A BLOG POST ────────────────────────────────────────
router.post('/posts/:postId/publish', async (req, res) => {
    try {
        const result = await query(
            `UPDATE blog_posts SET status = 'published', published_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.postId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0], message: 'Blog post published' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to publish post' });
    }
});

// ─── UNPUBLISH A BLOG POST ──────────────────────────────────────
router.post('/posts/:postId/unpublish', async (req, res) => {
    try {
        const result = await query(
            `UPDATE blog_posts SET status = 'draft', updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.postId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0], message: 'Blog post unpublished' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unpublish post' });
    }
});

// ─── ACTIVATE WORKER SCHEDULE ───────────────────────────────────
router.post('/workers/:id/activate-schedule', async (req, res) => {
    try {
        const { schedule_cron } = req.body;
        // Set next_run_at to now + small delay so first run happens soon
        const nextRun = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now

        const result = await query(
            `UPDATE blog_workers SET status = 'active', next_run_at = $3,
             schedule_cron = COALESCE($4, schedule_cron), updated_at = NOW()
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id, nextRun, schedule_cron || null]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ worker: result.rows[0], message: 'Worker schedule activated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to activate schedule' });
    }
});

module.exports = router;
