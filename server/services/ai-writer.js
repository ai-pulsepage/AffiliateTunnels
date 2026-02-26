/**
 * AI Writer Service — Generates page content using Gemini (two-pass)
 * Pass 1: Extract structured product intelligence from scraped content
 * Pass 2: Generate style-specific page content with dedicated prompts per page type
 *
 * Supported styles: review_article, advertorial, video_presell, listicle, social_bridge, lead_magnet, blog_post
 * Each style has its own prompt structure that outputs separate top-level HTML elements for block editing.
 */
const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Pass 1: Extract structured product data ───────────────────
async function extractProductIntelligence(scrapedText, apiKey) {
   const prompt = `You are a product research analyst. Extract the most useful information from this product/sales page content.

RAW SCRAPED CONTENT:
${scrapedText}

Extract and return a JSON object with these fields (use null if not found):
{
  "productName": "exact product name",
  "brand": "brand name",
  "tagline": "main marketing tagline",
  "description": "2-3 sentence summary of what the product does",
  "targetAudience": "who this product is for",
  "mainClaims": ["top 5 key marketing claims only"],
  "ingredients": [{"name": "ingredient name", "benefit": "what it does"}],
  "testimonials": [{"quote": "short testimonial (max 2 sentences)", "name": "person name", "detail": "location"}],
  "pricing": [{"tier": "package name", "totalPrice": "$XX"}],
  "guarantee": "money-back guarantee details",
  "bonuses": ["any free bonuses mentioned"],
  "keyStats": ["top 5 specific numbers/percentages"],
  "problemItSolves": "the core problem this product addresses",
  "howItWorks": "mechanism of action in 1-2 sentences",
  "uniqueAngle": "what makes this different from competitors"
}

IMPORTANT: Keep testimonials to maximum 5. Keep all lists to maximum 5 items. Keep all text fields concise.
Return ONLY valid JSON.`;

   const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
   const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         contents: [{ parts: [{ text: prompt }] }],
         generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
         },
      }),
   });

   if (!response.ok) throw new Error(`Gemini extraction failed: ${response.status}`);
   const data = await response.json();
   let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
   text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

   try {
      return JSON.parse(text);
   } catch {
      // If JSON is truncated, try to extract key fields via regex
      const nameMatch = text.match(/"productName"\s*:\s*"([^"]+)"/);
      const descMatch = text.match(/"description"\s*:\s*"([^"]+)"/);
      return {
         productName: nameMatch?.[1] || 'Product',
         description: descMatch?.[1] || '',
      };
   }
}

// ─── Shared helpers ────────────────────────────────────────────
function buildProductContext(productName, productDescription, productIntel) {
   if (!productIntel) return `PRODUCT: ${productName}\nDESCRIPTION: ${productDescription}`;

   return `PRODUCT INTELLIGENCE (extracted from the actual product page):
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

function sharedBlockRules() {
   return `
═══════════════════════════════════════════
CRITICAL HTML OUTPUT RULES (BLOCK EDITOR):
═══════════════════════════════════════════
1. Output each section as a SEPARATE top-level HTML element (h1, h2, p, div, blockquote, ul, etc.)
2. Do NOT wrap anything in a container <div> — no wrapper elements
3. Each heading, paragraph, blockquote, list, image placeholder, form, and CTA must be its OWN top-level element
4. This HTML goes into a block editor — every top-level element becomes a separate editable block
5. All styles must be INLINE (no <style> blocks, no class attributes)
6. Use white (#fff) backgrounds, readable font sizes
7. Do NOT use markdown — output raw HTML only
8. Do NOT wrap output in code fences

OUTPUT: Return ONLY the HTML elements. No markdown, no explanation, no code fences.`;
}

// ─── Style-specific prompt builders ────────────────────────────

function buildReviewArticlePrompt({ productContext, affiliateLink, dateStr, year, emailSwipes }) {
   return `You are an expert wellness blogger and content creator who writes deeply researched, engaging product review articles. Your articles read like real editorial content — informative, trustworthy, and compelling — not like sales pages.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}
${emailSwipes ? `EMAIL SWIPES (use for tone/angles):\n${emailSwipes}` : ''}

${productContext}

STYLE: Write as a comprehensive, Pinterest blog-style product review article (3000+ words). This should read like a real wellness blogger wrote it after thoroughly researching and trying the product.

Write a COMPLETE, long-form review article with the following structure. EACH numbered item below must be its OWN separate top-level HTML element:

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

22. Email opt-in form — output as a single top-level element:
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

24-26. For EACH testimonial, output as a separate <blockquote> with the person's name, age, location. Use the real testimonials from the product intelligence if available.

27. <div data-media-slot="video" style="text-align:center;padding:50px;background:#111;border-radius:12px;margin:24px 0;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>

28. <h2> — "Who Is [Product] Best For?"

29-30. <p> paragraphs — Target audience section. Who should try this, who should avoid it.

31. <h2> — "Pros & Cons"

32. <div> — Pros and cons listed. Use green checkmarks ✅ for pros, yellow ⚠️ for cons. Be balanced.

33. <h2> — "Pricing & Value" (if pricing data available)

34. <p> — Pricing overview paragraph. Mention the guarantee prominently.

35. FINAL CTA — Output as a top-level element:
<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:36px;text-align:center;margin:36px 0;">
  <p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 10px;">Ready to Try [Product] Risk-Free?</p>
  <p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 20px;">[Mention guarantee] • [Mention best deal]</p>
  <a href="${affiliateLink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#d97706;font-size:18px;font-weight:700;border-radius:10px;text-decoration:none;">Visit Official Website →</a>
</div>

36. <p> — Affiliate disclaimer footer in very small gray text.

REMINDERS:
- Write 3000+ words. Be thorough and detailed. Use ALL the product intelligence provided.
- Every section must be its own TOP-LEVEL HTML element — NO wrapper divs
- Inline styles only
- Sound like a real blogger, not a salesperson
- Include specific numbers, ingredients, and research where available
- Be slightly skeptical at first, then won over by the evidence — this builds trust
- Use today's date: ${dateStr}. NEVER use a past year.
${sharedBlockRules()}`;
}

function buildVideoPresellPrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are a direct-response video landing page copywriter. Write a short, high-converting video presell page for Facebook/YouTube ad traffic. This page sits BETWEEN the ad and the sales page — its job is to warm up the viewer and get them to click through.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}

${productContext}

Write a SHORT video presell page (~300-400 words). Each numbered item below must be its OWN separate top-level HTML element:

1. <h1> — Bold, curiosity-driven headline. Centered, large (32px), tight line height. Example: "Watch: The 30-Second Morning Ritual That's Helping Thousands [Benefit]"
   Style: font-size:32px;font-weight:800;text-align:center;line-height:1.2;color:#111;margin:0 0 8px;

2. <p> — Short subheadline (1 sentence). Centered, gray, creates intrigue. Example: "Over 2 million people have already seen this. Here's why it's going viral."
   Style: text-align:center;font-size:16px;color:#666;margin:0 0 24px;

3. <div data-media-slot="hero" style="text-align:center;padding:50px;background:#000;border-radius:12px;min-height:380px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>

4. <p> — Opening hook paragraph. 2-3 sentences. Personal/emotional angle. What the video reveals and why it matters.
   Style: font-size:17px;line-height:1.7;color:#444;margin:16px 0;

5. <p> — Social proof paragraph. What people are experiencing. Use real testimonials from product intelligence if available.
   Style: font-size:17px;line-height:1.7;color:#444;margin:16px 0;

6. <ul> — 4-5 key benefits as checkmark list items. Short, punchy, scannable.
   Style: list-style:none;padding:0;font-size:17px;line-height:2;margin:20px 0;
   Each <li>: ✅ [Benefit statement]

7. <p> — Urgency/scarcity line. Centered, bold. Example: "⚡ Limited time special pricing available"
   Style: text-align:center;font-size:16px;font-weight:700;color:#e63946;margin:20px 0;

8. <div> — Big CTA button block. Dark background, centered, prominent.
   Style: background:#111;border-radius:12px;padding:36px;text-align:center;margin:32px 0;
   Inside: headline text (22px, white, bold), subtitle (14px, white/60%), and CTA link:
   <a href="${affiliateLink}" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:20px;font-weight:700;border-radius:10px;text-decoration:none;">Yes, Show Me How! →</a>

9. <p> — Disclaimer. Tiny gray centered text. "This is an advertisement. Individual results may vary."
   Style: font-size:12px;color:#bbb;text-align:center;margin-top:32px;

TONE: Conversational, excited but not hype-y. Like a friend sharing something they discovered.
Keep it SHORT — this is a bridge page, not a full article.
${sharedBlockRules()}`;
}

function buildListiclePrompt({ productContext, affiliateLink, dateStr, year, emailSwipes }) {
   return `You are a content writer specializing in numbered listicle articles for native ad platforms and SEO. Write a compelling "X Reasons Why..." listicle that educates and naturally leads the reader toward trying the product. This should read like real editorial content.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}
${emailSwipes ? `EMAIL SWIPES (use for tone/angles):\n${emailSwipes}` : ''}

${productContext}

Write a COMPLETE listicle article (1500-2000 words). Each numbered item below must be its OWN separate top-level HTML element:

1. <p> — Category label. Red/brand color, uppercase, small font, bold.
   Style: font-size:13px;font-weight:600;color:#e63946;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;
   Example: "HEALTH & WELLNESS"

2. <h1> — Listicle headline. "7 Reasons Why [Target Audience] Are Switching to [Product]" or "5 Things You Need to Know About [Product] Before Buying"
   Style: font-size:30px;font-weight:800;line-height:1.25;color:#111;margin:0 0 16px;

3. <p> — Intro subtitle. 1-2 sentences teasing the content.
   Style: font-size:17px;color:#666;margin:0 0 8px;line-height:1.6;

4. <p> — Author byline with date.
   Style: font-size:13px;color:#999;margin:0 0 24px;
   Example: "By [Author Name] · ${dateStr}"

5. <div data-media-slot="hero" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:10px;margin:0 0 28px;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add hero image</span></div>

6. <p> — Opening paragraph. Set the scene — what problem are people facing? Why is this topic trending? 2-3 sentences.
   Style: font-size:17px;line-height:1.7;color:#444;margin:0 0 24px;

Then for EACH reason (output 5-7 reasons), create TWO separate elements per reason:

7a. <h2> — "1. [Reason Title]"
   Style: font-size:22px;color:#111;margin:28px 0 12px;font-weight:700;

7b. <p> — Explanation paragraph (3-5 sentences). Use specific data, ingredients, or research from the product intelligence. Make each reason substantive and informative.
   Style: font-size:17px;line-height:1.7;color:#444;margin:0 0 8px;

(Repeat 7a+7b for each of the 5-7 reasons — each as its own top-level element)

After reason 3 or 4, insert a MID-ARTICLE CTA:
<div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px solid #7dd3fc;border-radius:12px;padding:28px;text-align:center;margin:32px 0;">
  <p style="font-size:18px;font-weight:700;color:#0369a1;margin:0 0 12px;">Want to see if [Product] is right for you?</p>
  <a href="${affiliateLink}" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#0284c7,#0369a1);color:#fff;font-size:16px;font-weight:700;border-radius:8px;text-decoration:none;">Learn More on the Official Site →</a>
</div>

After all reasons, continue with:

N+1. <h2> — "The Bottom Line"
   Style: font-size:22px;color:#111;margin:28px 0 12px;font-weight:700;

N+2. <p> — Summary paragraph. Tie together the key reasons. Honest assessment — who is this best for?
   Style: font-size:17px;line-height:1.7;color:#444;margin:0 0 8px;

N+3. <blockquote> — A testimonial from a real user (use product intelligence if available). Styled quote block.
   Style: border-left:4px solid #e63946;padding:16px 24px;background:#fef2f2;border-radius:0 8px 8px 0;font-style:italic;margin:24px 0;

N+4. FINAL CTA block:
<div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:12px;padding:36px;text-align:center;margin:36px 0;">
  <p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 10px;">Ready to Try [Product] Risk-Free?</p>
  <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0 0 20px;">Click below to see today's exclusive pricing.</p>
  <a href="${affiliateLink}" style="display:inline-block;padding:16px 52px;background:#fff;color:#6d28d9;font-size:18px;font-weight:700;border-radius:8px;text-decoration:none;">See Special Pricing →</a>
</div>

N+5. <p> — Affiliate disclaimer. Tiny gray centered text.
   Style: font-size:12px;color:#bbb;text-align:center;margin-top:32px;

TONE: Informative, editorial. Like a health journalist, not a salesperson. Use real data from the product intelligence.
${sharedBlockRules()}`;
}

function buildSocialBridgePrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are a social media landing page copywriter specializing in high-converting bridge pages for Facebook, TikTok, and Instagram ad traffic. Write a SHORT, punchy, scroll-stopping bridge page. This page sits between the social media ad and the offer page — it needs to grab attention instantly and drive a click-through.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}

${productContext}

Write a VERY SHORT social bridge page (~300-400 words max). Each numbered item must be its OWN separate top-level HTML element:

1. <h1> — Big, emoji-forward, scroll-stopping headline. Centered. Use emotional hooks. Example: "🔥 This Changed EVERYTHING For Me" or "😱 I Can't Believe Nobody Told Me About This"
   Style: font-size:32px;font-weight:800;text-align:center;color:#111;line-height:1.2;margin:0 0 16px;

2. <p> — 1-sentence hook. Centered. Conversational, relatable. Example: "I was skeptical too. Then I tried it for myself..."
   Style: text-align:center;font-size:18px;color:#555;margin:0 0 24px;

3. <div data-media-slot="hero" style="text-align:center;padding:60px;background:#000;border-radius:16px;min-height:380px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video or image</span></div>

4. <p> — 2-3 sentences. Short, punchy. What this product does and why it matters. Use sentence fragments for impact. Mobile-optimized = short lines.
   Style: font-size:17px;line-height:1.7;color:#444;text-align:center;margin:20px 0;

5. <ul> — 4-5 checkmark benefits. No fluff, pure value.
   Style: list-style:none;padding:24px;font-size:18px;line-height:2;margin:0;
   Each <li>: ✅ [Short benefit] — keep each under 8 words

6. <p> — Social proof line. Bold, centered. Example: "⭐ Rated 4.8/5 by over 12,000 customers"
   Style: text-align:center;font-size:16px;font-weight:700;color:#444;margin:16px 0;

7. <p> — Urgency text. Red/bold. Example: "⚡ Limited time: Special pricing ends soon"
   Style: text-align:center;font-size:15px;font-weight:700;color:#e63946;margin:16px 0;

8. <div> — MASSIVE CTA button. This is the main goal of the page. Make it impossible to miss.
   Style: text-align:center;padding:24px;
   <a href="${affiliateLink}" style="display:inline-block;padding:20px 60px;background:linear-gradient(135deg,#e63946,#d62828);color:#fff;font-size:22px;font-weight:800;border-radius:12px;text-decoration:none;box-shadow:0 4px 20px rgba(230,57,70,0.3);">👉 YES, Show Me! →</a>

9. <p> — Tiny disclaimer. Centered, light gray.
   Style: text-align:center;font-size:12px;color:#bbb;margin-top:24px;

CRITICAL RULES:
- Keep it EXTREMELY SHORT. Under 400 words total.
- Think MOBILE FIRST — people are scrolling on their phone
- Short sentences. Short paragraphs. Lots of whitespace.
- Emoji usage is encouraged but don't overdo it
- ONE main CTA — don't dilute with multiple actions
- No long paragraphs. No ingredient deep-dives. No lengthy testimonials.
- This is a BRIDGE page, not a full article
${sharedBlockRules()}`;
}

function buildLeadMagnetPrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are a lead generation landing page specialist. Write a high-converting email capture page that offers a free guide/report in exchange for the visitor's email. This page should communicate massive value quickly and make the opt-in irresistible. The primary goal is EMAIL CAPTURE, not clicks to an affiliate link.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

${productContext}

Write a FOCUSED lead magnet page (~400-500 words). Each numbered item must be its OWN separate top-level HTML element:

1. <h1> — Big, value-focused headline. Centered. Makes the free offer irresistible. Example: "FREE: The Complete Guide to [Solving Their Problem]" or "Download: 7 Proven [Niche] Secrets That [Benefit]"
   Style: font-size:30px;font-weight:800;text-align:center;color:#111;line-height:1.3;margin:0 0 12px;

2. <p> — Subtitle explaining what they'll get and why it matters. Centered. 1-2 sentences.
   Style: text-align:center;font-size:17px;color:#666;max-width:540px;margin:0 auto 24px;

3. <div data-media-slot="hero" style="text-align:center;padding:30px;background:#f5f5f5;border-radius:12px;margin:0 0 24px;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add lead magnet cover image</span></div>

4. <h2> — "What You'll Discover Inside:" or "Here's What's Inside Your Free Guide:"
   Style: font-size:20px;font-weight:700;color:#111;text-align:center;margin:0 0 16px;

5. <ul> — 5-6 bullet points describing what's in the guide. Each bullet = a specific, curiosity-driven benefit. Use the product intelligence to make these specific and relevant.
   Style: padding-left:24px;font-size:16px;line-height:1.8;max-width:480px;margin:0 auto 24px;color:#444;
   Each <li> style: margin-bottom:8px;
   Example bullets:
   - "The #1 mistake 90% of people make (and the simple fix)"
   - "3 research-backed ingredients that actually work"
   - "The 'morning ritual' that [specific benefit]"

6. <blockquote> — A testimonial or trust element. Example: "I downloaded this guide and it completely changed how I approach [topic]" — Reader name
   Style: border-left:4px solid #6366f1;padding:16px 20px;margin:0 auto 24px;max-width:480px;background:#f5f3ff;font-style:italic;border-radius:0 8px 8px 0;

7. <div> — The email opt-in form. This is the PRIMARY conversion element. Must be visually prominent.
   Style: text-align:center;padding:36px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;color:#fff;margin:24px 0;max-width:520px;margin-left:auto;margin-right:auto;
   Inside:
   <h3 style="font-size:22px;font-weight:700;margin-bottom:8px;">Get Your Free Copy Now</h3>
   <p style="margin-bottom:20px;opacity:0.9;font-size:15px;">Enter your email and we'll send it right over.</p>
   <form data-at-form="optin" style="max-width:360px;margin:0 auto;display:flex;flex-direction:column;gap:10px;">
     <input type="text" name="name" placeholder="Your name" style="width:100%;padding:14px 18px;border:none;border-radius:10px;font-size:15px;box-sizing:border-box;" />
     <input type="email" name="email" placeholder="Your email address" required style="width:100%;padding:14px 18px;border:none;border-radius:10px;font-size:15px;box-sizing:border-box;" />
     <button type="submit" style="width:100%;padding:16px;background:#e63946;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:16px;cursor:pointer;">Send Me the Free Guide →</button>
   </form>
   <p style="font-size:11px;margin-top:12px;opacity:0.7;">We respect your privacy. Unsubscribe anytime.</p>

8. <p> — Trust/urgency element. Centered. Example: "🔒 100% Free · No Credit Card Required · Instant Access"
   Style: text-align:center;font-size:14px;color:#666;margin:16px 0;

9. <p> — Privacy disclaimer. Tiny gray centered text.
   Style: text-align:center;font-size:11px;color:#bbb;margin-top:24px;

CRITICAL RULES:
- This page is about EMAIL CAPTURE, not selling a product
- Do NOT include affiliate CTA buttons — the form IS the conversion
- Keep it under 500 words — this is a squeeze page
- Make the free offer sound incredibly valuable
- Use the product intelligence to make bullet points specific and relevant
- The guide should feel like genuine value, not a sales pitch
${sharedBlockRules()}`;
}

function buildBlogPostPrompt({ productContext, affiliateLink, dateStr, year, emailSwipes }) {
   return `You are an SEO content writer who creates long-form, keyword-rich blog posts that rank on Google while naturally recommending products. Your posts read like genuine, helpful content — the kind people bookmark and share.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}
AFFILIATE LINK: ${affiliateLink}
${emailSwipes ? `EMAIL SWIPES (use for tone/angles):\n${emailSwipes}` : ''}

${productContext}

Write a COMPLETE SEO blog post (2000-2500 words). Each numbered item must be its OWN separate top-level HTML element:

1. <h1> — SEO headline. Include the main keyword naturally. Example: "[Product] Review ${year}: Does It Really Work? (Honest Look)"
   Style: font-size:32px;font-weight:800;line-height:1.25;color:#111;margin:0 0 8px;

2. <p> — Author + date + reading time.
   Style: font-size:13px;color:#999;margin:0 0 24px;

3. <div data-media-slot="hero" style="margin:0 0 28px;border-radius:12px;overflow:hidden;background:#f5f5f5;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add hero image</span></div>

4. <p> — Intro paragraph. What this post covers, who it's for, why you wrote it. Hook the reader.
   Style: font-size:17px;line-height:1.7;color:#444;margin:0 0 20px;

5. <div> — Table of contents (linked anchors are fine but optional). Use a light gray background box.
   Style: background:#f8fafc;border-radius:8px;padding:20px 24px;margin:0 0 28px;
   Inside: <h3>In This Article:</h3> and a <ul> of section titles

Then for each major section (6-8 sections), create separate elements:

<h2> — Section heading. Keyword-rich, informative.
   Style: font-size:22px;color:#111;margin:28px 0 12px;font-weight:700;

<p> — 2-4 paragraphs per section. Each is its own <p> element. Use bullet lists (<ul>) where appropriate. Reference data, ingredients, research.

Insert between sections as appropriate:
- <blockquote> for testimonials/expert quotes
- <div data-media-slot="..."> for image placeholders
- <ul> / <ol> for lists of benefits, ingredients, tips

After section 4 or 5, insert email opt-in:
<div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border-radius:16px;border:2px solid #86efac;text-align:center;">
  <h3 style="font-size:20px;font-weight:700;color:#166534;margin-bottom:8px;">Get Our Free Research Summary</h3>
  <p style="color:#4d7c0f;font-size:14px;margin-bottom:16px;">Join 10,000+ readers. Get the latest research delivered to your inbox.</p>
  <form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;max-width:340px;margin:0 auto;">
    <input type="email" name="email" placeholder="Your email" required style="width:100%;padding:12px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;box-sizing:border-box;" />
    <button type="submit" style="width:100%;padding:14px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:15px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">Subscribe Free →</button>
  </form>
</div>

Final elements:
- <h2> "Final Verdict" or "The Bottom Line"
- <p> — Honest recommendation paragraph
- <div> — CTA box with ${affiliateLink}
   Same style as the review article CTA block
- <p> — Affiliate disclaimer

TONE: Informative, balanced, SEO-friendly. Use natural keyword placement. Write for humans first, search engines second.
${sharedBlockRules()}`;
}

function buildImprovePrompt({ productContext, affiliateLink, dateStr, year, existingContent }) {
   return `You are an expert direct-response copywriter specializing in native advertising and affiliate content.

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
${sharedBlockRules()}`;
}

// ─── New template-specific prompt builders ─────────────────────

function buildVSLPrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are an expert video sales letter (VSL) copywriter. Create a complete VSL landing page.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

${productContext}
AFFILIATE LINK: ${affiliateLink}

Write a COMPLETE VSL page with this EXACT structure. Each numbered item is a SEPARATE top-level HTML element:

1. <div> — "ADVERTISEMENT" disclaimer bar, small centered text
2. <h1> — Large, urgent headline with curiosity hook (e.g. "Watch This Video Before It's Taken Down")
3. <p> — Subheadline building intrigue about the video content
4. <div> — Video placeholder area with dark background, centered play icon, and text "▶ Click to add video" (use data-media-slot="hero")
5. <div> — Bullet points container with checkmark emojis listing 4-5 key benefits
6. <div> — Social proof section with 2-3 short testimonials
7. <div> — Urgency bar (e.g. "Only X spots remain" or "Video may be removed soon")
8. <div> — CTA button section with large button linking to ${affiliateLink}, bold action text, and guarantee mention
9. <p> — Small disclaimer footer

Use dramatic colors, dark backgrounds (#111, #1a1a2e), bright accent colors for buttons.
All links point to: ${affiliateLink}
Use today's date: ${dateStr}. NEVER use a past year.

${sharedBlockRules()}`;
}

function buildComparisonPrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are an expert product comparison copywriter. Create a detailed product comparison/showdown page.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

${productContext}
AFFILIATE LINK: ${affiliateLink}

Write a COMPLETE comparison page with this EXACT structure. Each numbered item is a SEPARATE top-level HTML element:

1. <p> — Category label badge (e.g. "PRODUCT COMPARISON")
2. <h1> — Comparison headline (e.g. "Product A vs The Rest: Which One Actually Works?")
3. <p> — Subheadline with date and context
4. <div> — Hero image placeholder (data-media-slot="hero")
5. <div> — Introduction paragraph explaining why this comparison matters
6. <div> — Comparison table with styled rows comparing features side by side. Use a clear visual format with green checkmarks and red X marks. Compare at least 8 features.
7. <h2> — "The Clear Winner" section heading
8. <div> — Winner announcement with explanation of why the recommended product wins
9. <div> — 3 key advantages listed as styled cards
10. <blockquote> — Standout customer testimonial
11. <div> — CTA section with prominent button linking to ${affiliateLink}
12. <div> — FAQ section with 3-4 common comparison questions
13. <p> — Disclaimer footer

Use clean, professional styling. Green (#22c55e) for positive indicators, red (#ef4444) for negative.
All links point to: ${affiliateLink}
Use today's date: ${dateStr}. NEVER use a past year.

${sharedBlockRules()}`;
}

function buildSqueezePrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are an expert lead generation copywriter. Create a high-converting squeeze/email capture page.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

${productContext}
AFFILIATE LINK: ${affiliateLink}

Write a COMPLETE squeeze page with this EXACT structure. Each numbered item is a SEPARATE top-level HTML element:

1. <h1> — Bold, benefit-driven headline (centered, large font). Focus on what the visitor gets for free.
2. <p> — Short supporting subheadline reinforcing the value
3. <div> — Image placeholder for lead magnet cover (data-media-slot="hero")
4. <ul> — 4-5 bullet points with checkmark emojis describing what they'll learn/get
5. <div> — Email opt-in form with name field, email field, and submit button. Use a bold gradient background. The form should have the class "at-optin-form" and action="#".
6. <p> — Privacy reassurance (e.g. "We respect your privacy. Unsubscribe anytime.")
7. <p> — Small disclaimer footer

Keep it SHORT and focused — squeeze pages should be concise. Maximum 400 words.
Use vibrant gradient backgrounds for the opt-in section.
The CTA button on the form should say something compelling like "Send Me The Free Guide"
All links point to: ${affiliateLink}
Use today's date: ${dateStr}. NEVER use a past year.

${sharedBlockRules()}`;
}

function buildSideBySidePrompt({ productContext, affiliateLink, dateStr, year }) {
   return `You are an expert ad creative copywriter. Create a side-by-side ad landing page with a product image on the left and compelling copy on the right.

TODAY'S DATE: ${dateStr}
CURRENT YEAR: ${year}

${productContext}
AFFILIATE LINK: ${affiliateLink}

Write the ENTIRE page as a SINGLE top-level <div> with this EXACT structure:

<div class="at-sbs-layout" style="display:flex;gap:36px;align-items:flex-start;max-width:960px;margin:0 auto;padding:40px 24px;">
  <div class="at-sbs-left" style="flex:0 0 auto;width:340px;">
    <div data-media-slot="hero" style="width:100%;aspect-ratio:3/4;border-radius:16px;overflow:hidden;background:#f5f5f5;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
      <span style="color:#999;font-size:14px;">Click to add product image</span>
    </div>
  </div>
  <div class="at-sbs-right" style="flex:1;min-width:0;">
    <h1> — Bold, benefit-driven headline (32px, font-weight 800)
    <ul> — 3 bullet points using ✓ checkmarks (green color), each as a <li> with flexbox layout
    <a> — CTA button (gradient blue, large padding, rounded-lg, data-cta="true", href to affiliate link)
    <p> — Brief supporting text (14px, gray, 1-2 sentences of social proof or trust)
  </div>
</div>

IMPORTANT RULES:
- This is ONE single <div> element with class "at-sbs-layout" containing two child divs
- The left div has class "at-sbs-left", the right div has class "at-sbs-right"
- Each bullet should use: <li style="display:flex;align-items:flex-start;gap:10px;"><span style="color:#22c55e;font-size:20px;flex-shrink:0;">✓</span> [benefit text]</li>
- The <ul> should have: style="list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:14px;"
- CTA button: <a href="${affiliateLink}" target="_blank" data-cta="true" style="display:inline-block;padding:18px 40px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 6px 20px rgba(37,99,235,0.3);">Button Text →</a>
- Keep copy SHORT and punchy — this is an ad, not an article. Maximum 200 words of text total.
- Use today's date: ${dateStr}. NEVER use a past year.
- All links point to: ${affiliateLink}

OUTPUT: Return ONLY the single <div class="at-sbs-layout"> element. No markdown, no explanation, no code fences.`;
}

// ─── Pass 2: Generate page content ─────────────────────────────
async function generateArticlePage({ productName, productDescription, affiliateLink, style = 'review_article', emailSwipes = '', existingContent = '', productIntel = null, customDirection = '' }) {
   const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
   if (!apiKey) throw new Error('Gemini API key not configured. Add it in Admin Settings.');

   const today = new Date();
   const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
   const year = today.getFullYear();
   const productContext = buildProductContext(productName, productDescription, productIntel);

   const promptArgs = { productContext, affiliateLink, dateStr, year, emailSwipes, existingContent };

   // Pick the right prompt builder based on style
   let prompt;
   let maxTokens = 32768;

   if (existingContent) {
      prompt = buildImprovePrompt(promptArgs);
      maxTokens = 32768;
   } else {
      switch (style) {
         case 'video_presell':
         case 'vsl_classic':
            prompt = buildVideoPresellPrompt(promptArgs);
            maxTokens = 4096;
            break;
         case 'social_bridge':
         case 'social_tiktok':
         case 'social_instagram':
            prompt = buildSocialBridgePrompt(promptArgs);
            maxTokens = 4096;
            break;
         case 'lead_magnet':
         case 'lead_minimal':
         case 'lead_webinar':
            prompt = buildLeadMagnetPrompt(promptArgs);
            maxTokens = 8192;
            break;
         case 'squeeze_quick':
         case 'squeeze_countdown':
            prompt = buildSqueezePrompt(promptArgs);
            maxTokens = 4096;
            break;
         case 'listicle':
         case 'listicle_numbered':
         case 'listicle_comparison':
            prompt = buildListiclePrompt(promptArgs);
            maxTokens = 16384;
            break;
         case 'blog_post':
         case 'blog_editorial':
         case 'blog_pinterest':
            prompt = buildBlogPostPrompt(promptArgs);
            maxTokens = 32768;
            break;
         case 'comparison_showdown':
            prompt = buildComparisonPrompt(promptArgs);
            maxTokens = 16384;
            break;
         case 'ad_side_by_side':
            prompt = buildSideBySidePrompt(promptArgs);
            maxTokens = 4096;
            break;
         case 'advertorial':
         case 'health_review':
         case 'review_article':
         case 'review_clean':
         case 'review_authority':
         case 'review_urgent':
         default:
            prompt = buildReviewArticlePrompt(promptArgs);
            maxTokens = 32768;
            break;
      }
   }

   // Append custom direction if user provided one
   if (customDirection && customDirection.trim()) {
      prompt += `\n\nCUSTOM DIRECTION FROM THE USER — follow this closely:\n${customDirection.trim()}`;
   }

   const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

   const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         contents: [{ parts: [{ text: prompt }] }],
         generationConfig: {
            temperature: 0.85,
            maxOutputTokens: maxTokens,
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
