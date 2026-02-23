const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { uploadBlogPost, deleteFile } = require('../services/r2');
const { generateBlogHTML, generateBlogIndexHTML } = require('../services/publisher');

const router = express.Router();
router.use(authenticate);

// GET /api/blog — List all blog posts for user
router.get('/', async (req, res) => {
    try {
        const { funnel_id, category, status, page = 1 } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let where = 'WHERE b.user_id = $1';
        const params = [req.user.id];
        let idx = 2;

        if (funnel_id) { where += ` AND b.funnel_id = $${idx++}`; params.push(funnel_id); }
        if (category) { where += ` AND b.category = $${idx++}`; params.push(category); }
        if (status) { where += ` AND b.status = $${idx++}`; params.push(status); }

        const result = await query(
            `SELECT b.*, f.name as funnel_name
             FROM blog_posts b
             LEFT JOIN funnels f ON b.funnel_id = f.id
             ${where}
             ORDER BY b.updated_at DESC
             LIMIT $${idx++} OFFSET $${idx++}`,
            [...params, limit, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) FROM blog_posts b ${where}`,
            params
        );

        res.json({
            posts: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        });
    } catch (err) {
        console.error('List blog posts error:', err);
        res.status(500).json({ error: 'Failed to list blog posts' });
    }
});

// GET /api/blog/categories — List distinct categories
router.get('/categories', async (req, res) => {
    try {
        const result = await query(
            'SELECT DISTINCT category FROM blog_posts WHERE user_id = $1 AND category IS NOT NULL ORDER BY category',
            [req.user.id]
        );
        res.json({ categories: result.rows.map(r => r.category) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list categories' });
    }
});

// POST /api/blog — Create a new blog post
router.post('/', async (req, res) => {
    try {
        const { title, funnel_id, excerpt, content_html, featured_image, seo_title, seo_description, seo_keyword, category, tags } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check slug uniqueness
        const exists = await query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
        let finalSlug = slug;
        if (exists.rows.length > 0) {
            finalSlug = `${slug}-${Date.now().toString(36)}`;
        }

        const result = await query(
            `INSERT INTO blog_posts (user_id, funnel_id, title, slug, excerpt, content_html, featured_image, seo_title, seo_description, seo_keyword, category, tags)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [req.user.id, funnel_id || null, title, finalSlug, excerpt, content_html, featured_image, seo_title, seo_description, seo_keyword, category, tags || []]
        );

        res.status(201).json({ post: result.rows[0] });
    } catch (err) {
        console.error('Create blog post error:', err);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

// GET /api/blog/:id — Get a single blog post
router.get('/:id', async (req, res) => {
    try {
        const result = await query(
            'SELECT b.*, f.name as funnel_name FROM blog_posts b LEFT JOIN funnels f ON b.funnel_id = f.id WHERE b.id = $1 AND b.user_id = $2',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get blog post' });
    }
});

// PUT /api/blog/:id — Update a blog post
router.put('/:id', async (req, res) => {
    try {
        const { title, slug, funnel_id, excerpt, content_html, featured_image, seo_title, seo_description, seo_keyword, category, tags, status } = req.body;

        const result = await query(
            `UPDATE blog_posts SET
                title = COALESCE($1, title),
                slug = COALESCE($2, slug),
                funnel_id = $3,
                excerpt = COALESCE($4, excerpt),
                content_html = COALESCE($5, content_html),
                featured_image = COALESCE($6, featured_image),
                seo_title = COALESCE($7, seo_title),
                seo_description = COALESCE($8, seo_description),
                seo_keyword = COALESCE($9, seo_keyword),
                category = COALESCE($10, category),
                tags = COALESCE($11, tags),
                status = COALESCE($12, status),
                updated_at = NOW()
             WHERE id = $13 AND user_id = $14 RETURNING *`,
            [title, slug, funnel_id !== undefined ? funnel_id : undefined, excerpt, content_html, featured_image, seo_title, seo_description, seo_keyword, category, tags, status, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ post: result.rows[0] });
    } catch (err) {
        console.error('Update blog post error:', err);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

// DELETE /api/blog/:id — Delete a blog post
router.delete('/:id', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM blog_posts WHERE id = $1 AND user_id = $2 RETURNING id, slug',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Blog post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// POST /api/blog/:id/publish — Publish a blog post to R2
router.post('/:id/publish', async (req, res) => {
    try {
        const postResult = await query(
            'SELECT * FROM blog_posts WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

        const post = postResult.rows[0];

        // Generate HTML
        const html = generateBlogHTML(post);

        // Upload to R2
        const uploaded = await uploadBlogPost(html, post.slug);

        // Update post
        await query(
            `UPDATE blog_posts SET status = 'published', published_url = $1, published_at = COALESCE(published_at, NOW()), updated_at = NOW() WHERE id = $2`,
            [uploaded.url, post.id]
        );

        // Regenerate blog index
        try {
            const allPosts = await query(
                "SELECT * FROM blog_posts WHERE user_id = $1 AND status = 'published' ORDER BY published_at DESC",
                [req.user.id]
            );
            const indexHtml = generateBlogIndexHTML(allPosts.rows);
            await uploadBlogPost(indexHtml, 'index');
        } catch (indexErr) {
            console.error('Blog index regeneration error:', indexErr);
        }

        res.json({ url: uploaded.url, message: 'Blog post published' });
    } catch (err) {
        console.error('Publish blog post error:', err);
        res.status(500).json({ error: 'Failed to publish blog post' });
    }
});

// PUT /api/blog/:id/unpublish — Unpublish a blog post
router.put('/:id/unpublish', async (req, res) => {
    try {
        await query(
            `UPDATE blog_posts SET status = 'draft', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Blog post unpublished' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unpublish blog post' });
    }
});

module.exports = router;
