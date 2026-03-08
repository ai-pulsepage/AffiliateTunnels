/**
 * BlogMaker 3000 — AI Engine (v2 Queue-Based)
 * Each blog post generated from a single queue item: 1 reference URL + 1 topic
 * Affiliate links are global per worker (woven into every post)
 */
const { query } = require('../config/db');
const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Generate a blog post from a queue item ────────────────────
async function generateBlogPost(worker, queueItem, userId) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured');

    // Parse global affiliate links from worker
    const affiliateLinks = typeof worker.affiliate_links === 'string'
        ? JSON.parse(worker.affiliate_links) : (worker.affiliate_links || []);

    // 1. Research: scrape affiliate product pages for context
    let productContext = '';
    for (const link of affiliateLinks.slice(0, 4)) {
        try {
            const info = await scrapePageText(link.url || link);
            productContext += `\n\n--- Product: ${link.productName || 'Product'} ---\n${info.substring(0, 2000)}`;
        } catch { /* skip failed scrapes */ }
    }

    // 2. Research: scrape the SINGLE paired reference URL
    let referenceContext = '';
    const refUrl = queueItem?.reference_url;
    if (refUrl) {
        try {
            const info = await scrapePageText(refUrl);
            referenceContext = `\n--- Reference Article ---\nSource: ${refUrl}\n${info.substring(0, 4000)}`;
        } catch { /* skip */ }
    }

    // 3. Load microsite's existing products + blog posts for internal linking
    let internalLinks = '';
    let existingPosts = '';
    if (worker.microsite_id) {
        const products = await query(
            'SELECT product_name, slug FROM microsite_products WHERE microsite_id = $1 ORDER BY sort_order LIMIT 5',
            [worker.microsite_id]
        );
        for (const p of products.rows) {
            internalLinks += `- Product page: "${p.product_name}" at /${p.slug}\n`;
        }

        const posts = await query(
            `SELECT title, slug FROM blog_posts WHERE microsite_id = $1 AND status = 'published' ORDER BY created_at DESC LIMIT 10`,
            [worker.microsite_id]
        );
        for (const p of posts.rows) {
            existingPosts += `- Blog: "${p.title}" at /blog/${p.slug}\n`;
        }
    }

    // 4. Build the prompt
    const topicTitle = queueItem?.topic || 'a relevant topic based on the product context';
    const persona = worker.worker_name
        ? `You are ${worker.worker_name}${worker.worker_title ? `, ${worker.worker_title}` : ''}. You are an INDEPENDENT reviewer and lifestyle expert — NOT an employee of any brand. Write in first person with authority and warmth. When recommending products, speak about the brand as a SEPARATE entity ("I've been testing the [Brand] sauna..." NOT "Our sauna..."). You discover, test, and recommend — you don't sell. This independent voice is critical for reader trust.`
        : 'You are a knowledgeable, independent product reviewer and lifestyle expert. You recommend products as a third party — never speak as if you represent the brand.';

    const customInstructions = worker.prompt_template || '';

    const affiliateCTAs = affiliateLinks.map((l, i) =>
        `[${i + 1}] "${l.productName || 'Product'}" — ${l.url || l}`
    ).join('\n');

    const prompt = `${persona}
${customInstructions ? `\nAdditional instructions: ${customInstructions}\n` : ''}
Write a comprehensive, engaging blog post about:
**"${topicTitle}"**

PRODUCT CONTEXT (use to inform your recommendations — decide which product is MOST relevant to this topic and push it as primary):
${productContext || 'No specific product context available — write a general informative article.'}

REFERENCE ARTICLE (read carefully, learn from it, but write ORIGINAL content — never copy):
${referenceContext || 'No reference material — use your knowledge.'}

AFFILIATE PRODUCTS TO RECOMMEND NATURALLY:
${affiliateCTAs || 'No specific products to recommend.'}
IMPORTANT: Analyze the topic and decide which product is MOST relevant. Give it a personal recommendation paragraph. Mention other products briefly where natural. Don't force products that aren't relevant.

INTERNAL PAGES TO LINK TO (for SEO):
${internalLinks || 'No product pages available.'}
${existingPosts ? `\nEXISTING BLOG POSTS TO CROSS-LINK:\n${existingPosts}` : ''}

REQUIREMENTS:
1. Write a minimum of 1,200 words — make it thorough and valuable
2. Use a conversational, authoritative tone that builds trust
3. Structure with clear H2 and H3 headings (proper hierarchy, NO H1)
4. Near the end, include a personal recommendation with a natural call-to-action
5. Include data, statistics, or expert references where possible
6. Link naturally to existing blog posts and product pages where relevant

SEO REQUIREMENTS:
7. ${queueItem?.target_keyword ? `Use this target keyword: "${queueItem.target_keyword}"` : 'Identify the best long-tail SEO keyword (3-5 words)'}
8. Use the keyword in: the first paragraph, at least 2 subheadings, and 4-6 times naturally
9. SEO-optimized title (max 60 chars, includes keyword)
10. Compelling meta description (max 155 chars, includes keyword)
11. FAQ section at the end with 3-4 questions (for featured snippets)

OUTPUT FORMAT — Return valid JSON:
{
  "title": "SEO-optimized title (max 60 chars)",
  "slug": "url-friendly-slug",
  "seo_title": "Title for <title> tag",
  "seo_description": "Meta description (max 155 chars)",
  "target_keyword": "the keyword",
  "excerpt": "2-3 sentence preview for blog cards",
  "content_html": "Full HTML with <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, <a> tags. No <h1> or wrappers. Affiliate links as <a href='URL' target='_blank' rel='noopener'>Name</a>."
}

Return ONLY valid JSON. No markdown code fences.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 16384,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini blog generation failed: ${response.status} — ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Check for blocked/empty responses
    const finishReason = data.candidates?.[0]?.finishReason;
    if (!text && finishReason) {
        console.error('[BlogMaker] AI response blocked or empty. finishReason:', finishReason);
        console.error('[BlogMaker] Full response:', JSON.stringify(data).substring(0, 500));
        throw new Error(`AI response blocked (${finishReason}). Try a different topic.`);
    }

    // Strip markdown code fences if present
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    let blogData;
    try {
        blogData = JSON.parse(text);
    } catch (e1) {
        console.log('[BlogMaker] Direct JSON parse failed, using field extraction fallback...');
        // The content_html field often contains unescaped chars that break JSON.parse.
        // Extract each field individually — much more robust for long HTML content.
        try {
            blogData = extractBlogFields(text);
            console.log('[BlogMaker] ✅ Recovered blog data via field extraction');
        } catch (e2) {
            console.error('[BlogMaker] All parse attempts failed:', e2.message);
            console.error('[BlogMaker] Raw response (first 2000 chars):', text.substring(0, 2000));
            throw new Error(`Failed to parse AI blog content. AI returned: "${text.substring(0, 200)}..."`);
        }
    }

    // 5. Save to database
    const slug = (blogData.slug || blogData.title || topicTitle)
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 200);

    const existing = await query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    const finalSlug = existing.rows.length > 0 ? `${slug}-${Date.now().toString(36)}` : slug;

    const result = await query(
        `INSERT INTO blog_posts (user_id, microsite_id, worker_id, title, slug, excerpt, content_html,
         seo_title, seo_description, target_keyword, category, author_name, author_title, author_avatar, status, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'published',NOW())
         RETURNING *`,
        [userId, worker.microsite_id || null, worker.id,
            blogData.title || topicTitle, finalSlug,
            blogData.excerpt || '', blogData.content_html || '',
            blogData.seo_title || blogData.title || '', blogData.seo_description || '',
            blogData.target_keyword || '', worker.site_title || worker.subdomain || '',
            worker.worker_name || 'Staff Writer', worker.worker_title || '', worker.worker_avatar || '']
    );

    const post = result.rows[0];

    // 6. Update worker stats
    await query(
        'UPDATE blog_workers SET posts_generated = posts_generated + 1, updated_at = NOW() WHERE id = $1',
        [worker.id]
    );

    // 7. Auto-create PAUSED blog notification for admin approval
    const subdomain = worker.subdomain || worker.site_title || '';
    if (subdomain) {
        const notifSubject = `New: ${post.title}`;
        const notifHtml = buildBlogNotificationEmail(post, subdomain);

        await query(
            `INSERT INTO blog_notifications (user_id, blog_post_id, category, subject, preview_text, html_body, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'paused')`,
            [userId, post.id, subdomain, notifSubject, post.excerpt || '', notifHtml]
        );
        console.log(`[BlogMaker] 📧 Created paused notification for "${post.title}" → category "${subdomain}"`);
    }

    return post;
}

// ─── Build email HTML for blog notification ─────────────────────
function buildBlogNotificationEmail(post, subdomain) {
    const postUrl = `https://${subdomain}.dealfindai.com/blog/${post.slug}`;
    return `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#333;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">New Blog Post</h2>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <h1 style="font-size:22px;color:#111;margin:0 0 12px;">${post.title}</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 20px;">${post.excerpt || ''}</p>
            <a href="${postUrl}" style="display:inline-block;padding:12px 28px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Read Full Article →</a>
            <p style="margin-top:24px;font-size:13px;color:#999;">Written by ${post.author_name || 'Staff Writer'}</p>
        </div>
        <div style="text-align:center;padding:16px;font-size:12px;color:#999;">
            <a href="{{unsubscribe_url}}" style="color:#999;">Unsubscribe</a>
        </div>
    </div>`;
}

// ─── Smart Suggest: paste URLs → get paired topic + keyword list ─
async function smartSuggest(worker, referenceUrls) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured');

    const affiliateLinks = typeof worker.affiliate_links === 'string'
        ? JSON.parse(worker.affiliate_links) : (worker.affiliate_links || []);

    // Scrape each reference URL
    let scrapedContent = '';
    for (const url of referenceUrls.slice(0, 5)) {
        try {
            const text = await scrapePageText(url);
            scrapedContent += `\n\n--- Article from ${url} ---\n${text.substring(0, 3000)}`;
        } catch { /* skip */ }
    }

    const productInfo = affiliateLinks.map(l =>
        `- ${l.productName || 'Product'}: ${l.url || l}`
    ).join('\n');

    const prompt = `You are a content strategist for affiliate marketing. I have these reference articles:

${scrapedContent || 'No articles could be scraped.'}

And these affiliate products to promote:
${productInfo || 'General products'}

For each reference URL provided, suggest ONE blog post topic that:
1. Is inspired by the reference article's content
2. Targets a long-tail SEO keyword (3-5 words)
3. Would naturally allow recommending the relevant affiliate products
4. Provides genuine educational value

Reference URLs to pair with topics:
${referenceUrls.map((u, i) => `${i + 1}. ${u}`).join('\n')}

Return a JSON array matching the order of URLs:
[{"reference_url": "the url", "topic": "Blog Post Title Idea", "target_keyword": "long tail keyword"}]

Return ONLY valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 4096, responseMimeType: 'application/json' },
        }),
    });

    if (!response.ok) throw new Error(`Smart suggest failed: ${response.status}`);
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
        return JSON.parse(text);
    } catch {
        return [];
    }
}

// ─── Simple page text scraper ────────────────────────────────────
async function scrapePageText(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Encoding': 'identity',
            },
            signal: controller.signal,
            redirect: 'follow',
        });
        clearTimeout(timeout);
        if (!response.ok) return '';
        const html = await response.text();
        return html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000);
    } catch {
        clearTimeout(timeout);
        return '';
    }
}

// ─── Robust field extractor for AI-generated blog JSON ──────────
// When JSON.parse fails (usually due to unescaped chars in content_html),
// this extracts each field individually — immune to HTML content issues.
function extractBlogFields(rawText) {
    const fields = ['title', 'slug', 'seo_title', 'seo_description', 'target_keyword', 'excerpt', 'content_html'];
    const result = {};

    for (const field of fields) {
        if (field === 'content_html') {
            // content_html is special — it's the longest field and most likely to contain problematic chars
            // Find it by locating the key and then extracting everything until the last closing tag pattern
            const startPattern = `"content_html"\\s*:\\s*"`;
            const startMatch = rawText.match(new RegExp(startPattern));
            if (startMatch) {
                const startIdx = rawText.indexOf(startMatch[0]) + startMatch[0].length;
                // Find the end: look for the pattern where content_html value ends
                // It ends with a " followed by optional whitespace and either , or }
                // But the content itself may contain escaped quotes, so find the LAST occurrence of "}
                let endIdx = rawText.length;
                // Work backwards from the end to find where content_html ends
                const afterContent = rawText.substring(startIdx);
                // Look for closing pattern: "\n} or "} at the end of the JSON
                const endMatch = afterContent.match(/"\s*\}\s*$/);
                if (endMatch) {
                    endIdx = startIdx + afterContent.lastIndexOf(endMatch[0]);
                } else {
                    // Try to find the last unescaped quote before a } or end
                    endIdx = startIdx + afterContent.length;
                    // Walk backwards to find the ending quote
                    for (let i = afterContent.length - 1; i > 0; i--) {
                        if (afterContent[i] === '"' && afterContent[i - 1] !== '\\') {
                            endIdx = startIdx + i;
                            break;
                        }
                    }
                }
                let html = rawText.substring(startIdx, endIdx);
                // Unescape JSON string escapes
                html = html.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                result.content_html = html;
            }
        } else {
            // For short fields, simple regex extraction works fine
            const pattern = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
            const match = rawText.match(pattern);
            if (match) {
                result[field] = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
        }
    }

    if (!result.title && !result.content_html) {
        throw new Error('Could not extract title or content_html from AI response');
    }

    return result;
}

module.exports = { generateBlogPost, smartSuggest, scrapePageText };
