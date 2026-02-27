const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { encrypt, decrypt } = require('../services/crypto');
const { sendEmail } = require('../services/resend');
const { getSubscriptions } = require('../services/stripe');
const { SETTINGS_KEYS } = require('../../shared/constants');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/settings - Get all settings (decrypted for admin)
router.get('/settings', async (req, res) => {
    try {
        const result = await query('SELECT key, value, is_encrypted, description FROM settings ORDER BY key');
        const settings = result.rows.map(row => ({
            key: row.key,
            value: row.is_encrypted && row.value ? decrypt(row.value) : row.value,
            isEncrypted: row.is_encrypted,
            description: row.description,
        }));

        // Mask sensitive values for display
        const masked = settings.map(s => ({
            ...s,
            displayValue: s.isEncrypted && s.value
                ? s.value.substring(0, 4) + '****' + s.value.substring(s.value.length - 4)
                : s.value,
        }));

        res.json({ settings: masked, rawSettings: settings });
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

// PUT /api/admin/settings - Update settings
router.put('/settings', async (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object required' });
        }

        for (const [key, value] of Object.entries(settings)) {
            if (!SETTINGS_KEYS.includes(key)) continue;

            // Check if this key should be encrypted
            const existing = await query('SELECT is_encrypted FROM settings WHERE key = $1', [key]);
            const isEncrypted = existing.rows.length > 0 ? existing.rows[0].is_encrypted : false;

            const storedValue = isEncrypted && value ? encrypt(value) : value;

            await query(
                `INSERT INTO settings (key, value, is_encrypted, updated_at) VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                [key, storedValue, isEncrypted]
            );
        }

        // Force settings reload
        const { loadSettings } = require('../config/settings');
        await loadSettings();

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let sql = `SELECT id, email, name, role, tier, is_suspended, created_at,
               (SELECT COUNT(*) FROM funnels WHERE user_id = users.id) as funnel_count
               FROM users`;
        const params = [];
        let paramIndex = 1;

        if (search) {
            sql += ` WHERE email ILIKE $${paramIndex} OR name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await query(sql, params);

        const countResult = await query('SELECT COUNT(*) as total FROM users');

        res.json({
            users: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// PUT /api/admin/users/:id/suspend - Toggle suspend
router.put('/users/:id/suspend', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE users SET is_suspended = NOT is_suspended, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_suspended',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Suspend user error:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User ${result.rows[0].email} deleted` });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET /api/admin/stats - System-wide statistics
router.get('/stats', async (req, res) => {
    try {
        const [users, funnels, pages, leads, events] = await Promise.all([
            query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE created_at > NOW() - interval \'30 days\') as last_30 FROM users'),
            query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'published\') as published FROM funnels'),
            query('SELECT COUNT(*) as total FROM pages'),
            query('SELECT COUNT(*) as total FROM leads'),
            query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE created_at > NOW() - interval \'24 hours\') as last_24h FROM analytics_events'),
        ]);

        res.json({
            users: { total: parseInt(users.rows[0].total), last30Days: parseInt(users.rows[0].last_30) },
            funnels: { total: parseInt(funnels.rows[0].total), published: parseInt(funnels.rows[0].published) },
            pages: { total: parseInt(pages.rows[0].total) },
            leads: { total: parseInt(leads.rows[0].total) },
            events: { total: parseInt(events.rows[0].total), last24h: parseInt(events.rows[0].last_24h) },
        });
    } catch (err) {
        console.error('System stats error:', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// POST /api/admin/broadcast - Send email to all users
router.post('/broadcast', async (req, res) => {
    try {
        const { subject, html } = req.body;
        if (!subject || !html) {
            return res.status(400).json({ error: 'Subject and HTML content required' });
        }

        const result = await query('SELECT email FROM users WHERE is_suspended = false');
        const emails = result.rows.map(r => r.email);

        let sent = 0;
        let failed = 0;

        // Send in batches of 10
        for (let i = 0; i < emails.length; i += 10) {
            const batch = emails.slice(i, i + 10);
            for (const email of batch) {
                try {
                    await sendEmail({ to: email, subject, html });
                    sent++;
                } catch (err) {
                    failed++;
                    console.error(`Broadcast to ${email} failed:`, err.message);
                }
            }
        }

        res.json({ message: `Broadcast sent: ${sent} delivered, ${failed} failed`, sent, failed });
    } catch (err) {
        console.error('Broadcast error:', err);
        res.status(500).json({ error: 'Failed to send broadcast' });
    }
});

// GET /api/admin/health - Server health
router.get('/health', async (req, res) => {
    try {
        const dbCheck = await query('SELECT NOW()');
        const memUsage = process.memoryUsage();

        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            memory: {
                rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
                heap: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
            },
            database: 'connected',
            timestamp: dbCheck.rows[0].now,
        });
    } catch (err) {
        res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

// GET /api/admin/billing - Stripe billing overview
router.get('/billing', async (req, res) => {
    try {
        const tierCounts = await query(
            `SELECT tier, COUNT(*) as count FROM users GROUP BY tier`
        );

        let stripeSubs = { data: [] };
        try {
            stripeSubs = await getSubscriptions();
        } catch (err) {
            console.warn('Stripe not configured:', err.message);
        }

        const activeSubs = stripeSubs.data.filter(s => s.status === 'active');
        const mrr = activeSubs.reduce((sum, s) => sum + (s.items?.data?.[0]?.price?.unit_amount || 0), 0);

        res.json({
            tiers: tierCounts.rows,
            subscriptions: {
                active: activeSubs.length,
                total: stripeSubs.data.length,
            },
            mrr: mrr / 100,
        });
    } catch (err) {
        console.error('Billing stats error:', err);
        res.status(500).json({ error: 'Failed to load billing data' });
    }
});

// GET /api/admin/feature-flags
router.get('/feature-flags', async (req, res) => {
    const { TIER_LIMITS } = require('../../shared/constants');
    res.json({ flags: TIER_LIMITS });
});

// POST /api/admin/test-tiktok - Fire a test event to TikTok Events API
router.post('/test-tiktok', async (req, res) => {
    try {
        const { getSetting } = require('../config/settings');
        const accessToken = await getSetting('tiktok_events_api_token');
        const pixelId = await getSetting('default_tiktok_pixel_id');

        if (!accessToken) return res.status(400).json({ error: 'TikTok Events API token not configured' });
        if (!pixelId) return res.status(400).json({ error: 'Default TikTok Pixel ID not configured' });

        const payload = {
            event_source: 'web',
            event_source_id: pixelId,
            data: [{
                event: 'ViewContent',
                event_id: `test_${Date.now()}`,
                event_time: Math.floor(Date.now() / 1000),
                user: {
                    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '',
                    user_agent: req.headers['user-agent'] || 'AffiliateTunnels Test',
                },
                page: { url: 'https://test.example.com/test-page', referrer: '' },
                properties: {
                    contents: [{ content_id: 'test-001', content_type: 'product', content_name: 'Test Event' }],
                    value: 0,
                    currency: 'USD',
                },
            }],
        };

        const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Access-Token': accessToken },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok && result.code === 0) {
            res.json({ success: true, message: 'Test event sent successfully!', response: result });
        } else {
            res.json({ success: false, message: result.message || 'TikTok API error', response: result });
        }
    } catch (err) {
        console.error('TikTok test error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
