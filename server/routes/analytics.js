const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/analytics/funnel/:funnelId
router.get('/funnel/:funnelId', async (req, res) => {
    try {
        const { funnelId } = req.params;
        const { start_date, end_date, page_id } = req.query;

        const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = end_date || new Date().toISOString();

        // Verify ownership
        const funnel = await query('SELECT id FROM funnels WHERE id = $1 AND user_id = $2', [funnelId, req.user.id]);
        if (funnel.rows.length === 0) return res.status(404).json({ error: 'Funnel not found' });

        let pageFilter = '';
        const params = [funnelId, startDate, endDate];
        if (page_id) {
            pageFilter = ' AND page_id = $4';
            params.push(page_id);
        }

        const [overview, daily, sources, devices, browsers, pages] = await Promise.all([
            query(`SELECT
        COUNT(*) FILTER (WHERE event_type = 'pageview') as page_views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'pageview') as unique_visitors,
        COUNT(*) FILTER (WHERE event_type = 'form_submit') as conversions,
        COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
        AVG(time_on_page) FILTER (WHERE event_type = 'bounce' AND time_on_page IS NOT NULL) as avg_time_on_page,
        COUNT(*) FILTER (WHERE event_type = 'bounce' AND time_on_page < 10) as bounces
        FROM analytics_events WHERE funnel_id = $1 AND created_at BETWEEN $2 AND $3${pageFilter}`, params),

            query(`SELECT DATE(created_at) as date,
        COUNT(*) FILTER (WHERE event_type = 'pageview') as views,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'pageview') as unique_visitors,
        COUNT(*) FILTER (WHERE event_type = 'form_submit') as conversions
        FROM analytics_events WHERE funnel_id = $1 AND created_at BETWEEN $2 AND $3${pageFilter}
        GROUP BY DATE(created_at) ORDER BY date`, params),

            query(`SELECT
        CASE
          WHEN utm_source IS NOT NULL AND utm_source != '' THEN utm_source
          WHEN referrer ILIKE '%google%' THEN 'google'
          WHEN referrer ILIKE '%facebook%' OR referrer ILIKE '%fb%' THEN 'facebook'
          WHEN referrer IS NULL OR referrer = '' THEN 'direct'
          ELSE 'other'
        END as source,
        COUNT(*) as count
        FROM analytics_events WHERE funnel_id = $1 AND event_type = 'pageview' AND created_at BETWEEN $2 AND $3${pageFilter}
        GROUP BY source ORDER BY count DESC LIMIT 10`, params),

            query(`SELECT device_type, COUNT(*) as count
        FROM analytics_events WHERE funnel_id = $1 AND event_type = 'pageview' AND created_at BETWEEN $2 AND $3${pageFilter}
        GROUP BY device_type`, params),

            query(`SELECT browser, COUNT(*) as count
        FROM analytics_events WHERE funnel_id = $1 AND event_type = 'pageview' AND created_at BETWEEN $2 AND $3${pageFilter}
        GROUP BY browser ORDER BY count DESC`, params),

            query(`SELECT p.name, p.id,
        COUNT(*) FILTER (WHERE ae.event_type = 'pageview') as views,
        COUNT(*) FILTER (WHERE ae.event_type = 'form_submit') as conversions
        FROM pages p LEFT JOIN analytics_events ae ON ae.page_id = p.id
          AND ae.created_at BETWEEN $2 AND $3
        WHERE p.funnel_id = $1
        GROUP BY p.id, p.name ORDER BY p.name`, params),
        ]);

        const ov = overview.rows[0];
        const convRate = ov.unique_visitors > 0 ? ((ov.conversions / ov.unique_visitors) * 100).toFixed(2) : 0;
        const bounceRate = ov.page_views > 0 ? ((ov.bounces / ov.page_views) * 100).toFixed(2) : 0;

        res.json({
            overview: {
                pageViews: parseInt(ov.page_views),
                uniqueVisitors: parseInt(ov.unique_visitors),
                conversions: parseInt(ov.conversions),
                clicks: parseInt(ov.clicks),
                conversionRate: parseFloat(convRate),
                bounceRate: parseFloat(bounceRate),
                avgTimeOnPage: Math.round(parseFloat(ov.avg_time_on_page || 0)),
            },
            daily: daily.rows,
            sources: sources.rows,
            devices: devices.rows,
            browsers: browsers.rows,
            pages: pages.rows,
            dateRange: { start: startDate, end: endDate },
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Failed to load analytics' });
    }
});

// GET /api/analytics/export/:funnelId - CSV export
router.get('/export/:funnelId', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = end_date || new Date().toISOString();

        const result = await query(
            `SELECT event_type, visitor_id, device_type, browser, os, referrer, utm_source, utm_medium, utm_campaign, page_url, created_at
       FROM analytics_events WHERE funnel_id = $1 AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC LIMIT 10000`,
            [req.params.funnelId, startDate, endDate]
        );

        const headers = ['event_type', 'visitor_id', 'device_type', 'browser', 'os', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'page_url', 'created_at'];
        const csv = [headers.join(','), ...result.rows.map(r => headers.map(h => `"${(r[h] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${req.params.funnelId}.csv`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Failed to export' });
    }
});

module.exports = router;
