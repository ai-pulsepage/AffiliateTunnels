const express = require('express');
const { authenticate } = require('../middleware/auth');
const { generateAdsCopy } = require('../services/ai-writer');

const router = express.Router();
router.use(authenticate);

// GET /api/keywords/autocomplete?q=...
router.get('/autocomplete', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ suggestions: [] });

        // Using unofficial Google Suggest API
        const url = `http://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}&hl=en`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch from Google Suggest');
        
        const data = await response.json();
        // data format: [ "query", ["suggestion1", "suggestion2", ...] ]
        const suggestions = data[1] || [];
        
        res.json({ suggestions });
    } catch (err) {
        console.error('Autocomplete Error:', err);
        res.status(500).json({ error: 'Failed to fetch autocomplete suggestions' });
    }
});

// POST /api/keywords/generate-ads
router.post('/generate-ads', async (req, res) => {
    try {
        const { keywords, niche } = req.body;
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of keywords' });
        }

        const adCopy = await generateAdsCopy(keywords, niche);
        res.json({ adCopy });
    } catch (err) {
        console.error('Ad Generation Error:', err);
        res.status(500).json({ error: 'Failed to generate ad copy' });
    }
});

module.exports = router;
