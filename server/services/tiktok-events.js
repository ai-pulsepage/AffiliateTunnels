/**
 * TikTok Events API — Server-side event forwarding
 * Fires alongside the client-side pixel for maximum attribution accuracy.
 * Events are deduplicated by TikTok using event_id.
 *
 * Docs: https://business-api.tiktok.com/portal/docs?id=1771100865818625
 */
const { getSetting } = require('../config/settings');

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

// Map our internal event types to TikTok standard events
const EVENT_MAP = {
    pageview: 'ViewContent',
    click: 'ClickButton',
    form_submit: 'SubmitForm',
    purchase: 'CompletePayment',
};

/**
 * Forward a tracking event to TikTok Events API (fire-and-forget).
 * @param {object} opts
 * @param {string} opts.pixelCode  - TikTok Pixel ID (e.g. D6GVBIBC77U0025UE2S0)
 * @param {string} opts.eventType  - Our internal event type (pageview, click, form_submit, purchase)
 * @param {string} opts.eventId    - Unique event ID for deduplication with client pixel
 * @param {string} opts.ip         - Visitor IP
 * @param {string} opts.userAgent  - Visitor User-Agent
 * @param {string} opts.pageUrl    - Page URL
 * @param {string} opts.referrer   - Referrer URL
 * @param {object} [opts.properties] - Extra properties (e.g. { value: 29.99, currency: 'USD' })
 */
async function forwardToTikTok(opts) {
    try {
        const accessToken = await getSetting('tiktok_events_api_token');
        if (!accessToken || !opts.pixelCode) return; // not configured

        const tiktokEvent = EVENT_MAP[opts.eventType];
        if (!tiktokEvent) return; // not a mapped event (e.g. bounce)

        const payload = {
            pixel_code: opts.pixelCode,
            event: tiktokEvent,
            event_id: opts.eventId || `${opts.eventType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            context: {
                user_agent: opts.userAgent || '',
                ip: opts.ip || '',
                page: {
                    url: opts.pageUrl || '',
                    referrer: opts.referrer || '',
                },
            },
            properties: opts.properties || {},
        };

        const response = await fetch(TIKTOK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': accessToken,
            },
            body: JSON.stringify({ data: [payload] }),
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.warn(`TikTok Events API ${response.status}:`, text.substring(0, 200));
        }
    } catch (err) {
        // Never let TikTok API failures affect tracking
        console.warn('TikTok Events API error (non-fatal):', err.message);
    }
}

module.exports = { forwardToTikTok };
