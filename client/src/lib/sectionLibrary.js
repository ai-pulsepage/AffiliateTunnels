/**
 * Pre-built Section Library — Ready-made multi-block sections
 * Each section contains an array of blocks that get inserted together.
 * Users can browse and insert these as one-click section additions.
 */

export const SECTION_CATEGORIES = [
    { id: 'hero', label: '🎯 Hero Sections', desc: 'Top-of-page attention grabbers' },
    { id: 'proof', label: '⭐ Social Proof', desc: 'Trust badges, testimonials, stats' },
    { id: 'offer', label: '💰 Offers & CTAs', desc: 'Pricing, urgency, value stacks' },
    { id: 'content', label: '📝 Content', desc: 'Articles, features, benefits' },
    { id: 'capture', label: '📧 Lead Capture', desc: 'Opt-in forms and lead magnets' },
];

export const SECTION_LIBRARY = [

    // ═══════════════════════════════════════════
    // HERO SECTIONS
    // ═══════════════════════════════════════════

    {
        id: 'hero_gradient_cta',
        name: 'Gradient Hero + CTA',
        desc: 'Full-bleed gradient with headline, subheadline, and CTA button',
        category: 'hero',
        emoji: '🌟',
        blocks: [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7);padding:80px 24px 60px;border-radius:0 0 32px 32px;text-align:center;"><h1 style="font-size:44px;font-weight:800;color:#fff;line-height:1.1;margin:0 auto 16px;max-width:640px;letter-spacing:-1px;">Your Headline Goes Here</h1><p style="font-size:20px;color:rgba(255,255,255,0.85);max-width:500px;margin:0 auto 32px;line-height:1.6;">Supporting text that reinforces the headline and motivates action.</p><a href="#" style="display:inline-block;padding:18px 52px;background:#fff;color:#4f46e5;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 8px 32px rgba(0,0,0,0.2);">Get Started Today →</a></div>' },
        ],
    },

    {
        id: 'hero_dark_stats',
        name: 'Dark Hero + Stats',
        desc: 'Dark background with neon accents and glassmorphism stat cards',
        category: 'hero',
        emoji: '🌙',
        blocks: [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#0f0f1a,#1a1a2e);padding:72px 24px;border-radius:24px;text-align:center;"><p style="font-size:13px;color:#22d3ee;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 20px;">✨ Premium</p><h1 style="font-size:42px;font-weight:800;color:#fff;line-height:1.1;margin:0 auto 16px;max-width:600px;">Your Headline Here</h1><p style="font-size:18px;color:rgba(255,255,255,0.6);max-width:480px;margin:0 auto 36px;">Subheadline supporting text goes here.</p><a href="#" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#22d3ee,#06b6d4);color:#0f172a;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 0 32px rgba(34,211,238,0.3);">Shop Now →</a></div>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0;"><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#22d3ee;margin:0;">94%</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Satisfaction Rate</p></div><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#a78bfa;margin:0;">50K+</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Customers</p></div><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#34d399;margin:0;">14 Days</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Avg. Results</p></div></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // SOCIAL PROOF SECTIONS
    // ═══════════════════════════════════════════

    {
        id: 'trust_strip_badges',
        name: 'Trust Badge Strip',
        desc: 'Horizontal row of trust badges and certifications',
        category: 'proof',
        emoji: '🛡️',
        blocks: [
            { type: 'text', html: '<div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap;padding:24px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;"><span style="font-size:13px;color:#64748b;font-weight:600;">🔬 Clinically Tested</span><span style="font-size:13px;color:#64748b;font-weight:600;">⭐ 4.9/5 Rating</span><span style="font-size:13px;color:#64748b;font-weight:600;">🛡️ 60-Day Guarantee</span><span style="font-size:13px;color:#64748b;font-weight:600;">📦 Free Shipping</span><span style="font-size:13px;color:#64748b;font-weight:600;">🇺🇸 Made in USA</span></div>' },
        ],
    },

    {
        id: 'testimonials_grid',
        name: 'Testimonial Cards',
        desc: 'Two-column testimonial grid with avatars and ratings',
        category: 'proof',
        emoji: '💬',
        blocks: [
            { type: 'text', html: '<h2 style="text-align:center;font-size:28px;font-weight:700;color:#0f172a;margin:0 0 24px;">What People Are Saying</h2>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;"><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px;border-radius:16px;"><p style="font-size:15px;color:#475569;margin:0 0 12px;line-height:1.6;font-style:italic;">"This product changed my life. I saw results within the first week."</p><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#dbeafe,#e0e7ff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div><div><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0;">Sarah M.</p><p style="font-size:12px;color:#f59e0b;margin:0;">⭐⭐⭐⭐⭐</p></div></div></div><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px;border-radius:16px;"><p style="font-size:15px;color:#475569;margin:0 0 12px;line-height:1.6;font-style:italic;">"I\'ve tried everything and this is the only thing that worked. Highly recommend."</p><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#dcfce7,#d1fae5);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div><div><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0;">Robert K.</p><p style="font-size:12px;color:#f59e0b;margin:0;">⭐⭐⭐⭐⭐</p></div></div></div></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // OFFER & CTA SECTIONS
    // ═══════════════════════════════════════════

    {
        id: 'value_stack_offer',
        name: 'Value Stack + CTA',
        desc: 'Crossed-out prices, total value, guarantee badge, CTA',
        category: 'offer',
        emoji: '💰',
        blocks: [
            { type: 'text', html: '<h2 style="font-size:28px;font-weight:800;text-align:center;color:#0f172a;margin:0 0 24px;">Here\'s Everything You Get:</h2>' },
            { type: 'text', html: '<div style="max-width:560px;margin:0 auto 24px;"><div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f8fafc;border-radius:10px;margin:6px 0;border-left:4px solid #16a34a;"><span style="font-size:16px;color:#0f172a;font-weight:600;">✅ Main Product</span><span style="font-size:16px;color:#dc2626;text-decoration:line-through;">$97</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f8fafc;border-radius:10px;margin:6px 0;border-left:4px solid #16a34a;"><span style="font-size:16px;color:#0f172a;font-weight:600;">✅ Bonus #1</span><span style="font-size:16px;color:#dc2626;text-decoration:line-through;">$47</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f8fafc;border-radius:10px;margin:6px 0;border-left:4px solid #16a34a;"><span style="font-size:16px;color:#0f172a;font-weight:600;">✅ Bonus #2</span><span style="font-size:16px;color:#dc2626;text-decoration:line-through;">$29</span></div><div style="padding:20px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;margin:12px 0;text-align:center;border:2px solid #86efac;"><p style="font-size:14px;color:#64748b;margin:0 0 4px;">Total Value: <span style="text-decoration:line-through;">$173</span></p><p style="font-size:32px;font-weight:800;color:#16a34a;margin:0;">Today Only: $49</p></div></div>' },
            { type: 'text', html: '<div style="max-width:480px;margin:0 auto 24px;padding:20px;background:#fffbeb;border-radius:12px;border:2px solid #fde68a;text-align:center;"><p style="font-size:18px;font-weight:700;color:#92400e;margin:0 0 4px;">🛡️ 60-Day Money-Back Guarantee</p><p style="font-size:14px;color:#a16207;margin:0;">Try it risk-free. Full refund if not satisfied.</p></div>' },
            { type: 'button', html: '<div style="text-align:center;padding:16px 0;"><a href="#" style="display:inline-block;padding:22px 72px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:22px;font-weight:800;border-radius:50px;text-decoration:none;box-shadow:0 8px 32px rgba(22,163,74,0.3);">🔥 Claim This Deal →</a><p style="font-size:13px;color:#64748b;margin:12px 0 0;">🔒 Secure 256-bit SSL checkout</p></div>' },
        ],
    },

    {
        id: 'urgency_countdown',
        name: 'Urgency Countdown',
        desc: 'Countdown timer with urgency messaging and CTA',
        category: 'offer',
        emoji: '⏰',
        blocks: [
            { type: 'text', html: '<div style="text-align:center;padding:28px;background:linear-gradient(135deg,#dc2626,#b91c1c);border-radius:16px;margin:24px 0;"><p style="font-size:18px;color:#fff;font-weight:700;margin:0 0 16px;">⏰ This Offer Expires In:</p><div data-countdown="24" style="display:flex;justify-content:center;gap:12px;"><div style="background:rgba(0,0,0,0.3);padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:32px;font-weight:800;color:#fff;margin:0;" data-cd-hours>23</p><p style="font-size:10px;color:rgba(255,255,255,0.7);margin:4px 0 0;text-transform:uppercase;">Hours</p></div><div style="background:rgba(0,0,0,0.3);padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:32px;font-weight:800;color:#fff;margin:0;" data-cd-mins>59</p><p style="font-size:10px;color:rgba(255,255,255,0.7);margin:4px 0 0;text-transform:uppercase;">Minutes</p></div><div style="background:rgba(0,0,0,0.3);padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:32px;font-weight:800;color:#fff;margin:0;" data-cd-secs>59</p><p style="font-size:10px;color:rgba(255,255,255,0.7);margin:4px 0 0;text-transform:uppercase;">Seconds</p></div></div></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // CONTENT SECTIONS
    // ═══════════════════════════════════════════

    {
        id: 'features_3col',
        name: '3-Column Features',
        desc: 'Icon + title + description in three columns',
        category: 'content',
        emoji: '✨',
        blocks: [
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:24px 0;"><div style="background:#f8fafc;padding:28px 24px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🧬</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Feature One</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Description of the first key feature or benefit.</p></div><div style="background:#f8fafc;padding:28px 24px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#059669,#10b981);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🌿</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Feature Two</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Description of the second key feature or benefit.</p></div><div style="background:#f8fafc;padding:28px 24px;border-radius:16px;text-align:center;border:1px solid #e2e8f0;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">⚡</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Feature Three</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Description of the third key feature or benefit.</p></div></div>' },
        ],
    },

    {
        id: 'benefits_pills',
        name: 'Pill Benefits',
        desc: 'Modern pill-shaped benefit items',
        category: 'content',
        emoji: '💊',
        blocks: [
            { type: 'text', html: '<div style="max-width:500px;margin:0 auto;"><div style="background:#fff;border:2px solid #e0e7ff;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#4f46e5;font-weight:600;">✅ Works in 7 days or less</div><div style="background:#fff;border:2px solid #dcfce7;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#16a34a;font-weight:600;">✅ 100% natural ingredients</div><div style="background:#fff;border:2px solid #fef3c7;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#d97706;font-weight:600;">⭐ 50,000+ 5-star reviews</div><div style="background:#fff;border:2px solid #fce7f3;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#db2777;font-weight:600;">🛡️ 60-day money-back guarantee</div></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // LEAD CAPTURE SECTIONS
    // ═══════════════════════════════════════════

    {
        id: 'optin_glass',
        name: 'Glassmorphism Opt-in',
        desc: 'Gradient background with frosted glass form card',
        category: 'capture',
        emoji: '🎯',
        blocks: [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#7c3aed,#db2777,#f59e0b);padding:60px 24px;border-radius:24px;text-align:center;"><h2 style="font-size:32px;font-weight:800;color:#fff;margin:0 0 12px;">Get the Free Blueprint</h2><p style="font-size:16px;color:rgba(255,255,255,0.8);margin:0 auto 28px;max-width:400px;">Join 15,000+ people who already have their copy.</p><div style="max-width:380px;margin:0 auto;padding:28px;background:rgba(255,255,255,0.12);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);border-radius:20px;"><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:14px 20px;border:none;border-radius:50px;font-size:15px;box-sizing:border-box;background:rgba(255,255,255,0.9);" /><input type="email" name="email" placeholder="Your Best Email" required style="width:100%;padding:14px 20px;border:none;border-radius:50px;font-size:15px;box-sizing:border-box;background:rgba(255,255,255,0.9);" /><button type="submit" style="width:100%;padding:16px;background:#fff;color:#7c3aed;font-size:16px;font-weight:700;border:none;border-radius:50px;cursor:pointer;">Download Free →</button></form><p style="color:rgba(255,255,255,0.6);font-size:11px;margin:10px 0 0;">🔒 No spam. Unsubscribe anytime.</p></div></div>' },
        ],
    },
];
