const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: { error: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

const trackingLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 50,
    message: '',
    standardHeaders: false,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, trackingLimiter };
