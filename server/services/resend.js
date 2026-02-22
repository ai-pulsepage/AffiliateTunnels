const { Resend } = require('resend');
const { getSettingSync } = require('../config/settings');

function getResendClient() {
    const apiKey = getSettingSync('resend_api_key');
    if (!apiKey) return null;
    return new Resend(apiKey);
}

async function sendEmail({ to, subject, html, text, from, replyTo, tags }) {
    const client = getResendClient();
    if (!client) {
        throw new Error('Resend not configured. Please add your Resend API key in Admin Settings.');
    }

    const fromEmail = from || getSettingSync('from_email') || 'noreply@dealfindai.com';
    const fromName = getSettingSync('from_name') || 'AffiliateTunnels';

    const result = await client.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
        tags,
    });

    return result;
}

async function sendBatchEmails(emails) {
    const client = getResendClient();
    if (!client) {
        throw new Error('Resend not configured. Please add your Resend API key in Admin Settings.');
    }

    const fromEmail = getSettingSync('from_email') || 'noreply@dealfindai.com';
    const fromName = getSettingSync('from_name') || 'AffiliateTunnels';

    const formatted = emails.map(e => ({
        from: `${fromName} <${e.from || fromEmail}>`,
        to: Array.isArray(e.to) ? e.to : [e.to],
        subject: e.subject,
        html: e.html,
        text: e.text,
        tags: e.tags,
    }));

    const result = await client.batch.send(formatted);
    return result;
}

module.exports = { sendEmail, sendBatchEmails, getResendClient };
