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

const app = express();
const PORT = process.env.PORT || 3001;

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

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/go/') && !req.path.startsWith('/p/')) {
            res.sendFile(path.join(clientPath, 'index.html'));
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
