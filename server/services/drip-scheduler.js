const cron = require('node-cron');
const { query } = require('../config/db');
const { sendEmail } = require('./resend');
const { getSettingSync } = require('../config/settings');

let isRunning = false;

async function processDripQueue() {
    if (isRunning) return;
    isRunning = true;

    try {
        // Get pending emails that are due
        const pending = await query(
            `SELECT dq.id as queue_id, dq.lead_id, dq.drip_email_id,
              de.subject_override,
              et.subject, et.html_content, et.text_content,
              l.email as lead_email, l.name as lead_name, l.is_unsubscribed,
              dc.from_name, dc.from_email
       FROM drip_queue dq
       JOIN drip_emails de ON dq.drip_email_id = de.id
       JOIN email_templates et ON de.email_template_id = et.id
       JOIN leads l ON dq.lead_id = l.id
       JOIN drip_campaigns dc ON de.drip_campaign_id = dc.id
       WHERE dq.status = 'pending'
         AND dq.scheduled_at <= NOW()
         AND l.is_unsubscribed = false
       ORDER BY dq.scheduled_at ASC
       LIMIT 50`,
            []
        );

        if (pending.rows.length === 0) {
            isRunning = false;
            return;
        }

        const appBaseUrl = getSettingSync('app_base_url') || '';
        const physicalAddress = getSettingSync('physical_address') || '';

        for (const item of pending.rows) {
            try {
                // Replace merge tags
                let htmlContent = item.html_content
                    .replace(/\{\{name\}\}/gi, item.lead_name || 'there')
                    .replace(/\{\{email\}\}/gi, item.lead_email);

                // Add CAN-SPAM footer
                const unsubLink = `${appBaseUrl}/api/tracking/unsubscribe?lid=${item.lead_id}`;
                htmlContent += `
          <div style="text-align:center;padding:20px;font-size:11px;color:#999;border-top:1px solid #eee;margin-top:30px;">
            <p>${physicalAddress || 'AffiliateTunnels'}</p>
            <p><a href="${unsubLink}" style="color:#999;">Unsubscribe</a></p>
          </div>
        `;

                const result = await sendEmail({
                    to: item.lead_email,
                    subject: item.subject_override || item.subject,
                    html: htmlContent,
                    text: item.text_content,
                    from: item.from_email || undefined,
                });

                await query(
                    `UPDATE drip_queue SET status = 'sent', sent_at = NOW(), resend_id = $1 WHERE id = $2`,
                    [result?.data?.id || null, item.queue_id]
                );
            } catch (err) {
                console.error(`Drip send failed for queue ${item.queue_id}:`, err.message);
                await query(
                    `UPDATE drip_queue SET status = 'failed', error = $1 WHERE id = $2`,
                    [err.message, item.queue_id]
                );
            }
        }
    } catch (err) {
        console.error('Drip scheduler error:', err);
    } finally {
        isRunning = false;
    }
}

function startDripScheduler() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
        processDripQueue().catch(console.error);
    });

    console.log('✓ Drip email scheduler started (every 5 minutes)');
}

module.exports = { startDripScheduler, processDripQueue };
