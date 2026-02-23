const { Resend } = require('resend');
const { getSettingSync } = require('../config/settings');

function getResendClient() {
    const apiKey = getSettingSync('resend_api_key');
    if (!apiKey) return null;
    return new Resend(apiKey);
}

async function sendEmail({ to, subject, html, text, from, replyTo, tags, leadId, funnelId }) {
    const client = getResendClient();
    if (!client) {
        throw new Error('Resend not configured. Please add your Resend API key in Admin Settings.');
    }

    const fromEmail = from || getSettingSync('from_email') || 'noreply@dealfindai.com';
    const fromName = getSettingSync('from_name') || 'AffiliateTunnels';
    const appBase = getSettingSync('app_base_url') || '';

    // Build unsubscribe URL for CAN-SPAM / GDPR compliance
    const recipientEmail = Array.isArray(to) ? to[0] : to;
    const unsubUrl = appBase ? `${appBase}/api/emails/unsubscribe?email=${encodeURIComponent(recipientEmail)}&funnel_id=${funnelId || ''}` : '';

    // Append unsubscribe footer to HTML if not already present
    let finalHtml = html;
    if (html && unsubUrl && !html.includes('unsubscribe')) {
        finalHtml += `<div style="text-align:center;padding:20px;font-size:12px;color:#999;border-top:1px solid #eee;margin-top:30px;"><a href="${unsubUrl}" style="color:#999;">Unsubscribe</a></div>`;
    }

    const emailPayload = {
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: finalHtml,
        text,
        reply_to: replyTo,
        tags,
    };

    // Add List-Unsubscribe header (required by major email providers)
    if (unsubUrl) {
        emailPayload.headers = {
            'List-Unsubscribe': `<${unsubUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        };
    }

    const result = await client.emails.send(emailPayload);
    return result;
}

async function sendBatchEmails(emails) {
    const client = getResendClient();
    if (!client) {
        throw new Error('Resend not configured. Please add your Resend API key in Admin Settings.');
    }

    const fromEmail = getSettingSync('from_email') || 'noreply@dealfindai.com';
    const fromName = getSettingSync('from_name') || 'AffiliateTunnels';
    const appBase = getSettingSync('app_base_url') || '';

    const formatted = emails.map(e => {
        const recipientEmail = Array.isArray(e.to) ? e.to[0] : e.to;
        const unsubUrl = appBase ? `${appBase}/api/emails/unsubscribe?email=${encodeURIComponent(recipientEmail)}&funnel_id=${e.funnelId || ''}` : '';
        let finalHtml = e.html;
        if (e.html && unsubUrl && !e.html.includes('unsubscribe')) {
            finalHtml += `<div style="text-align:center;padding:20px;font-size:12px;color:#999;border-top:1px solid #eee;margin-top:30px;"><a href="${unsubUrl}" style="color:#999;">Unsubscribe</a></div>`;
        }
        const payload = {
            from: `${fromName} <${e.from || fromEmail}>`,
            to: Array.isArray(e.to) ? e.to : [e.to],
            subject: e.subject,
            html: finalHtml,
            text: e.text,
            tags: e.tags,
        };
        if (unsubUrl) {
            payload.headers = {
                'List-Unsubscribe': `<${unsubUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            };
        }
        return payload;
    });

    const result = await client.batch.send(formatted);
    return result;
}

module.exports = { sendEmail, sendBatchEmails, getResendClient };
