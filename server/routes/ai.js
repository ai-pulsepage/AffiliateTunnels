/**
 * AI Routes — Article generation, content improvement, and product scraping
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateArticlePage, extractProductIntelligence } = require('../services/ai-writer');

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
            style: style || 'review_article',
            emailSwipes: emailSwipes || '',
            existingContent: existingContent || '',
            productIntel: req.body.productIntel || null,
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

        // Validate URL format
        let parsedUrl;
        try { parsedUrl = new URL(url); }
        catch { return res.status(400).json({ error: 'Invalid URL format' }); }

        // Fetch the page with generous timeout and redirect following
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(parsedUrl.href, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'identity',
                'Cache-Control': 'no-cache',
            },
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(400).json({ error: `Page returned ${response.status} — the site may block scraping. Try entering the product info manually.` });
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

        // Limit text — generous for Gemini extraction
        if (text.length > 15000) text = text.substring(0, 15000);

        // Extract title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, '').trim() : '';

        // Extract meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);
        const metaDesc = metaMatch ? metaMatch[1].trim() : '';

        // Extract OG title/description as fallback
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)/i);

        const productName = title || ogTitleMatch?.[1] || 'Unknown Product';
        const description = metaDesc || ogDescMatch?.[1] || '';

        // Run Gemini extraction to get structured product intelligence
        let productIntel = null;
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey) {
                const fullText = description ? description + '\n\n' + text : text;
                productIntel = await extractProductIntelligence(fullText, apiKey);
            }
        } catch (err) {
            console.warn('Product intelligence extraction failed (non-fatal):', err.message);
        }

        res.json({
            productName: productIntel?.productName || productName,
            description: description ? description + '\n\n' + text : text,
            sourceUrl: url,
            productIntel,
        });
    } catch (err) {
        console.error('Scrape error:', err);
        if (err.name === 'AbortError') {
            return res.status(408).json({ error: 'Request timed out — the page took too long to load. Try entering product info manually.' });
        }
        res.status(500).json({ error: `Scrape failed: ${err.message}. Try entering the product info manually.` });
    }
});

// Clone a page — download full HTML, re-host images to R2, rewrite links
router.post('/clone-page', authenticate, async (req, res) => {
    try {
        const { url, hopLink } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        let parsedUrl;
        try { parsedUrl = new URL(url); }
        catch { return res.status(400).json({ error: 'Invalid URL format' }); }

        // Fetch the page
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(parsedUrl.href, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'identity',
            },
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(400).json({ error: `Page returned ${response.status}. Try a different URL.` });
        }

        let html = await response.text();

        // Remove <script> and <link rel="stylesheet"> that reference external domains
        html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');

        // Extract and keep only inline styles + <style> blocks
        // Find all images and re-host them
        const { uploadFile } = require('../services/r2');
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const imageMatches = [];
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            imageMatches.push({ fullMatch: match[0], src: match[1] });
        }

        // Also find CSS background-image URLs
        const bgRegex = /background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi;
        const bgMatches = [];
        while ((match = bgRegex.exec(html)) !== null) {
            bgMatches.push({ fullMatch: match[0], src: match[1] });
        }

        // Download and re-host images (limit to 30 to avoid abuse)
        const allImages = [...imageMatches.map(m => m.src), ...bgMatches.map(m => m.src)];
        const uniqueUrls = [...new Set(allImages)].slice(0, 30);
        const urlMap = {};

        for (const imgUrl of uniqueUrls) {
            try {
                // Resolve relative URLs
                let absoluteUrl;
                try { absoluteUrl = new URL(imgUrl, parsedUrl.href).href; }
                catch { continue; }

                // Skip data: URIs and SVGs
                if (absoluteUrl.startsWith('data:') || absoluteUrl.endsWith('.svg')) continue;

                const imgResp = await fetch(absoluteUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    signal: AbortSignal.timeout(10000),
                });
                if (!imgResp.ok) continue;

                const buffer = Buffer.from(await imgResp.arrayBuffer());
                if (buffer.length < 100 || buffer.length > 10 * 1024 * 1024) continue; // skip tiny/huge

                const contentType = imgResp.headers.get('content-type') || 'image/jpeg';
                const ext = contentType.includes('png') ? '.png' : contentType.includes('gif') ? '.gif' : contentType.includes('webp') ? '.webp' : '.jpg';
                const filename = `cloned_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;

                const uploaded = await uploadFile(buffer, filename, contentType, 'cloned');
                urlMap[imgUrl] = uploaded.url;
            } catch (err) {
                // Skip failed images silently
                console.warn(`Failed to clone image ${imgUrl}:`, err.message);
            }
        }

        // Replace image src URLs with R2 URLs
        for (const [originalUrl, r2Url] of Object.entries(urlMap)) {
            // Escape special regex chars in URL
            const escaped = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            html = html.replace(new RegExp(escaped, 'g'), r2Url);
        }

        // Rewrite all <a> href to hop link (if provided)
        if (hopLink) {
            html = html.replace(/<a\s+([^>]*?)href=["'][^"']*["']/gi, (match, before) => {
                // Skip anchor links and mailto
                if (match.includes('mailto:') || match.includes('href="#')) return match;
                return `<a ${before}href="${hopLink}"`;
            });
        }

        // Extract just the body content if full HTML document
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let content = bodyMatch ? bodyMatch[1] : html;

        // Extract inline styles from <style> blocks and keep them
        const styleBlocks = [];
        html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (m, css) => {
            styleBlocks.push(css);
        });

        // Wrap in a container with extracted styles inline
        const inlineStyles = styleBlocks.length > 0 ? `<style>${styleBlocks.join('\n')}</style>` : '';
        const finalHtml = `<div style="background:#ffffff;min-height:100vh;">${inlineStyles}${content}</div>`;

        const clonedImages = Object.keys(urlMap).length;
        res.json({
            html: finalHtml,
            stats: {
                imagesFound: uniqueUrls.length,
                imagesCloned: clonedImages,
                linksRewritten: hopLink ? true : false,
            }
        });
    } catch (err) {
        console.error('Clone page error:', err);
        if (err.name === 'AbortError') {
            return res.status(408).json({ error: 'Page took too long to load. Try a different URL.' });
        }
        res.status(500).json({ error: `Clone failed: ${err.message}` });
    }
});

module.exports = router;
