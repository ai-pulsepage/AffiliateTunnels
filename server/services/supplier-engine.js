const { getSetting } = require('../config/settings');

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Uses Gemini to discover top manufacturers for a given niche.
 * Bypasses the need for complex/fragile scrapers.
 */
async function discoverManufacturers(niche, apiKey) {
    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    }
    if (!apiKey) throw new Error('Gemini API key is not configured');

    const prompt = `You are an expert B2B sourcing agent and industry researcher.
I need to find the top, most reputable manufacturers and distributors for the following product niche: "${niche}".
Focus on companies that serve the US/Canada market, ideally those that offer dropshipping, wholesale, or dealer programs for high-ticket items.

Return a valid JSON array of objects. Do not include markdown code block wrappers (like \`\`\`json). Just the raw array.

Each object must have exactly these fields:
{
    "name": "Company Name",
    "website_url": "https://www.company.com (must be a valid, real URL)",
    "description": "1-2 sentence description of what they make and why they are good",
    "estimated_size": "Small / Medium / Large / Enterprise",
    "country": "USA / Canada / Global"
}

Provide the top 5 to 10 companies. Only provide real, verified companies.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2, // Low temp for factual data
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini discovery failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Clean up just in case Gemini ignored responseMimeType
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (err) {
        console.error('Failed to parse Gemini manufacturer response:', text);
        return [];
    }
}

/**
 * Generates a highly personalized B2B outreach email for a specific manufacturer.
 */
async function generatePitch(manufacturer, customNotes, apiKey) {
    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
    }
    if (!apiKey) throw new Error('Gemini API key is not configured');

    const prompt = `You are an expert B2B business development manager.
Write a highly professional, concise, and persuasive outreach email to a manufacturer. The goal is to open a dialogue to become an authorized retailer or dropshipper for their products.

MANUFACTURER DETAILS:
Name: ${manufacturer.name}
Website: ${manufacturer.website_url || 'N/A'}
Description: ${manufacturer.description || 'N/A'}

USER'S CUSTOM NOTES (Incorporate these if relevant):
${customNotes || 'None provided.'}

REQUIREMENTS:
1. Subject line should be intriguing but professional (e.g., "Retail Partnership Inquiry - [My Store] x ${manufacturer.name}"). Output the subject line first, prefixed with "Subject: ".
2. The tone should be confident and professional—we are an established e-commerce operation looking to expand our high-ticket catalog.
3. Keep it concise (under 200 words). Busy executives don't read long emails.
4. Do NOT use generic placeholders like [Your Name] unless absolutely necessary. Assume the user will fill in their specific signature.
5. Emphasize that we can drive high-quality, targeted traffic to their brand without discounting their MSRP.

Output ONLY the email text (Subject line + Body). No conversational intro or outro.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini pitch generation failed: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text.trim();
}

module.exports = {
    discoverManufacturers,
    generatePitch
};
