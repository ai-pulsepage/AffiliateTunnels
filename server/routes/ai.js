/**
 * AI Routes — Article generation, content improvement, and product scraping
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateArticlePage } = require('../services/ai-writer');

// Generate article/advertorial landing page content
router.post('/generate-page', authenticate, async (req, res) => {
    try {
        const { productName, productDescription, affiliateLink, style, emailSwipes, existingContent } = req.body;

        if (!affiliateLink) {
            return res.status(400).json({ error: 'Affiliate link is required' });
        }

        // Need either product info or existing content to improve
        if (!productName && !existingContent) {
            return res.status(400).json({ error: 'Product name or existing content is required' });
        }

        const html = await generateArticlePage({
            productName: productName || 'Product',
            productDescription: productDescription || '',
            affiliateLink,
            style: style || 'advertorial',
            emailSwipes: emailSwipes || '',
            existingContent: existingContent || '',
        });

        res.json({ html });
    } catch (err) {
        console.error('AI generation error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate content' });
    }
});

// Scrape a product page URL and extract key info
router.post('/scrape-product', authenticate, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        // Fetch the page
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(400).json({ error: `Failed to fetch URL: ${response.status}` });
        }

        const html = await response.text();

        // Extract text content — strip tags, scripts, styles
        let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#\d+;/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Limit text to avoid token overload
        if (text.length > 5000) text = text.substring(0, 5000);

        // Extract title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, '').trim() : '';

        // Extract meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
        const metaDesc = metaMatch ? metaMatch[1].trim() : '';

        res.json({
            productName: title || 'Unknown Product',
            description: metaDesc ? metaDesc + '\n\n' + text : text,
            sourceUrl: url,
        });
    } catch (err) {
        console.error('Scrape error:', err);
        if (err.name === 'AbortError') {
            return res.status(408).json({ error: 'Request timed out — the page took too long to load' });
        }
        res.status(500).json({ error: err.message || 'Failed to scrape product page' });
    }
});

module.exports = router;
