const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const { sendEmail } = require('../services/resend');
const { createCustomer } = require('../services/stripe');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if email exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Create Stripe customer (if Stripe is configured)
        let stripeCustomerId = null;
        try {
            const customer = await createCustomer(email.toLowerCase(), name);
            if (customer) stripeCustomerId = customer.id;
        } catch (err) {
            console.warn('Stripe customer creation skipped:', err.message);
        }

        const result = await query(
            `INSERT INTO users (email, password_hash, name, stripe_customer_id)
       VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, tier`,
            [email.toLowerCase(), passwordHash, name || '', stripeCustomerId]
        );

        const user = result.rows[0];
        const tokens = generateTokens(user.id);

        res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
            ...tokens,
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await query(
            'SELECT id, email, name, role, tier, password_hash, is_suspended FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        if (user.is_suspended) {
            return res.status(403).json({ error: 'Account suspended. Contact support.' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const tokens = generateTokens(user.id);

        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier },
            ...tokens,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const result = await query('SELECT id, is_suspended FROM users WHERE id = $1', [decoded.userId]);

        if (result.rows.length === 0 || result.rows[0].is_suspended) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const tokens = generateTokens(decoded.userId);
        res.json(tokens);
    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        // Always return success to prevent email enumeration
        if (result.rows.length === 0) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await query(
            'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3',
            [token, expires, email.toLowerCase()]
        );

        // Send reset email via Resend
        try {
            const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            await sendEmail({
                to: email.toLowerCase(),
                subject: 'Reset your password - AffiliateTunnels',
                html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${baseUrl}/reset-password?token=${token}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
          <p style="color:#888;margin-top:16px;">If you didn't request this, ignore this email.</p>
        `,
            });
        } catch (emailErr) {
            console.warn('Failed to send reset email:', emailErr.message);
        }

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const result = await query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
            [passwordHash, result.rows[0].id]
        );

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            params.push(name);
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password required to change password' });
            }

            const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
            const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
            if (!valid) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            updates.push(`password_hash = $${paramIndex++}`);
            params.push(await bcrypt.hash(newPassword, 12));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        updates.push(`updated_at = NOW()`);
        params.push(req.user.id);

        const result = await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, tier`,
            params
        );

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

module.exports = router;
