const express = require('express');
const { query } = require('../config/db');
const { trackingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/tracking/event - Public endpoint, no auth
router.post('/event', trackingLimiter, async (req, res) => {
    try {
        const { funnel_id, page_id, variant_id, event_type, visitor_id, session_id, page_url, element_id, time_on_page, referrer, utm_source, utm_medium, utm_campaign, metadata } = req.body;

        if (!funnel_id || !event_type) {
            return res.status(400).json({ error: 'funnel_id and event_type required' });
        }

        // Extract device info from user-agent
        const ua = req.headers['user-agent'] || '';
        const deviceType = /mobile|android|iphone/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop';
        const browser = extractBrowser(ua);
        const os = extractOS(ua);

        // Get IP and country (simplified — in production use MaxMind GeoIP)
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

        await query(
            `INSERT INTO analytics_events
        (funnel_id, page_id, variant_id, event_type, visitor_id, session_id, ip_address, device_type, browser, os, referrer, utm_source, utm_medium, utm_campaign, page_url, element_id, time_on_page, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [funnel_id, page_id || null, variant_id || null, event_type, visitor_id || null, session_id || null, ip, deviceType, browser, os, referrer || null, utm_source || null, utm_medium || null, utm_campaign || null, page_url || null, element_id || null, time_on_page || null, JSON.stringify(metadata || {})]
        );

        res.status(204).send();
    } catch (err) {
        // Silently fail for tracking — don't break the user's page
        console.error('Tracking error:', err.message);
        res.status(204).send();
    }
});

// POST /api/tracking/lead - Public lead capture endpoint
router.post('/lead', trackingLimiter, async (req, res) => {
    try {
        const { funnel_id, page_id, email, name, custom_fields, utm_source, utm_medium, utm_campaign, utm_term, utm_content, consent_offer, consent_marketing } = req.body;

        if (!funnel_id || !email) {
            return res.status(400).json({ error: 'funnel_id and email required' });
        }

        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';

        // Upsert lead (don't duplicate same email per funnel)
        const result = await query(
            `INSERT INTO leads (funnel_id, page_id, email, name, custom_fields, utm_source, utm_medium, utm_campaign, utm_term, utm_content, ip_address, user_agent, referrer, consent_offer, consent_marketing, consent_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
       ON CONFLICT DO NOTHING
       RETURNING *`,
            [funnel_id, page_id || null, email.toLowerCase(), name || '', JSON.stringify(custom_fields || {}), utm_source || null, utm_medium || null, utm_campaign || null, utm_term || null, utm_content || null, ip, req.headers['user-agent'] || '', req.headers['referer'] || '', consent_offer || false, consent_marketing || false]
        );

        // Track conversion event
        await query(
            `INSERT INTO analytics_events (funnel_id, page_id, event_type, visitor_id, page_url, metadata)
       VALUES ($1, $2, 'form_submit', $3, $4, $5)`,
            [funnel_id, page_id || null, email.toLowerCase(), req.headers['referer'] || '', JSON.stringify({ email })]
        );

        // Trigger drip campaign enrollment
        if (result.rows.length > 0) {
            await enrollInDrip(funnel_id, result.rows[0].id);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Lead capture error:', err);
        res.status(500).json({ error: 'Failed to capture lead' });
    }
});

// POST /api/tracking/unsubscribe - Public unsubscribe
router.get('/unsubscribe', async (req, res) => {
    try {
        const { lid } = req.query;
        if (!lid) return res.status(400).send('Invalid unsubscribe link');

        await query('UPDATE leads SET is_unsubscribed = true WHERE id = $1', [lid]);
        await query(`UPDATE drip_queue SET status = 'cancelled' WHERE lead_id = $1 AND status = 'pending'`, [lid]);

        res.send(`
      <html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
        <div style="text-align:center;">
          <h2>Unsubscribed</h2>
          <p>You have been successfully unsubscribed and will no longer receive emails.</p>
        </div>
      </body></html>
    `);
    } catch (err) {
        res.status(500).send('Failed to unsubscribe');
    }
});

async function enrollInDrip(funnelId, leadId) {
    try {
        const drip = await query(
            'SELECT id FROM drip_campaigns WHERE funnel_id = $1 AND is_active = true LIMIT 1',
            [funnelId]
        );

        if (drip.rows.length === 0) return;

        const dripEmails = await query(
            'SELECT id, delay_days FROM drip_emails WHERE drip_campaign_id = $1 ORDER BY step_order',
            [drip.rows[0].id]
        );

        for (const email of dripEmails.rows) {
            const scheduledAt = new Date();
            scheduledAt.setDate(scheduledAt.getDate() + email.delay_days);

            await query(
                `INSERT INTO drip_queue (drip_email_id, lead_id, scheduled_at) VALUES ($1, $2, $3)`,
                [email.id, leadId, scheduledAt]
            );
        }
    } catch (err) {
        console.error('Drip enrollment error:', err);
    }
}

function extractBrowser(ua) {
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Edg/i.test(ua)) return 'Edge';
    return 'Other';
}

function extractOS(ua) {
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    if (/Android/i.test(ua)) return 'Android';
    if (/iOS|iPhone|iPad/i.test(ua)) return 'iOS';
    return 'Other';
}

module.exports = router;
