const express = require('express');
const { processIPN, getSales } = require('../services/clickbank');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/clickbank/ipn - Public endpoint for ClickBank postback
router.post('/ipn', async (req, res) => {
    try {
        const sale = await processIPN(req.body);
        console.log('ClickBank IPN processed:', sale.transaction_id, sale.event_type);
        res.json({ received: true });
    } catch (err) {
        console.error('ClickBank IPN error:', err);
        res.status(500).json({ error: 'Failed to process IPN' });
    }
});

// GET /api/clickbank/sales - Authenticated sales list
router.get('/sales', authenticate, async (req, res) => {
    try {
        const { start_date, end_date, limit = 50, offset = 0 } = req.query;
        const sales = await getSales(req.user.id, { startDate: start_date, endDate: end_date, limit: parseInt(limit), offset: parseInt(offset) });

        const total = sales.reduce((sum, s) => sum + parseFloat(s.commission || 0), 0);

        res.json({ sales, totalCommission: total.toFixed(2) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load sales' });
    }
});

module.exports = router;
