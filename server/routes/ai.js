/**
 * AI Routes — Article generation, content improvement, and product scraping
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateArticlePage, extractProductIntelligence } = require('../services/ai-writer');
const { getSetting } = require('../config/settings');

// Generate article/advertorial landing page content
router.post('/generate-page', authenticate, async (req, res) => {
    try {
        const { productName, productDescription, affiliateLink, style, emailSwipes, existingContent, customDirection } = req.body;

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
            customDirection: customDirection || '',
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
            const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
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

// Generate SEO title + description from page content
router.post('/generate-seo', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content is required' });

        const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
        if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured. Add it in Admin Settings.' });

        // Strip HTML to get plain text, limit to 3000 chars
        const plainText = content
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000);

        if (plainText.length < 20) {
            return res.status(400).json({ error: 'Not enough page content to generate SEO. Add some content first.' });
        }

        const prompt = `You are an SEO expert. Given this page content, generate:
1. An SEO title (under 60 characters, compelling, includes primary keyword)
2. A meta description (under 155 characters, includes CTA, summarizes value)

Page content:
${plainText}

Respond in JSON only: {"seo_title": "...", "seo_description": "..."}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.7,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!response.ok) {
            const errBody = await response.text();
            console.error('Gemini SEO API error:', response.status, errBody);
            return res.status(502).json({ error: `Gemini API returned ${response.status}. Check your API key in Admin Settings.` });
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!rawText) {
            console.error('Gemini SEO: empty response', JSON.stringify(data).substring(0, 500));
            return res.status(500).json({ error: 'AI returned an empty response. Try again.' });
        }

        // Strip markdown code fences if present
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        let result;
        try {
            // Try direct JSON parse first
            result = JSON.parse(cleaned);
        } catch (e1) {
            // Try extracting JSON object with regex
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    result = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    // Fallback: extract fields manually from truncated JSON
                    const titleMatch = cleaned.match(/"seo_title"\s*:\s*"([^"]+)"/);
                    const descMatch = cleaned.match(/"seo_description"\s*:\s*"([^"]+)"/);
                    if (titleMatch || descMatch) {
                        result = {
                            seo_title: titleMatch?.[1] || '',
                            seo_description: descMatch?.[1] || '',
                        };
                    } else {
                        console.error('Gemini SEO: JSON parse error:', e2.message, cleaned.substring(0, 500));
                        return res.status(500).json({ error: 'AI response was not valid JSON. Try again.' });
                    }
                }
            } else {
                console.error('Gemini SEO: could not find JSON in:', cleaned.substring(0, 500));
                return res.status(500).json({ error: 'Failed to parse AI response. Try again.' });
            }
        }

        res.json(result);
    } catch (err) {
        console.error('SEO generation error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate SEO' });
    }
});

module.exports = router;
