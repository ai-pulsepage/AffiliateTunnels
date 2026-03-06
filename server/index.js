process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); process.exit(1); });
process.on('unhandledRejection', (err) => { console.error('UNHANDLED REJECTION:', err); process.exit(1); });
console.log('[BOOT] Starting server...');
try { require('dotenv').config({ path: require('path').join(__dirname, '../.env') }); } catch (e) { }
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV, 'PORT:', process.env.PORT);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { pool } = require('./config/db');
const { loadSettings } = require('./config/settings');
const { apiLimiter } = require('./middleware/rateLimiter');
const { startDripScheduler } = require('./services/drip-scheduler');

// Route imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const funnelRoutes = require('./routes/funnels');
const publishRoutes = require('./routes/publish');
const trackingRoutes = require('./routes/tracking');
const analyticsRoutes = require('./routes/analytics');
const emailRoutes = require('./routes/emails');
const mediaRoutes = require('./routes/media');
const stripeRoutes = require('./routes/stripe');
const clickbankRoutes = require('./routes/clickbank');
const templateRoutes = require('./routes/templates');
const affiliateRoutes = require('./routes/affiliate');
const aiRoutes = require('./routes/ai');
const blogRoutes = require('./routes/blog');
const storefrontRoutes = require('./routes/storefront');
const blogmakerRoutes = require('./routes/blogmaker');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (Railway, Docker, etc.) — required for express-rate-limit with X-Forwarded-For
app.set('trust proxy', 1);

// Security
app.use(helmet({
    contentSecurityPolicy: false, // Flexible for embedded content
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Body parsing (Stripe webhook needs raw body)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting for API routes
app.use('/api', apiLimiter);

// === API Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/funnels', funnelRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/clickbank', clickbankRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/blogmaker', blogmakerRoutes);

// === Public Routes ===

// Cloaked link redirect
app.get('/go/:slug', async (req, res) => {
    try {
        const { query: dbQuery } = require('./config/db');

        const link = await dbQuery('SELECT id, destination_url FROM cloaked_links WHERE slug = $1', [req.params.slug]);
        if (link.rows.length === 0) return res.status(404).send('Link not found');

        // Track click
        const ua = req.headers['user-agent'] || '';
        const deviceType = /mobile|android|iphone/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop';
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
        const visitorId = req.query.vid || ip;

        await dbQuery(
            `INSERT INTO click_tracking (cloaked_link_id, visitor_id, ip_address, device_type, referrer, utm_source)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [link.rows[0].id, visitorId, ip, deviceType, req.headers['referer'] || '', req.query.utm_source || '']
        );

        // Update counters
        await dbQuery(
            `UPDATE cloaked_links SET total_clicks = total_clicks + 1 WHERE id = $1`,
            [link.rows[0].id]
        );

        res.redirect(302, link.rows[0].destination_url);
    } catch (err) {
        console.error('Cloaked redirect error:', err);
        res.redirect(302, '/');
    }
});

// Public funnel page serving
app.get('/p/:funnelSlug/:pageSlug?', async (req, res) => {
    try {
        const { query: dbQuery } = require('./config/db');
        const { funnelSlug, pageSlug } = req.params;

        const funnel = await dbQuery('SELECT id FROM funnels WHERE slug = $1 AND status = $2', [funnelSlug, 'published']);
        if (funnel.rows.length === 0) return res.status(404).send('Page not found');

        let page;
        if (pageSlug) {
            page = await dbQuery('SELECT html_output, css_output, custom_head, custom_body, seo_title, seo_description, og_image_url, id FROM pages WHERE funnel_id = $1 AND slug = $2 AND is_published = true', [funnel.rows[0].id, pageSlug]);
        } else {
            // Default to first page
            page = await dbQuery('SELECT html_output, css_output, custom_head, custom_body, seo_title, seo_description, og_image_url, id FROM pages WHERE funnel_id = $1 AND is_published = true ORDER BY step_order LIMIT 1', [funnel.rows[0].id]);
        }

        if (page.rows.length === 0) return res.status(404).send('Page not found');

        const p = page.rows[0];
        const { generatePublishedHTML } = require('./services/publisher');
        const funnelData = (await dbQuery('SELECT * FROM funnels WHERE id = $1', [funnel.rows[0].id])).rows[0];
        const html = generatePublishedHTML(p, funnelData);

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(html);
    } catch (err) {
        console.error('Public page error:', err);
        res.status(500).send('Something went wrong');
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Serve React app or Storefront based on host
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '../client/dist');

    // Intercept Cloudflare Worker requests BEFORE static middleware
    // Without this, express.static serves index.html for microsite root requests
    app.use(async (req, res, next) => {
        const originalHost = (req.headers['x-original-host'] || '').toLowerCase();
        if (!originalHost) return next(); // Not from Cloudflare Worker, proceed normally

        const parts = originalHost.split('.');
        const subdomain = parts.length >= 3 ? parts[0] : null;
        const RESERVED = ['app', 'www', 'mail', 'api', 'admin', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2'];
        if (!subdomain || RESERVED.includes(subdomain)) return next();

        // Skip API/page/link routes
        if (req.path.startsWith('/api') || req.path.startsWith('/go/') || req.path.startsWith('/p/')) {
            return next();
        }

        try {
            const { query: dbQuery } = require('./config/db');
            const { generateMicrositeHTML } = require('./services/storefront');

            const msResult = await dbQuery(
                'SELECT * FROM microsites WHERE subdomain = $1 AND is_active = true LIMIT 1',
                [subdomain]
            );
            const microsite = msResult.rows[0];
            if (!microsite) return res.status(404).send('<h1 style="font-family:sans-serif;text-align:center;margin-top:100px;color:#666">Microsite not found</h1>');

            // Handle SEO files
            const cleanPath = req.path.replace(/^\//, '').replace(/\/$/, '');
            if (cleanPath === 'robots.txt') {
                res.setHeader('Content-Type', 'text/plain');
                return res.send(`User-agent: *\nAllow: /\nSitemap: https://${subdomain}.dealfindai.com/sitemap.xml`);
            }
            if (cleanPath === 'sitemap.xml') {
                const products = await dbQuery('SELECT slug, created_at FROM microsite_products WHERE microsite_id = $1', [microsite.id]);
                const blogs = await dbQuery("SELECT slug, published_at, updated_at FROM blog_posts WHERE microsite_id = $1 AND status = 'published'", [microsite.id]);
                const base = `https://${subdomain}.dealfindai.com`;
                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
                xml += `<url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n`;
                xml += `<url><loc>${base}/products</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
                xml += `<url><loc>${base}/reviews</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
                xml += `<url><loc>${base}/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
                for (const p of products.rows) xml += `<url><loc>${base}/${p.slug}</loc><lastmod>${(p.created_at || new Date()).toISOString().split('T')[0]}</lastmod><priority>0.9</priority></url>\n`;
                for (const b of blogs.rows) xml += `<url><loc>${base}/blog/${b.slug}</loc><lastmod>${(b.updated_at || b.published_at || new Date()).toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>\n`;
                xml += '</urlset>';
                res.setHeader('Content-Type', 'application/xml');
                return res.send(xml);
            }

            // Load products
            const productsResult = await dbQuery(
                'SELECT * FROM microsite_products WHERE microsite_id = $1 ORDER BY sort_order, created_at',
                [microsite.id]
            );

            // Load blog posts for this microsite
            const blogResult = await dbQuery(
                "SELECT * FROM blog_posts WHERE microsite_id = $1 AND status = 'published' ORDER BY published_at DESC NULLS LAST, created_at DESC",
                [microsite.id]
            );

            // Load reviews (funnels tagged with this microsite's subdomain as category)
            const reviewsResult = await dbQuery(
                "SELECT id, name, slug, thumbnail_url, seo_description FROM funnels WHERE category = $1 AND status = 'published' ORDER BY updated_at DESC",
                [subdomain]
            );

            const pathSlug = cleanPath || null;
            const html = generateMicrositeHTML(microsite, productsResult.rows, pathSlug, blogResult.rows, reviewsResult.rows);
            if (!html) return res.status(404).send('<h1 style="font-family:sans-serif;text-align:center;margin-top:100px;color:#666">Page not found</h1>');

            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.send(html);
        } catch (err) {
            console.error('Microsite Worker intercept error:', err);
            return next();
        }
    });

    app.use(express.static(clientPath));
    app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/go/') || req.path.startsWith('/p/')) {
            return next();
        }

        const host = (req.hostname || '').toLowerCase();
        const isAppSubdomain = host.startsWith('app.');
        const isWww = host.startsWith('www.');
        const RESERVED = ['app', 'www', 'mail', 'api', 'admin', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2'];

        // Cloudflare Worker sends original host via header for wildcard subdomain routing
        const originalHost = (req.headers['x-original-host'] || '').toLowerCase();
        const effectiveHost = originalHost || host;

        // Extract subdomain from the effective host (Cloudflare header takes priority)
        const parts = effectiveHost.split('.');
        const subdomain = parts.length >= 3 ? parts[0] : null;
        const isReserved = subdomain && RESERVED.includes(subdomain);
        const isMicrositeCandidate = subdomain && !isReserved;

        // ─── Route 1: app.* → React SPA ───
        if (isAppSubdomain) {
            return res.sendFile(path.join(clientPath, 'index.html'));
        }

        // ─── Route 2: Microsite subdomain → DB lookup ───
        if (isMicrositeCandidate) {
            try {
                const { query: dbQuery } = require('./config/db');
                const { generateMicrositeHTML } = require('./services/storefront');

                const msResult = await dbQuery(
                    'SELECT * FROM microsites WHERE subdomain = $1 AND is_active = true LIMIT 1',
                    [subdomain]
                );
                const microsite = msResult.rows[0];

                if (microsite) {
                    const productsResult = await dbQuery(
                        'SELECT * FROM microsite_products WHERE microsite_id = $1 ORDER BY sort_order, created_at',
                        [microsite.id]
                    );
                    const products = productsResult.rows;

                    if (products.length > 0) {
                        // Check if path is a product slug (e.g. /sauna-dynamic)
                        const pathSlug = req.path.replace(/^\//, '').replace(/\/$/, '') || null;
                        const html = generateMicrositeHTML(microsite, products, pathSlug);

                        if (html) {
                            res.setHeader('Content-Type', 'text/html');
                            res.setHeader('Cache-Control', 'public, max-age=60');
                            return res.send(html);
                        }
                        // Product slug not found → 404
                        if (pathSlug) {
                            return res.status(404).send('<h1>Product not found</h1>');
                        }
                    }
                }
                // Microsite not found or empty → fall through to 404 or SPA
            } catch (err) {
                console.error('Microsite render error:', err);
            }
        }

        // ─── Route 3: Root domain or www → Corporate Storefront ───
        if (!subdomain || isWww) {
            try {
                const { query: dbQuery } = require('./config/db');
                const { generateStorefrontHTML } = require('./services/storefront');
                const { getSettingSync } = require('./config/settings');

                const settingsResult = await dbQuery('SELECT * FROM storefront_settings LIMIT 1');
                const settings = settingsResult.rows[0] || {};
                const catResult = await dbQuery('SELECT * FROM showcase_categories ORDER BY sort_order, name');
                const itemsResult = await dbQuery(
                    `SELECT si.*, p.slug AS page_slug, f.slug AS funnel_slug, p.seo_title, p.og_image_url
                     FROM showcase_items si
                     JOIN pages p ON si.page_id = p.id
                     JOIN funnels f ON p.funnel_id = f.id
                     WHERE si.is_visible = true AND p.is_published = true
                     ORDER BY si.sort_order, si.created_at DESC`
                );

                const appBaseUrl = getSettingSync('app_base_url') || '';
                const items = itemsResult.rows.map(item => ({
                    ...item,
                    page_url: appBaseUrl
                        ? `${appBaseUrl}/p/${item.funnel_slug}/${item.page_slug}`
                        : `/p/${item.funnel_slug}/${item.page_slug}`,
                    card_image_url: item.card_image_url || item.og_image_url || '',
                }));

                const html = generateStorefrontHTML(settings, catResult.rows, items);
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Cache-Control', 'public, max-age=60');
                return res.send(html);
            } catch (err) {
                console.error('Storefront render error:', err);
            }
        }

        // Fallback → serve React SPA
        res.sendFile(path.join(clientPath, 'index.html'));
    });
} else {
    // Development: add storefront route at / with ?mode=storefront
    app.get('/', async (req, res, next) => {
        if (req.query.mode !== 'storefront') return next();
        try {
            const { query: dbQuery } = require('./config/db');
            const { generateStorefrontHTML } = require('./services/storefront');
            const { getSettingSync } = require('./config/settings');

            const settingsResult = await dbQuery('SELECT * FROM storefront_settings LIMIT 1');
            const settings = settingsResult.rows[0] || {};
            const catResult = await dbQuery('SELECT * FROM showcase_categories ORDER BY sort_order, name');
            const itemsResult = await dbQuery(
                `SELECT si.*, p.slug AS page_slug, f.slug AS funnel_slug, p.seo_title, p.og_image_url
                 FROM showcase_items si
                 JOIN pages p ON si.page_id = p.id
                 JOIN funnels f ON p.funnel_id = f.id
                 WHERE si.is_visible = true AND p.is_published = true
                 ORDER BY si.sort_order, si.created_at DESC`
            );

            const appBaseUrl = getSettingSync('app_base_url') || '';
            const items = itemsResult.rows.map(item => ({
                ...item,
                page_url: appBaseUrl
                    ? `${appBaseUrl}/p/${item.funnel_slug}/${item.page_slug}`
                    : `/p/${item.funnel_slug}/${item.page_slug}`,
                card_image_url: item.card_image_url || item.og_image_url || '',
            }));

            const html = generateStorefrontHTML(settings, catResult.rows, items);
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        } catch (err) {
            console.error('Storefront dev render error:', err);
            next();
        }
    });

    // Development: preview a microsite at /?mode=microsite&subdomain=spas
    app.get('*', async (req, res, next) => {
        if (req.query.mode !== 'microsite' || !req.query.subdomain) return next();
        try {
            const { query: dbQuery } = require('./config/db');
            const { generateMicrositeHTML } = require('./services/storefront');

            const msResult = await dbQuery(
                'SELECT * FROM microsites WHERE subdomain = $1 AND is_active = true LIMIT 1',
                [req.query.subdomain]
            );
            const microsite = msResult.rows[0];
            if (!microsite) return res.status(404).send('Microsite not found');

            const productsResult = await dbQuery(
                'SELECT * FROM microsite_products WHERE microsite_id = $1 ORDER BY sort_order, created_at',
                [microsite.id]
            );

            const pathSlug = req.path.replace(/^\//, '').replace(/\/$/, '') || null;
            const html = generateMicrositeHTML(microsite, productsResult.rows, pathSlug);
            if (!html) return res.status(404).send('Product not found');
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        } catch (err) {
            console.error('Microsite dev render error:', err);
            next();
        }
    });
}

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
    try {
        // Test DB connection
        await pool.query('SELECT NOW()');
        console.log('✓ Database connected');

        // Auto-run pending migrations
        const { migrate } = require('./db/migrate');
        await migrate();
        console.log('✓ Migrations checked');

        // Load settings from DB
        await loadSettings();
        console.log('✓ Settings loaded');

        // Start drip email scheduler
        startDripScheduler();

        app.listen(PORT, () => {
            console.log(`\n🚀 AffiliateTunnels server running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   API: http://localhost:${PORT}/api`);
            console.log(`   Health: http://localhost:${PORT}/api/health\n`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
