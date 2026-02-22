const crypto = require('crypto');
const { getSettingSync } = require('../config/settings');
const { query } = require('../config/db');

function verifyClickBankIPN(params, secretKey) {
    // ClickBank IPN verification using SHA-256
    // The secret key is combined with specific transaction fields
    const { cbreceipt, cbtranid, cbpop } = params;
    if (!cbreceipt || !cbtranid || !cbpop) return false;

    const computedPop = crypto
        .createHash('sha256')
        .update(`${cbreceipt}|${secretKey}`)
        .digest('hex')
        .substring(0, 8)
        .toUpperCase();

    return computedPop === cbpop.toUpperCase();
}

async function processIPN(payload) {
    const secretKey = getSettingSync('clickbank_secret_key');

    // Store the raw sale data
    const result = await query(
        `INSERT INTO clickbank_sales
      (transaction_id, product_name, amount, commission, payment_method, customer_email, event_type, raw_payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (transaction_id) DO UPDATE SET
       event_type = EXCLUDED.event_type,
       raw_payload = EXCLUDED.raw_payload
     RETURNING *`,
        [
            payload.transactionId || payload.cbtranid,
            payload.productTitle || payload.cbpid,
            parseFloat(payload.transactionAmount || payload.cbamount || 0),
            parseFloat(payload.affiliateCommission || 0),
            payload.paymentMethod || 'unknown',
            payload.customerEmail || '',
            payload.transactionType || payload.cbtype || 'SALE',
            JSON.stringify(payload),
        ]
    );

    return result.rows[0];
}

async function getSales(userId, options = {}) {
    const { startDate, endDate, limit = 50, offset = 0 } = options;
    let sql = 'SELECT * FROM clickbank_sales WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
        sql += ` AND user_id = $${paramIndex++}`;
        params.push(userId);
    }

    if (startDate) {
        sql += ` AND created_at >= $${paramIndex++}`;
        params.push(startDate);
    }

    if (endDate) {
        sql += ` AND created_at <= $${paramIndex++}`;
        params.push(endDate);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
}

module.exports = { verifyClickBankIPN, processIPN, getSales };
