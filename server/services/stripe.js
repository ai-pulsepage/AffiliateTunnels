const Stripe = require('stripe');
const { getSettingSync } = require('../config/settings');

function getStripeClient() {
    const secretKey = getSettingSync('stripe_secret_key');
    if (!secretKey) return null;
    return new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' });
}

async function createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    const stripe = getStripeClient();
    if (!stripe) {
        throw new Error('Stripe not configured. Please add Stripe keys in Admin Settings.');
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
    });

    return session;
}

async function createBillingPortal(customerId, returnUrl) {
    const stripe = getStripeClient();
    if (!stripe) {
        throw new Error('Stripe not configured. Please add Stripe keys in Admin Settings.');
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}

async function createCustomer(email, name) {
    const stripe = getStripeClient();
    if (!stripe) return null;

    const customer = await stripe.customers.create({ email, name });
    return customer;
}

async function getSubscriptions() {
    const stripe = getStripeClient();
    if (!stripe) return { data: [] };

    const subs = await stripe.subscriptions.list({ limit: 100, status: 'all' });
    return subs;
}

async function constructWebhookEvent(body, signature) {
    const stripe = getStripeClient();
    const webhookSecret = getSettingSync('stripe_webhook_secret');
    if (!stripe || !webhookSecret) {
        throw new Error('Stripe webhook not configured');
    }

    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

module.exports = {
    getStripeClient,
    createCheckoutSession,
    createBillingPortal,
    createCustomer,
    getSubscriptions,
    constructWebhookEvent,
};
