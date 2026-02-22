/**
 * AI Writer Service — Generates article/advertorial content using Gemini
 */
const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.0-flash';

async function generateArticlePage({ productName, productDescription, affiliateLink, style = 'advertorial', emailSwipes = '' }) {
    const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not configured. Add it in Admin Settings.');

    const styleGuide = {
        advertorial: 'Write as a news-style advertorial article. Use a journalistic tone with research citations, expert quotes, and a compelling narrative. The article should read like a real news story, not a sales page.',
        health_review: 'Write as a health/wellness product review article. Include scientific-sounding evidence, before/after stories, and expert endorsements.',
        listicle: 'Write as a numbered listicle (e.g., "7 Reasons Why..."). Each point should be compelling and build toward the product recommendation.',
    };

    const prompt = `You are an expert direct-response copywriter who specializes in native advertising and advertorial content for health/wellness affiliate products.

Generate a COMPLETE HTML article/advertorial landing page for the following product:

PRODUCT: ${productName}
DESCRIPTION: ${productDescription}
AFFILIATE LINK: ${affiliateLink}
${emailSwipes ? `EMAIL SWIPES (use these for tone and angles):\n${emailSwipes}` : ''}

STYLE: ${styleGuide[style] || styleGuide.advertorial}

REQUIREMENTS:
1. The page must look like a REAL news article, not a sales page
2. Use Georgia/serif font for body text
3. Include an "ADVERTISEMENT" disclaimer bar at the top
4. Include a category label (e.g., "HEALTH & WELLNESS") in red
5. Include a compelling, curiosity-driven headline
6. Include author byline with avatar initials, date, and reading time
7. Include placeholder for hero image: <img src="https://placehold.co/720x400/f8fafc/475569?text=Article+Image" />
8. Write 4-6 paragraphs of compelling article content with:
   - Opening hook that creates curiosity
   - Research/study references (can be fictional but realistic)
   - Expert quote in a blockquote
   - Subheadings to break up content
9. Include a mid-article email opt-in form with this EXACT HTML:
   <div style="max-width: 520px; margin: 48px auto; padding: 36px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 16px; border: 2px solid #86efac; text-align: center;">
     <h3 style="font-size: 22px; font-weight: 700; color: #166534; margin-bottom: 8px;">Want the Full Report?</h3>
     <p style="color: #4d7c0f; font-size: 15px; margin-bottom: 20px;">Enter your email to get the complete research breakdown — free.</p>
     <form data-at-form="optin" style="display: flex; flex-direction: column; gap: 10px; max-width: 360px; margin: 0 auto;">
       <input type="text" name="name" placeholder="Your Name" style="width: 100%; padding: 14px 18px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 15px; box-sizing: border-box;" />
       <input type="email" name="email" placeholder="Your Email Address" required style="width: 100%; padding: 14px 18px; border: 1px solid #d1d5db; border-radius: 10px; font-size: 15px; box-sizing: border-box;" />
       <button type="submit" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-size: 17px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;">Send Me the Report →</button>
     </form>
     <p style="color: #6b7280; font-size: 11px; margin-top: 10px;">By signing up you agree to receive emails. Unsubscribe anytime.</p>
   </div>
10. After the opt-in, continue with more social proof content
11. Include a final CTA button linking to: ${affiliateLink}
    Use this style: background: linear-gradient(135deg, #f59e0b, #d97706); with amber/gold color
12. Include footer with affiliate disclaimer and ClickBank trademark notice
13. All styles must be INLINE (no <style> blocks) — this goes into a page builder
14. Use white (#ffffff) background for the article body area, NOT dark theme
15. Wrap everything in a single <div style="background: #ffffff; min-height: 100vh;">

OUTPUT: Return ONLY the HTML content. No markdown, no explanation, no code fences.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 8192,
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

module.exports = { generateArticlePage };
