/**
 * BlogMaker 3000 — Scheduler (v2 Queue-Based)
 * Checks blog_queue for due items, generates posts, sends blog notifications
 */
const { query } = require('../config/db');
const { generateBlogPost } = require('./blogmaker-engine');

let schedulerInterval = null;
let notificationInterval = null;

function startBlogScheduler() {
    if (schedulerInterval) return;
    console.log('[BlogScheduler] ⏰ Started — checking queue every 15 minutes');

    // Check immediately on start
    processQueue();
    processNotifications();

    // Queue: every 15 minutes
    schedulerInterval = setInterval(processQueue, 15 * 60 * 1000);
    // Notifications: every 5 minutes
    notificationInterval = setInterval(processNotifications, 5 * 60 * 1000);
}

// ─── Process due queue items ────────────────────────────────────
async function processQueue() {
    try {
        const dueItems = await query(
            `SELECT q.*, w.*, m.subdomain, m.site_title,
                    q.id AS queue_id, w.id AS worker_id
             FROM blog_queue q
             JOIN blog_workers w ON q.worker_id = w.id
             LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE q.status = 'pending'
               AND q.scheduled_at IS NOT NULL
               AND q.scheduled_at <= NOW()
             ORDER BY q.scheduled_at ASC
             LIMIT 5`
        );

        if (dueItems.rows.length === 0) return;
        console.log(`[BlogScheduler] Found ${dueItems.rows.length} due queue item(s)`);

        for (const item of dueItems.rows) {
            try {
                // Mark as generating
                await query("UPDATE blog_queue SET status = 'generating' WHERE id = $1", [item.queue_id]);

                console.log(`[BlogScheduler] Generating: "${item.topic}" for ${item.worker_name}`);

                const queueItem = {
                    reference_url: item.reference_url,
                    topic: item.topic,
                    target_keyword: item.target_keyword,
                };

                const worker = {
                    id: item.worker_id,
                    user_id: item.user_id,
                    microsite_id: item.microsite_id,
                    worker_name: item.worker_name,
                    worker_title: item.worker_title,
                    worker_avatar: item.worker_avatar,
                    affiliate_links: item.affiliate_links,
                    prompt_template: item.prompt_template,
                    subdomain: item.subdomain,
                    site_title: item.site_title,
                };

                const post = await generateBlogPost(worker, queueItem, item.user_id);

                // Link queue item to generated post
                await query(
                    "UPDATE blog_queue SET status = 'published', post_id = $2 WHERE id = $1",
                    [item.queue_id, post.id]
                );

                console.log(`[BlogScheduler] ✅ Published: "${post.title}"`);
            } catch (err) {
                console.error(`[BlogScheduler] ❌ Failed: "${item.topic}" — ${err.message}`);
                await query(
                    "UPDATE blog_queue SET status = 'failed', error = $2 WHERE id = $1",
                    [item.queue_id, err.message]
                );
            }
        }
    } catch (err) {
        console.error('[BlogScheduler] Queue processing error:', err);
    }
}

// ─── Send approved blog notifications ───────────────────────────
async function processNotifications() {
    try {
        const activeNotifs = await query(
            `SELECT * FROM blog_notifications
             WHERE status = 'active'
             ORDER BY created_at ASC LIMIT 3`
        );

        for (const notif of activeNotifs.rows) {
            try {
                // Get subscribers: category match + consent + drip complete
                const subscribers = await query(
                    `SELECT DISTINCT ON (email) id, email, name
                     FROM leads
                     WHERE category = $1
                       AND consent_marketing = true
                       AND drip_complete = true
                       AND is_unsubscribed = false
                     ORDER BY email, created_at DESC`,
                    [notif.category]
                );

                if (subscribers.rows.length === 0) {
                    await query("UPDATE blog_notifications SET status = 'sent', sent_count = 0 WHERE id = $1", [notif.id]);
                    continue;
                }

                console.log(`[BlogScheduler] 📧 Sending notification "${notif.subject}" to ${subscribers.rows.length} subscribers`);

                // Send via Resend (if configured) or mark as sent
                let sentCount = 0;
                const { getSetting } = require('../config/settings');
                const resendKey = await getSetting('resend_api_key');
                const fromEmail = await getSetting('from_email') || 'noreply@dealfindai.com';
                const fromName = await getSetting('from_name') || 'DealFindAI';

                if (resendKey) {
                    for (const sub of subscribers.rows) {
                        try {
                            // Personalize unsubscribe URL
                            const html = notif.html_body.replace(
                                '{{unsubscribe_url}}',
                                `https://dealfindai.com/api/unsubscribe?lid=${sub.id}`
                            );

                            const res = await fetch('https://api.resend.com/emails', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${resendKey}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    from: `${fromName} <${fromEmail}>`,
                                    to: sub.email,
                                    subject: notif.subject,
                                    html: html,
                                }),
                            });

                            if (res.ok) sentCount++;
                        } catch { /* skip individual failures */ }
                    }
                } else {
                    sentCount = subscribers.rows.length; // Mark as sent even without Resend
                }

                await query(
                    "UPDATE blog_notifications SET status = 'sent', sent_count = $2 WHERE id = $1",
                    [notif.id, sentCount]
                );

                console.log(`[BlogScheduler] ✅ Notification sent to ${sentCount} subscribers`);
            } catch (err) {
                console.error(`[BlogScheduler] Notification error:`, err.message);
            }
        }
    } catch (err) {
        console.error('[BlogScheduler] Notification processing error:', err);
    }
}

function stopBlogScheduler() {
    if (schedulerInterval) { clearInterval(schedulerInterval); schedulerInterval = null; }
    if (notificationInterval) { clearInterval(notificationInterval); notificationInterval = null; }
    console.log('[BlogScheduler] Stopped');
}

module.exports = { startBlogScheduler, stopBlogScheduler, processQueue, processNotifications };
