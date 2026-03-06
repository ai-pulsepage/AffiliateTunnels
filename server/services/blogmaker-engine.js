/**
 * BlogMaker 3000 — AI Engine
 * Research → Plan → Write → SEO-optimize blog posts
 */
const { query } = require('../config/db');
const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Generate a single blog post ────────────────────────────────
async function generateBlogPost(worker, topic, userId) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured');

    // Parse worker data
    const affiliateLinks = typeof worker.affiliate_links === 'string'
        ? JSON.parse(worker.affiliate_links) : (worker.affiliate_links || []);
    const referenceUrls = typeof worker.reference_urls === 'string'
        ? JSON.parse(worker.reference_urls) : (worker.reference_urls || []);

    // 1. Research phase — gather context from affiliate product pages
    let productContext = '';
    for (const link of affiliateLinks.slice(0, 3)) {
        try {
            const info = await scrapePageText(link.url || link);
            productContext += `\n\n--- Product: ${link.productName || 'Product'} ---\n${info.substring(0, 2000)}`;
        } catch { /* skip failed scrapes */ }
    }

    // 2. Research reference URLs for style/knowledge
    let referenceContext = '';
    for (const refUrl of referenceUrls.slice(0, 3)) {
        try {
            const info = await scrapePageText(typeof refUrl === 'string' ? refUrl : refUrl.url);
            referenceContext += `\n\n--- Reference ---\n${info.substring(0, 2000)}`;
        } catch { /* skip */ }
    }

    // 3. Build the internal links for SEO (product pages + landing pages on this microsite)
    let internalLinks = '';
    if (worker.microsite_id) {
        const products = await query(
            'SELECT product_name, slug FROM microsite_products WHERE microsite_id = $1 ORDER BY sort_order LIMIT 5',
            [worker.microsite_id]
        );
        const subdomain = worker.subdomain || '';
        for (const p of products.rows) {
            internalLinks += `- Product page: "${p.product_name}" at /${p.slug}\n`;
        }
    }

    // 4. Generate the blog post via Gemini
    const topicTitle = topic || 'a relevant topic based on the product context';
    const persona = worker.worker_name
        ? `You are ${worker.worker_name}${worker.worker_title ? `, ${worker.worker_title}` : ''}. Write in first person with authority and warmth.`
        : 'You are a knowledgeable product reviewer and health expert.';

    const customInstructions = worker.prompt_template || '';

    const affiliateCTAs = affiliateLinks.map((l, i) =>
        `[${i + 1}] "${l.productName || 'Product'}" — ${l.url || l}`
    ).join('\n');

    const prompt = `${persona}
${customInstructions ? `\nAdditional instructions: ${customInstructions}\n` : ''}
Write a comprehensive, engaging blog post about:
**"${topicTitle}"**

PRODUCT CONTEXT (use this to inform your recommendations):
${productContext || 'No specific product context available — write a general informative article.'}

REFERENCE MATERIAL (learn from this but write original content):
${referenceContext || 'No reference material — use your knowledge.'}

AFFILIATE PRODUCTS TO RECOMMEND (weave naturally into content):
${affiliateCTAs || 'No specific products to recommend.'}

INTERNAL PAGES TO LINK TO (for SEO internal linking):
${internalLinks || 'No internal pages available.'}

REQUIREMENTS:
1. Write a minimum of 1,200 words — make it thorough and valuable
2. Use a conversational, authoritative tone that builds trust
3. Structure with clear H2 and H3 headings (proper hierarchy, NO H1 — that's the title)
4. Naturally mention 1-2 affiliate products where relevant — don't force it
5. Near the end, include a personal recommendation: "If you're looking for [solution], I personally recommend [Product Name]" with the affiliate link
6. Include data, statistics, or expert quotes where possible

SEO REQUIREMENTS (critical):
7. Identify the best long-tail SEO keyword for this topic (3-5 words)
8. Use that keyword in: the first paragraph, at least 2 subheadings, and naturally 4-6 times throughout
9. Write an SEO-optimized title (max 60 characters, includes keyword)
10. Write a compelling meta description (max 155 characters, includes keyword)
11. Use semantic variations of the keyword throughout
12. Include a FAQ section at the end with 3-4 common questions (great for featured snippets)

OUTPUT FORMAT — Return valid JSON:
{
  "title": "SEO-optimized blog title (max 60 chars)",
  "slug": "url-friendly-slug",
  "seo_title": "Title for <title> tag",
  "seo_description": "Meta description (max 155 chars)",
  "target_keyword": "the long-tail keyword you chose",
  "excerpt": "2-3 sentence preview for blog cards",
  "content_html": "Full blog post HTML using <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, <strong>, <em>, <a href> tags. Do NOT include <h1> or <html>/<body> wrappers. Include affiliate links as <a href='URL' target='_blank' rel='noopener'>Product Name</a>."
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
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    let blogData;
    try {
        blogData = JSON.parse(text);
    } catch {
        throw new Error('Failed to parse AI-generated blog content');
    }

    // 5. Save to database
    const slug = (blogData.slug || blogData.title || topicTitle)
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 200);

    // Check for slug collision
    const existing = await query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    const finalSlug = existing.rows.length > 0 ? `${slug}-${Date.now().toString(36)}` : slug;

    const result = await query(
        `INSERT INTO blog_posts (user_id, microsite_id, worker_id, title, slug, excerpt, content_html,
         seo_title, seo_description, target_keyword, category, author_name, author_title, author_avatar, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'draft')
         RETURNING *`,
        [userId, worker.microsite_id || null, worker.id,
            blogData.title || topicTitle, finalSlug,
            blogData.excerpt || '', blogData.content_html || '',
            blogData.seo_title || blogData.title || '', blogData.seo_description || '',
            blogData.target_keyword || '', worker.site_title || '',
            worker.worker_name || 'Staff Writer', worker.worker_title || '', worker.worker_avatar || '']
    );

    // Update worker stats
    await query(
        'UPDATE blog_workers SET posts_generated = posts_generated + 1, updated_at = NOW() WHERE id = $1',
        [worker.id]
    );

    return result.rows[0];
}

// ─── Suggest topics based on worker's affiliate products ─────────
async function suggestTopics(worker) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured');

    const affiliateLinks = typeof worker.affiliate_links === 'string'
        ? JSON.parse(worker.affiliate_links) : (worker.affiliate_links || []);

    const productInfo = affiliateLinks.map(l =>
        `- ${l.productName || 'Product'}: ${l.url || l}`
    ).join('\n');

    const prompt = `You are a content strategist for affiliate marketing. Based on these products:

${productInfo || 'General health and wellness products'}

Suggest 10 blog post topics that would:
1. Attract organic search traffic (target long-tail keywords)
2. Be highly relevant to potential buyers of these products
3. Provide genuine value while naturally leading to product recommendations
4. Cover a mix of: educational, comparison, "best of" lists, how-to guides, and myth-busting

Return a JSON array of objects:
[{"title": "Top 10 Best...", "keyword": "target keyword", "type": "listicle|guide|comparison|educational"}]

Make titles compelling and click-worthy. Target keywords that real people search for.
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

    if (!response.ok) throw new Error(`Topic suggestion failed: ${response.status}`);
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
        return JSON.parse(text);
    } catch {
        return [];
    }
}

// ─── Simple page text scraper (reused from ai.js pattern) ────────
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

module.exports = { generateBlogPost, suggestTopics };
