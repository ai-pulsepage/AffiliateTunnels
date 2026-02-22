const express = require('express');
const { query } = require('../config/db');
const { constructWebhookEvent, createCheckoutSession, createBillingPortal } = require('../services/stripe');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/stripe/webhook - Stripe webhook handler (raw body required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const event = await constructWebhookEvent(req.body, sig);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.mode === 'subscription') {
                    const sub = session.subscription;
                    // Will be handled by customer.subscription.created
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const priceId = sub.items?.data?.[0]?.price?.id;
                const tier = await determineTier(priceId);

                await query(
                    `INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_price_id, tier, status, current_period_start, current_period_end, cancel_at)
           VALUES ((SELECT id FROM users WHERE stripe_customer_id = $1), $2, $3, $4, $5, to_timestamp($6), to_timestamp($7), $8)
           ON CONFLICT (stripe_subscription_id) DO UPDATE SET
             stripe_price_id = EXCLUDED.stripe_price_id, tier = EXCLUDED.tier, status = EXCLUDED.status,
             current_period_start = EXCLUDED.current_period_start, current_period_end = EXCLUDED.current_period_end,
             cancel_at = EXCLUDED.cancel_at, updated_at = NOW()`,
                    [sub.customer, sub.id, priceId, tier, sub.status, sub.current_period_start, sub.current_period_end, sub.cancel_at ? new Date(sub.cancel_at * 1000) : null]
                );

                // Update user tier
                await query(
                    'UPDATE users SET tier = $1, updated_at = NOW() WHERE stripe_customer_id = $2',
                    [tier, sub.customer]
                );
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                await query(
                    `UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE stripe_subscription_id = $1`,
                    [sub.id]
                );
                await query(
                    `UPDATE users SET tier = 'free', updated_at = NOW() WHERE stripe_customer_id = $1`,
                    [sub.customer]
                );
                break;
            }

            default:
                break;
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Stripe webhook error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

async function determineTier(priceId) {
    const { getSetting } = require('../config/settings');
    const proPriceId = await getSetting('stripe_pro_price_id');
    const agencyPriceId = await getSetting('stripe_agency_price_id');

    if (priceId === agencyPriceId) return 'agency';
    if (priceId === proPriceId) return 'pro';
    return 'free';
}

// === Billing endpoints (authenticated) ===

// POST /api/stripe/checkout - Create checkout session
router.post('/checkout', authenticate, async (req, res) => {
    try {
        const { priceId } = req.body;
        if (!priceId) return res.status(400).json({ error: 'priceId required' });

        const user = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
        const customerId = user.rows[0]?.stripe_customer_id;
        if (!customerId) return res.status(400).json({ error: 'No Stripe customer ID. Please contact support.' });

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const session = await createCheckoutSession(
            customerId, priceId,
            `${baseUrl}/settings?checkout=success`,
            `${baseUrl}/settings?checkout=cancel`
        );
        res.json({ url: session.url });
    } catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ error: err.message || 'Failed to create checkout' });
    }
});

// POST /api/stripe/portal - Create billing portal
router.post('/portal', authenticate, async (req, res) => {
    try {
        const user = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
        const customerId = user.rows[0]?.stripe_customer_id;
        if (!customerId) return res.status(400).json({ error: 'No Stripe customer ID' });

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const session = await createBillingPortal(customerId, `${baseUrl}/settings`);
        res.json({ url: session.url });
    } catch (err) {
        console.error('Portal error:', err);
        res.status(500).json({ error: err.message || 'Failed to open portal' });
    }
});

// GET /api/stripe/subscription - Get current subscription
router.get('/subscription', authenticate, async (req, res) => {
    try {
        const sub = await query(
            `SELECT s.*, u.tier, u.stripe_customer_id FROM subscriptions s
             JOIN users u ON u.id = s.user_id
             WHERE s.user_id = $1 AND s.status IN ('active', 'trialing', 'past_due')
             ORDER BY s.created_at DESC LIMIT 1`,
            [req.user.id]
        );
        res.json({ subscription: sub.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load subscription' });
    }
});

module.exports = router;
