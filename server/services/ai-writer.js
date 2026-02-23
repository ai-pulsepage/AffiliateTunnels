/**
 * AI Writer Service — Generates blog-style review articles using Gemini (two-pass)
 * Pass 1: Extract structured product intelligence from scraped content
 * Pass 2: Write a long-form Pinterest blog-style review article
 */
const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Pass 1: Extract structured product data from raw scraped text using Gemini
 */
async function extractProductIntelligence(scrapedText, apiKey) {
    const prompt = `You are a product research analyst. Extract ALL useful information from this product/sales page content.

RAW SCRAPED CONTENT:
${scrapedText}

Extract and return a JSON object with these fields (use null if not found):
{
  "productName": "exact product name",
  "brand": "brand name",
  "tagline": "main marketing tagline",
  "description": "2-3 sentence summary of what the product does",
  "targetAudience": "who this product is for (age, gender, conditions)",
  "mainClaims": ["list of key marketing claims"],
  "ingredients": [{"name": "ingredient name", "benefit": "what it does"}],
  "scientificClaims": ["any research/study references mentioned"],
  "testimonials": [{"quote": "testimonial text", "name": "person name", "detail": "age, location, or other detail"}],
  "pricing": [{"tier": "package name", "bottles": 2, "pricePerBottle": "$79", "totalPrice": "$158"}],
  "guarantee": "money-back guarantee details",
  "bonuses": ["any free bonuses mentioned"],
  "keyStats": ["any specific numbers/percentages mentioned like '74% increase'"],
  "problemItSolves": "the core problem this product addresses",
  "howItWorks": "mechanism of action explanation",
  "uniqueAngle": "what makes this product different from competitors"
}

Return ONLY valid JSON. No explanation, no markdown fences.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
    });

    if (!response.ok) throw new Error(`Gemini extraction failed: ${response.status}`);
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    try { return JSON.parse(text); }
    catch { return { productName: 'Product', description: text }; }
}

/**
 * Pass 2: Generate a long-form blog-style review article
 */
async function generateArticlePage({ productName, productDescription, affiliateLink, style = 'advertorial', emailSwipes = '', existingContent = '', productIntel = null }) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured. Add it in Admin Settings.');

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const year = today.getFullYear();

    // If we have rich product intelligence, build a detailed context block
    let productContext = `PRODUCT: ${productName}\nDESCRIPTION: ${productDescription}`;
    if (productIntel) {
        productContext = `PRODUCT INTELLIGENCE (extracted from the actual product page):
Product: ${productIntel.productName || productName}
Brand: ${productIntel.brand || 'N/A'}
Tagline: ${productIntel.tagline || 'N/A'}
Description: ${productIntel.description || productDescription}
Target Audience: ${productIntel.targetAudience || 'General health-conscious adults'}
Problem It Solves: ${productIntel.problemItSolves || 'N/A'}
How It Works: ${productIntel.howItWorks || 'N/A'}
Unique Angle: ${productIntel.uniqueAngle || 'N/A'}

KEY CLAIMS:
${(productIntel.mainClaims || []).map(c => `- ${c}`).join('\n') || '- N/A'}

KEY STATS:
${(productIntel.keyStats || []).map(s => `- ${s}`).join('\n') || '- N/A'}

INGREDIENTS:
${(productIntel.ingredients || []).map(i => `- ${i.name}: ${i.benefit}`).join('\n') || '- N/A'}

SCIENTIFIC REFERENCES:
${(productIntel.scientificClaims || []).map(s => `- ${s}`).join('\n') || '- N/A'}

REAL TESTIMONIALS FROM THE PRODUCT PAGE:
${(productIntel.testimonials || []).map(t => `"${t.quote}" — ${t.name}${t.detail ? `, ${t.detail}` : ''}`).join('\n') || '- N/A'}

PRICING:
${(productIntel.pricing || []).map(p => `- ${p.tier}: ${p.bottles} bottles at ${p.pricePerBottle}/bottle = ${p.totalPrice}`).join('\n') || '- N/A'}

GUARANTEE: ${productIntel.guarantee || 'N/A'}
BONUSES: ${(productIntel.bonuses || []).join(', ') || 'N/A'}`;
    }

    const styleGuide = {
        advertorial: 'Write as a news-style advertorial article. Journalistic tone with research citations, expert quotes, and a compelling narrative.',
        health_review: 'Write as an in-depth health product review by a wellness blogger. Very informative, balanced, personal experience tone.',
        listicle: 'Write as a numbered listicle ("7 Reasons Why..."). Each point builds toward the recommendation.',
        review_article: 'Write as a comprehensive, Pinterest blog-style product review article (3000+ words). This should read like a real wellness blogger wrote it after thoroughly researching and trying the product. Include personal narrative, ingredient deep-dives, pros/cons, who it\'s for, and honest assessment. Think Healthline or MindBodyGreen quality.',
        blog_post: 'Write as a long-form SEO blog post. Keyword-rich H2/H3 headings, short paragraphs, bulleted lists. Informative and helpful, naturally leading to the recommendation.',
        social_bridge: 'Write as a short, punchy social media bridge page for Facebook/TikTok/Instagram. Under 500 words. Bold headline, short sentences, emotional hooks, urgency. Video placeholder at top. Single strong CTA.',
    };

    const isImproveMode = !!existingContent;
    let prompt;

    if (isImproveMode) {
        prompt = `You are an expert direct-response copywriter specializing in native advertising and affiliate content.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

TASK: IMPROVE the following existing landing page content. Make it more persuasive, professional, and conversion-optimized.

EXISTING CONTENT:
${existingContent}

${productContext}
AFFILIATE LINK: ${affiliateLink}

IMPROVEMENTS:
1. Strengthen headline — more curiosity-driven
2. Improve opening hook
3. Add/improve social proof
4. More engaging body copy — power words, emotional triggers, storytelling
5. Strengthen CTA — urgent and irresistible
6. All links point to: ${affiliateLink}
7. Use today's date: ${dateStr}. NEVER use a past year.
8. All styles INLINE (no <style> blocks)

CRITICAL OUTPUT FORMAT:
- Output each section as a SEPARATE top-level HTML element (h1, h2, p, blockquote, div, ul, etc.)
- Do NOT wrap everything in a single container div
- Each logical section should be its own element so a block editor can parse them individually

OUTPUT: Return ONLY the HTML. No markdown, no explanation, no code fences.`;
    } else {
        prompt = `You are an expert wellness blogger and content creator who writes deeply researched, engaging product review articles. Your articles read like real editorial content — informative, trustworthy, and compelling — not like sales pages.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}
${emailSwipes ? `EMAIL SWIPES (use for tone/angles):\n${emailSwipes}` : ''}

${productContext}

STYLE: ${styleGuide[style] || styleGuide.review_article}

Write a COMPLETE, long-form review article (3000+ words) with the following structure.

═══════════════════════════════════════════
CRITICAL HTML OUTPUT RULES:
═══════════════════════════════════════════
1. Output each section as a SEPARATE top-level HTML element
2. Do NOT wrap sections in a container <div>
3. Each heading, paragraph, blockquote, list, image placeholder, form, and CTA must be its OWN top-level element
4. This HTML goes into a block editor — every top-level element becomes a separate editable block
5. All styles must be INLINE (no <style> blocks)
6. Use white (#fff) backgrounds, Georgia/serif for body text
7. Use today's date: ${dateStr}. NEVER use a past year.

═══════════════════════════════════════════
ARTICLE STRUCTURE (each as separate elements):
═══════════════════════════════════════════

1. <div> — Small "ADVERTISEMENT" disclaimer bar (gray background, centered, uppercase, tiny text)

2. <p> — Category label in red/brand color, uppercase, small font (e.g., "HEALTH & WELLNESS REVIEW")

3. <h1> — Compelling, curiosity-driven headline. Not clickbait but intriguing. Example: "I Tried [Product] For 30 Days — Here's My Honest Review (And the Science Behind It)"

4. <p> — Author byline: "By [Author Name] | ${dateStr} | X min read" in gray

5. <div data-media-slot="hero" style="margin:24px 0;border-radius:12px;overflow:hidden;background:#f5f5f5;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add hero image</span></div>

6-8. <p> paragraphs — Opening hook. Personal story angle: "When my friend told me about [product], I was skeptical..." Build intrigue about the problem this product solves. 2-3 separate <p> elements.

9. <h2> — "What Is [Product]?" or "The Science Behind [Product]"

10-12. <p> paragraphs — Deep explanation of the problem (use the product intelligence: mechanism, research, stats). Each paragraph is its own <p> element. Reference actual research if available.

13. <blockquote> — Expert quote with attribution. Style: border-left: 4px solid #e63946; padding: 16px 24px; background: #fef2f2; border-radius: 0 8px 8px 0; font-style: italic;

14. <h2> — "What's Inside the Formula?" or "Key Ingredients Breakdown"

15-20. For EACH major ingredient, output a separate element:
    <div style="padding:16px 20px;margin:12px 0;background:#f8fafc;border-radius:8px;border-left:3px solid #3b82f6;">
      <strong style="font-size:17px;color:#1e293b;">[Ingredient Name]</strong>
      <p style="margin:6px 0 0;color:#475569;font-size:15px;">[What it does and why it matters — cite research if available]</p>
    </div>

21. <div data-media-slot="mid" style="margin:24px 0;border-radius:12px;overflow:hidden;background:#f5f5f5;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add image</span></div>

22. Email opt-in form — output this EXACT HTML as a single top-level element:
<div style="max-width:520px;margin:48px auto;padding:36px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border-radius:16px;border:2px solid #86efac;text-align:center;">
  <h3 style="font-size:22px;font-weight:700;color:#166534;margin-bottom:8px;">Want the Full Research Breakdown?</h3>
  <p style="color:#4d7c0f;font-size:15px;margin-bottom:20px;">Enter your email to get exclusive research, ingredient analysis, and reader results — free.</p>
  <form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;max-width:360px;margin:0 auto;">
    <input type="text" name="name" placeholder="Your Name" style="width:100%;padding:14px 18px;border:1px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;" />
    <input type="email" name="email" placeholder="Your Email Address" required style="width:100%;padding:14px 18px;border:1px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;" />
    <button type="submit" style="width:100%;padding:16px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:17px;font-weight:700;border:none;border-radius:10px;cursor:pointer;">Send Me the Report →</button>
  </form>
  <p style="color:#6b7280;font-size:11px;margin-top:10px;">We respect your privacy. Unsubscribe anytime.</p>
</div>

23. <h2> — "Real Results: What Actual Users Are Saying"

24-26. For EACH testimonial, output as a separate <blockquote> with the person's name, age, location. Use the real testimonials from the product intelligence if available. Each testimonial is its own element.

27. <div data-media-slot="video" style="text-align:center;padding:50px;background:#111;border-radius:12px;margin:24px 0;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>

28. <h2> — "Who Is [Product] Best For?"

29-30. <p> paragraphs — Target audience section. Who should try this, who should avoid it. Balanced and honest.

31. <h2> — "Pros & Cons"

32. <div> — Pros and cons side by side or listed. Use green checkmarks ✅ for pros, yellow ⚠️ for cons. Be balanced — include 1-2 minor cons for credibility.

33. <h2> — "Pricing & Value" (if pricing data available)

34. <p> — Pricing overview paragraph. Mention the guarantee prominently.

35. FINAL CTA — Output as a top-level element:
<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:36px;text-align:center;margin:36px 0;">
  <p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 10px;">Ready to Try [Product] Risk-Free?</p>
  <p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 20px;">[Mention guarantee] • [Mention best deal]</p>
  <a href="${affiliateLink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#d97706;font-size:18px;font-weight:700;border-radius:10px;text-decoration:none;">Visit Official Website →</a>
</div>

36. <p> — Affiliate disclaimer footer in very small gray text. "This article contains affiliate links. We may earn a commission at no extra cost to you."

REMINDERS:
- Write 3000+ words. Be thorough and detailed. Use ALL the product intelligence provided.
- Every section must be its own TOP-LEVEL HTML element — NO wrapper divs
- Inline styles only
- Sound like a real blogger, not a salesperson
- Include specific numbers, ingredients, and research where available
- Be slightly skeptical at first, then won over by the evidence — this builds trust

OUTPUT: Return ONLY the HTML elements. No markdown, no explanation, no code fences.`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 32768,
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Gemini API error:', err);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up any markdown code fences if present
    html = html.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();

    return html;
}

module.exports = { generateArticlePage, extractProductIntelligence };
