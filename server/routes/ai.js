/**
 * AI Routes — Article generation and content tools
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateArticlePage } = require('../services/ai-writer');

// Generate article/advertorial landing page content
router.post('/generate-page', authenticate, async (req, res) => {
    try {
        const { productName, productDescription, affiliateLink, style, emailSwipes } = req.body;

        if (!productName || !affiliateLink) {
            return res.status(400).json({ error: 'Product name and affiliate link are required' });
        }

        const html = await generateArticlePage({
            productName,
            productDescription: productDescription || '',
            affiliateLink,
            style: style || 'advertorial',
            emailSwipes: emailSwipes || '',
        });

        res.json({ html });
    } catch (err) {
        console.error('AI generation error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate content' });
    }
});

module.exports = router;
