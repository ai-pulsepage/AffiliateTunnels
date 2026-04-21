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


// ═══════════════════════════════════════════════════════════
// MICROSITES — Admin CRUD
// ═══════════════════════════════════════════════════════════

const RESERVED_SUBDOMAINS = ['app', 'www', 'mail', 'api', 'admin', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2', 'mx', 'test', 'staging', 'dev'];

// GET /api/storefront/microsites — list all microsites
router.get('/microsites', authenticate, async (req, res) => {
    try {
        const result = await query(
            `SELECT m.*,
                    (SELECT COUNT(*) FROM microsite_products mp WHERE mp.microsite_id = m.id)::int AS product_count,
                    (SELECT MAX(bp.published_at) FROM blog_posts bp WHERE bp.microsite_subdomain = m.subdomain AND bp.status = 'published') AS last_blog_at
             FROM microsites m WHERE m.user_id = $1 ORDER BY m.created_at DESC`,
            [req.user.id]
        );
        // Compute staleness on each row
        const now = Date.now();
        const microsites = result.rows.map(ms => {
            const threshold = ms.staleness_days || 7;
            // Use explicit last_content_at, or fall back to last blog post
            const lastAt = ms.last_content_at || ms.last_blog_at;
            const daysSince = lastAt ? Math.floor((now - new Date(lastAt).getTime()) / 86400000) : null;
            return {
                ...ms,
                days_since_content: daysSince,
                is_stale: daysSince !== null ? daysSince >= threshold : false,
                staleness_level: daysSince === null ? 'no_content'
                    : daysSince >= threshold * 2 ? 'critical'
                    : daysSince >= threshold ? 'overdue'
                    : 'fresh',
            };
        });
        res.json({ microsites });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load microsites' });
    }
});

// POST /api/storefront/microsites — create a microsite
router.post('/microsites', authenticate, async (req, res) => {
    try {
        let { subdomain, site_title, site_subtitle, accent_color } = req.body;
        if (!subdomain) return res.status(400).json({ error: 'Subdomain is required' });

        // Clean subdomain
        subdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)/g, '');
        if (!subdomain) return res.status(400).json({ error: 'Invalid subdomain' });
        if (RESERVED_SUBDOMAINS.includes(subdomain)) return res.status(400).json({ error: `"${subdomain}" is a reserved subdomain` });

        const result = await query(
            `INSERT INTO microsites (user_id, subdomain, site_title, site_subtitle, accent_color)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, subdomain, site_title || '', site_subtitle || '', accent_color || '#6366f1']
        );
        res.status(201).json({ microsite: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'That subdomain already exists' });
        res.status(500).json({ error: 'Failed to create microsite' });
    }
});

// PUT /api/storefront/microsites/:id — update microsite settings
router.put('/microsites/:id', authenticate, async (req, res) => {
    try {
        const {
            site_title, site_subtitle, accent_color, logo_url,
            optin_enabled, optin_headline, optin_incentive, is_active,
            footer_company_name, footer_website, footer_socials,
            target_store_url, target_store_name, staleness_days,
        } = req.body;

        const result = await query(
            `UPDATE microsites SET
                site_title = COALESCE($1, site_title),
                site_subtitle = COALESCE($2, site_subtitle),
                accent_color = COALESCE($3, accent_color),
                logo_url = COALESCE($4, logo_url),
                optin_enabled = COALESCE($5, optin_enabled),
                optin_headline = COALESCE($6, optin_headline),
                optin_incentive = COALESCE($7, optin_incentive),
                is_active = COALESCE($8, is_active),
                footer_company_name = COALESCE($11, footer_company_name),
                footer_website = COALESCE($12, footer_website),
                footer_socials = COALESCE($13, footer_socials),
                target_store_url = COALESCE($14, target_store_url),
                target_store_name = COALESCE($15, target_store_name),
                staleness_days = COALESCE($16, staleness_days)
             WHERE id = $9 AND user_id = $10 RETURNING *`,
            [
                site_title ?? null, site_subtitle ?? null, accent_color ?? null, logo_url ?? null,
                optin_enabled ?? null, optin_headline ?? null, optin_incentive ?? null, is_active ?? null,
                req.params.id, req.user.id,
                footer_company_name ?? null, footer_website ?? null,
                footer_socials !== undefined ? JSON.stringify(footer_socials) : null,
                target_store_url ?? null, target_store_name ?? null,
                staleness_days !== undefined ? parseInt(staleness_days) || 7 : null,
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Microsite not found' });
        res.json({ microsite: result.rows[0] });
    } catch (err) {
        console.error('Microsite update error:', err);
        res.status(500).json({ error: 'Failed to update microsite' });
    }
});

// PATCH /api/storefront/microsites/:id/ping-content — stamp last_content_at
router.patch('/microsites/:id/ping-content', authenticate, async (req, res) => {
    try {
        const result = await query(
            `UPDATE microsites SET last_content_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id, last_content_at`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Microsite not found' });
        res.json({ ok: true, last_content_at: result.rows[0].last_content_at });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update content timestamp' });
    }
});

// DELETE /api/storefront/microsites/:id
router.delete('/microsites/:id', authenticate, async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM microsites WHERE id = $1 AND user_id = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Microsite not found' });
        res.json({ message: 'Microsite deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete microsite' });
    }
});

// ─── Microsite Products ───

// GET /api/storefront/microsites/:id/products
router.get('/microsites/:id/products', authenticate, async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM microsite_products WHERE microsite_id = $1 AND user_id = $2 ORDER BY sort_order, created_at',
            [req.params.id, req.user.id]
        );
        res.json({ products: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load microsite products' });
    }
});

// POST /api/storefront/microsites/:id/generate-product — scrape + AI generate
router.post('/microsites/:id/generate-product', authenticate, async (req, res) => {
    try {
        const { source_url, affiliate_url } = req.body;
        if (!source_url || !affiliate_url) {
            return res.status(400).json({ error: 'source_url and affiliate_url are required' });
        }

        // Verify microsite belongs to user
        const msCheck = await query('SELECT id FROM microsites WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (msCheck.rows.length === 0) return res.status(404).json({ error: 'Microsite not found' });

        // Step 1: Scrape the product URL
        let parsedUrl;
        try { parsedUrl = new URL(source_url); }
        catch { return res.status(400).json({ error: 'Invalid source URL' }); }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const fetchResponse = await fetch(parsedUrl.href, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'identity',
            },
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!fetchResponse.ok) {
            return res.status(400).json({ error: `Page returned ${fetchResponse.status}` });
        }

        const html = await fetchResponse.text();

        // Extract text content
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
        if (text.length > 15000) text = text.substring(0, 15000);

        // Extract images
        const images = [];
        const seenUrls = new Set();
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)/i);
        if (ogImageMatch?.[1]) {
            try { const u = new URL(ogImageMatch[1], parsedUrl.origin).href; images.push(u); seenUrls.add(u); } catch { }
        }
        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null && images.length < 8) {
            try {
                const u = new URL(imgMatch[1], parsedUrl.origin).href;
                if (seenUrls.has(u)) continue;
                const lower = u.toLowerCase();
                if (lower.includes('icon') || lower.includes('logo') || lower.includes('favicon') ||
                    lower.includes('pixel') || lower.includes('tracker') || lower.endsWith('.svg') ||
                    lower.includes('data:image')) continue;
                images.push(u); seenUrls.add(u);
            } catch { }
        }

        // Extract basic metadata
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
        const productName = titleMatch?.[1]?.replace(/&[^;]+;/g, '').trim() || 'Product';
        const description = metaMatch?.[1]?.trim() || '';

        // Step 2: AI intelligence extraction
        const { extractProductIntelligence, generateArticlePage } = require('../services/ai-writer');
        const { getSetting } = require('../config/settings');
        const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
        let productIntel = null;
        if (apiKey) {
            try { productIntel = await extractProductIntelligence(description + '\n\n' + text, apiKey); }
            catch (e) { console.warn('Intel extraction non-fatal:', e.message); }
        }

        const finalName = productIntel?.productName || productName;
        const finalDesc = productIntel?.description || description || text.substring(0, 300);

        // Step 3: AI generate the showcase page
        const generatedHtml = await generateArticlePage({
            productName: finalName,
            productDescription: finalDesc,
            affiliateLink: affiliate_url,
            style: 'microsite_showcase',
            productIntel,
            images,
        });

        // Step 4: Create slug and save to DB
        const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 100);

        const result = await query(
            `INSERT INTO microsite_products (microsite_id, user_id, source_url, affiliate_url, product_name, product_desc, slug, card_image_url, images, price_label, generated_html, product_intel)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (microsite_id, source_url) DO UPDATE SET
                affiliate_url = $4, product_name = $5, product_desc = $6, slug = $7,
                card_image_url = $8, images = $9, generated_html = $11, product_intel = $12
             RETURNING *`,
            [
                req.params.id, req.user.id, source_url, affiliate_url,
                finalName, finalDesc, slug,
                images[0] || '', JSON.stringify(images),
                productIntel?.pricing?.[0]?.totalPrice || '',
                generatedHtml, JSON.stringify(productIntel || {})
            ]
        );

        res.status(201).json({ product: result.rows[0] });
    } catch (err) {
        console.error('Generate product error:', err);
        if (err.name === 'AbortError') {
            return res.status(408).json({ error: 'Request timed out' });
        }
        res.status(500).json({ error: err.message || 'Failed to generate product page' });
    }
});

// POST /api/storefront/microsites/:id/manual-product — manual entry (no scraping)
router.post('/microsites/:id/manual-product', authenticate, async (req, res) => {
    try {
        const { product_name, description, features, price, cta_url, image_url, selling_points, pricing_tiers } = req.body;
        if (!product_name || !cta_url) {
            return res.status(400).json({ error: 'Product name and CTA/affiliate URL are required' });
        }

        // Verify microsite belongs to user
        const msCheck = await query('SELECT id FROM microsites WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (msCheck.rows.length === 0) return res.status(404).json({ error: 'Microsite not found' });

        // Build product intel from manual input
        const featureList = (features || '').split('\n').map(f => f.trim()).filter(Boolean);
        const spList = (selling_points || '').split('\n').map(s => s.trim()).filter(Boolean);
        const productIntel = {
            productName: product_name,
            description: description || '',
            salesDescription: description || '',
            tagline: '',
            targetAudience: '',
            keyFeatures: featureList.slice(0, 6),
            specifications: {},
            sellingPoints: spList.slice(0, 6).map(s => ({ icon: '✨', title: s.substring(0, 30), detail: '' })),
            pricing: pricing_tiers ? pricing_tiers.split('\n').map(t => {
                const parts = t.split('|').map(p => p.trim());
                return { tier: parts[0] || '', totalPrice: parts[1] || '' };
            }).filter(t => t.tier) : (price ? [{ tier: 'Standard', totalPrice: price }] : []),
            shipping: null,
            warranty: null,
            deliveryTime: null,
            financing: null,
            medicalDiscount: null,
        };

        const images = image_url ? [image_url] : [];
        const slug = product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 100);

        const result = await query(
            `INSERT INTO microsite_products (microsite_id, user_id, source_url, affiliate_url, product_name, product_desc, slug, card_image_url, images, price_label, product_intel)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                req.params.id, req.user.id, `manual://${slug}`, cta_url,
                product_name, description || '', slug,
                image_url || '', JSON.stringify(images),
                price || '',
                JSON.stringify(productIntel)
            ]
        );

        res.status(201).json({ product: result.rows[0] });
    } catch (err) {
        console.error('Manual product error:', err);
        res.status(500).json({ error: err.message || 'Failed to create product' });
    }
});

// PUT /api/storefront/microsites/:msId/products/:prodId — edit an existing product
router.put('/microsites/:msId/products/:prodId', authenticate, async (req, res) => {
    try {
        const { 
            affiliate_url, product_name, product_desc, price_label, card_image_url, slug, sort_order,
            price, compare_at_price, sku, barcode, weight, weight_unit, vendor_name, tags
        } = req.body;

        // Build dynamic SET clause — only update fields that were sent
        const updates = [];
        const params = [];
        let idx = 1;

        if (affiliate_url !== undefined) { updates.push(`affiliate_url = $${idx++}`); params.push(affiliate_url); }
        if (product_name !== undefined) { updates.push(`product_name = $${idx++}`); params.push(product_name); }
        if (product_desc !== undefined) { updates.push(`product_desc = $${idx++}`); params.push(product_desc); }
        if (price_label !== undefined) { updates.push(`price_label = $${idx++}`); params.push(price_label); }
        if (card_image_url !== undefined) { updates.push(`card_image_url = $${idx++}`); params.push(card_image_url); }
        if (slug !== undefined) { updates.push(`slug = $${idx++}`); params.push(slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '')); }
        if (sort_order !== undefined) { updates.push(`sort_order = $${idx++}`); params.push(sort_order); }
        
        // E-commerce fields
        if (price !== undefined) { updates.push(`price = $${idx++}`); params.push(price === '' ? null : price); }
        if (compare_at_price !== undefined) { updates.push(`compare_at_price = $${idx++}`); params.push(compare_at_price === '' ? null : compare_at_price); }
        if (sku !== undefined) { updates.push(`sku = $${idx++}`); params.push(sku); }
        if (barcode !== undefined) { updates.push(`barcode = $${idx++}`); params.push(barcode); }
        if (weight !== undefined) { updates.push(`weight = $${idx++}`); params.push(weight === '' ? null : weight); }
        if (weight_unit !== undefined) { updates.push(`weight_unit = $${idx++}`); params.push(weight_unit || 'kg'); }
        if (vendor_name !== undefined) { updates.push(`vendor_name = $${idx++}`); params.push(vendor_name); }
        if (tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(tags); }

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        params.push(req.params.prodId, req.params.msId, req.user.id);
        const result = await query(
            `UPDATE microsite_products SET ${updates.join(', ')} WHERE id = $${idx++} AND microsite_id = $${idx++} AND user_id = $${idx++} RETURNING *`,
            params
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ product: result.rows[0] });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/storefront/microsites/:msId/products/:prodId
router.delete('/microsites/:msId/products/:prodId', authenticate, async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM microsite_products WHERE id = $1 AND microsite_id = $2 AND user_id = $3 RETURNING id',
            [req.params.prodId, req.params.msId, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove product' });
    }
});

module.exports = router;
