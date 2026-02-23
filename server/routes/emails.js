const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// === Unsubscribe (Public, no auth required) ===
// GET /api/emails/unsubscribe — CAN-SPAM unsubscribe endpoint
router.get('/unsubscribe', async (req, res) => {
    try {
        const { email, funnel_id } = req.query;
        if (!email) return res.status(400).send('Missing email parameter');

        await query(
            `UPDATE leads SET is_unsubscribed = true WHERE email = $1 ${funnel_id ? 'AND funnel_id = $2' : ''}`,
            funnel_id ? [email, funnel_id] : [email]
        );

        res.send(`<!DOCTYPE html><html><head><title>Unsubscribed</title></head>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
<h1 style="font-size:24px;color:#333;">You've been unsubscribed</h1>
<p style="color:#666;font-size:16px;">You will no longer receive emails from us.</p>
<p style="color:#999;font-size:14px;margin-top:20px;">If this was a mistake, please contact us.</p>
</body></html>`);
    } catch (err) {
        console.error('Unsubscribe error:', err);
        res.status(500).send('Something went wrong. Please try again.');
    }
});

// All routes below require authentication
router.use(authenticate);
// === Email Templates ===

// GET /api/emails/templates
router.get('/templates', async (req, res) => {
    try {
        const { funnel_id } = req.query;
        let sql = 'SELECT * FROM email_templates WHERE user_id = $1';
        const params = [req.user.id];
        if (funnel_id) {
            params.push(funnel_id);
            sql += ` AND funnel_id = $${params.length}`;
        }
        sql += ' ORDER BY updated_at DESC';
        const result = await query(sql, params);
        res.json({ templates: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list templates' });
    }
});

// POST /api/emails/templates
router.post('/templates', async (req, res) => {
    try {
        const { name, subject, html_content, text_content, category, funnel_id } = req.body;
        if (!name || !subject || !html_content) {
            return res.status(400).json({ error: 'Name, subject, and HTML content required' });
        }

        const result = await query(
            `INSERT INTO email_templates (user_id, name, subject, html_content, text_content, category, funnel_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, name, subject, html_content, text_content || '', category || null, funnel_id || null]
        );

        res.status(201).json({ template: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// PUT /api/emails/templates/:id
router.put('/templates/:id', async (req, res) => {
    try {
        const { name, subject, html_content, text_content, category } = req.body;
        const result = await query(
            `UPDATE email_templates SET
        name = COALESCE($1, name), subject = COALESCE($2, subject),
        html_content = COALESCE($3, html_content), text_content = COALESCE($4, text_content),
        category = COALESCE($5, category), updated_at = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
            [name, subject, html_content, text_content, category, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
        res.json({ template: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// DELETE /api/emails/templates/:id
router.delete('/templates/:id', async (req, res) => {
    try {
        const result = await query('DELETE FROM email_templates WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Template not found' });
        res.json({ message: 'Template deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// === Drip Campaigns ===

// GET /api/emails/drips/:funnelId
router.get('/drips/:funnelId', async (req, res) => {
    try {
        const drip = await query(
            `SELECT dc.*,
        (SELECT json_agg(
          json_build_object(
            'id', de.id, 'step_order', de.step_order, 'delay_days', de.delay_days,
            'subject_override', de.subject_override, 'email_template_id', de.email_template_id,
            'template_name', et.name, 'template_subject', et.subject
          ) ORDER BY de.step_order
        ) FROM drip_emails de LEFT JOIN email_templates et ON de.email_template_id = et.id
        WHERE de.drip_campaign_id = dc.id) as emails
       FROM drip_campaigns dc WHERE dc.funnel_id = $1`,
            [req.params.funnelId]
        );

        res.json({ drip: drip.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get drip campaign' });
    }
});

// POST /api/emails/drips/:funnelId
router.post('/drips/:funnelId', async (req, res) => {
    try {
        const { name, from_name, from_email } = req.body;

        // Verify funnel ownership
        const funnel = await query('SELECT id FROM funnels WHERE id = $1 AND user_id = $2', [req.params.funnelId, req.user.id]);
        if (funnel.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        const result = await query(
            `INSERT INTO drip_campaigns (funnel_id, name, from_name, from_email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.params.funnelId, name || 'Drip Campaign', from_name || null, from_email || null]
        );

        res.status(201).json({ drip: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create drip campaign' });
    }
});

// PUT /api/emails/drips/:id/activate
router.put('/drips/:id/activate', async (req, res) => {
    try {
        const { is_active } = req.body;
        const result = await query(
            'UPDATE drip_campaigns SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [is_active !== false, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Drip not found' });
        res.json({ drip: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update drip' });
    }
});

// POST /api/emails/drips/:id/emails - Add step
router.post('/drips/:id/emails', async (req, res) => {
    try {
        const { email_template_id, delay_days, subject_override } = req.body;
        if (!email_template_id || delay_days === undefined) {
            return res.status(400).json({ error: 'email_template_id and delay_days required' });
        }

        const maxOrder = await query(
            'SELECT COALESCE(MAX(step_order), -1) + 1 as next FROM drip_emails WHERE drip_campaign_id = $1',
            [req.params.id]
        );

        const result = await query(
            `INSERT INTO drip_emails (drip_campaign_id, email_template_id, step_order, delay_days, subject_override)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.params.id, email_template_id, maxOrder.rows[0].next, delay_days, subject_override || null]
        );

        res.status(201).json({ email: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add drip email' });
    }
});

// PUT /api/emails/drips/:id/emails/:emailId
router.put('/drips/:id/emails/:emailId', async (req, res) => {
    try {
        const { email_template_id, delay_days, subject_override, step_order } = req.body;
        const result = await query(
            `UPDATE drip_emails SET
        email_template_id = COALESCE($1, email_template_id),
        delay_days = COALESCE($2, delay_days),
        subject_override = COALESCE($3, subject_override),
        step_order = COALESCE($4, step_order)
       WHERE id = $5 AND drip_campaign_id = $6 RETURNING *`,
            [email_template_id, delay_days, subject_override, step_order, req.params.emailId, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Drip email not found' });
        res.json({ email: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update drip email' });
    }
});

// DELETE /api/emails/drips/:id/emails/:emailId
router.delete('/drips/:id/emails/:emailId', async (req, res) => {
    try {
        const result = await query(
            'DELETE FROM drip_emails WHERE id = $1 AND drip_campaign_id = $2 RETURNING id',
            [req.params.emailId, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Drip email not found' });
        res.json({ message: 'Drip email removed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete drip email' });
    }
});

// === Email Metrics ===

// GET /api/emails/metrics/:funnelId
router.get('/metrics/:funnelId', async (req, res) => {
    try {
        const result = await query(
            `SELECT
        COUNT(*) FILTER (WHERE dq.status = 'sent') as sent,
        COUNT(*) FILTER (WHERE dq.status = 'pending') as pending,
        COUNT(*) FILTER (WHERE dq.status = 'failed') as failed,
        COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'opened') as opens,
        COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'clicked') as clicks,
        COUNT(DISTINCT ee.id) FILTER (WHERE ee.event_type = 'bounced') as bounces
       FROM drip_queue dq
       JOIN drip_emails de ON dq.drip_email_id = de.id
       JOIN drip_campaigns dc ON de.drip_campaign_id = dc.id
       LEFT JOIN email_events ee ON ee.drip_queue_id = dq.id
       WHERE dc.funnel_id = $1`,
            [req.params.funnelId]
        );

        res.json({ metrics: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load email metrics' });
    }
});

// === Leads ===

// GET /api/emails/leads/:funnelId
router.get('/leads/:funnelId', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(
            'SELECT * FROM leads WHERE funnel_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [req.params.funnelId, parseInt(limit), parseInt(offset)]
        );

        const count = await query('SELECT COUNT(*) as total FROM leads WHERE funnel_id = $1', [req.params.funnelId]);

        res.json({ leads: result.rows, total: parseInt(count.rows[0].total) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list leads' });
    }
});

// GET /api/emails/leads/:funnelId/export
router.get('/leads/:funnelId/export', async (req, res) => {
    try {
        const result = await query(
            'SELECT email, name, utm_source, utm_medium, utm_campaign, is_unsubscribed, created_at FROM leads WHERE funnel_id = $1 ORDER BY created_at DESC',
            [req.params.funnelId]
        );

        const headers = ['email', 'name', 'utm_source', 'utm_medium', 'utm_campaign', 'is_unsubscribed', 'created_at'];
        const csv = [headers.join(','), ...result.rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leads-${req.params.funnelId}.csv`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Failed to export leads' });
    }
});

module.exports = router;
