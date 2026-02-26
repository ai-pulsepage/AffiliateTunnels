/**
 * Premium Page Templates — Enterprise-quality designs per page type
 * Each template has: name, desc, emoji, category, traffic[], structure[], blocks(hoplink)
 * Structure metadata is used by AI writer to match output to template layout
 */

// ─── TEMPLATE CATEGORIES ──────────────────────
export const TEMPLATE_CATEGORIES = [
    { id: 'bridge', label: 'Bridge / Review', emoji: '📰', desc: 'Pre-sell articles that warm up traffic before the offer' },
    { id: 'listicle', label: 'Listicle', emoji: '📝', desc: 'Numbered benefit articles for native & SEO traffic' },
    { id: 'social', label: 'Social Bridge', emoji: '📱', desc: 'Short punchy pages for social media traffic' },
    { id: 'lead', label: 'Lead Magnet', emoji: '🎁', desc: 'Email capture pages with value propositions' },
    { id: 'blog', label: 'Blog Post', emoji: '✍️', desc: 'SEO-optimized editorial content' },
    { id: 'vsl', label: 'VSL Page', emoji: '🎬', desc: 'Video sales letter with minimal distraction' },
    { id: 'comparison', label: 'Comparison', emoji: '⚖️', desc: 'Product comparison with verdict' },
    { id: 'squeeze', label: 'Squeeze Page', emoji: '🎯', desc: 'Ultra-focused email capture' },
    { id: 'ad', label: 'Ad Creative', emoji: '📢', desc: 'Split-layout ad-style pages for native, display & social' },
];

// ─── TEMPLATES ────────────────────────────────
export const PAGE_TEMPLATES = {

    // ═══════════════════════════════════════════
    // BRIDGE / REVIEW (3 variations)
    // ═══════════════════════════════════════════

    review_clean: {
        name: 'Clean Editorial',
        desc: 'White, minimal, trust-focused review article',
        emoji: '📰',
        category: 'bridge',
        traffic: ['native', 'seo', 'pinterest'],
        structure: [
            { role: 'disclaimer', type: 'text' },
            { role: 'category_label', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'byline', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'section_heading', type: 'heading' },
            { role: 'body', type: 'text' },
            { role: 'expert_quote', type: 'quote' },
            { role: 'section_heading', type: 'heading' },
            { role: 'ingredients', type: 'text' },
            { role: 'mid_image', type: 'image' },
            { role: 'optin_form', type: 'optin' },
            { role: 'testimonials', type: 'quote' },
            { role: 'pros_cons', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<p style="font-size:11px;color:#9ca3af;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:12px;background:#f9fafb;border-radius:8px;margin:0 0 24px;">Advertisement</p>' },
            { type: 'text', html: '<p style="font-size:13px;font-weight:600;color:#dc2626;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Health & Wellness Review</p>' },
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;line-height:1.2;color:#0f172a;margin:0 0 16px;letter-spacing:-0.5px;">I Tried This Natural Solution For 30 Days — Here\'s My Honest Review</h1>' },
            { type: 'text', html: `<p style="font-size:14px;color:#94a3b8;margin:0 0 28px;padding-bottom:20px;border-bottom:1px solid #e2e8f0;">By Sarah Mitchell · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · 8 min read</p>` },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:16px;margin:0 0 32px;min-height:240px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add hero image</span></div>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.8;color:#334155;"><p>When my friend first told me about this product, I was skeptical. I\'d tried dozens of solutions before, and none of them delivered on their promises.</p><p style="margin-top:16px;">But after seeing her results firsthand, I decided to give it one more shot. What happened next genuinely surprised me...</p></div>' },
            { type: 'heading', html: '<h2 style="font-size:26px;font-weight:700;color:#0f172a;margin:36px 0 16px;padding-top:16px;border-top:1px solid #f1f5f9;">What Is This Product?</h2>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#475569;"><p>Unlike typical solutions that only address symptoms, this approach targets the root cause. Clinical research from leading universities has identified the key mechanism...</p><p style="margin-top:16px;">The formula combines several clinically-studied ingredients, each chosen for a specific purpose in supporting your body\'s natural processes.</p></div>' },
            { type: 'quote', html: '<blockquote style="border-left:4px solid #3b82f6;padding:20px 24px;margin:28px 0;background:linear-gradient(135deg,#eff6ff,#f0f9ff);border-radius:0 12px 12px 0;"><p style="margin:0;font-size:17px;color:#1e40af;font-style:italic;line-height:1.6;">"The research on these ingredients is compelling. We\'re seeing consistent results across multiple clinical trials."</p><p style="margin:12px 0 0;font-size:13px;color:#64748b;">— Dr. James Chen, Nutritional Science Research</p></blockquote>' },
            { type: 'heading', html: '<h2 style="font-size:26px;font-weight:700;color:#0f172a;margin:36px 0 16px;">Key Ingredients Breakdown</h2>' },
            { type: 'text', html: '<div style="font-size:16px;color:#475569;"><div style="padding:16px 20px;margin:12px 0;background:#f8fafc;border-radius:10px;border-left:3px solid #3b82f6;"><strong style="font-size:17px;color:#1e293b;">Ingredient One</strong><p style="margin:6px 0 0;color:#475569;font-size:15px;">Clinically shown to support key biological processes. Multiple peer-reviewed studies confirm its effectiveness.</p></div><div style="padding:16px 20px;margin:12px 0;background:#f8fafc;border-radius:10px;border-left:3px solid #10b981;"><strong style="font-size:17px;color:#1e293b;">Ingredient Two</strong><p style="margin:6px 0 0;color:#475569;font-size:15px;">A powerful natural compound that works synergistically with the other ingredients for maximum absorption.</p></div><div style="padding:16px 20px;margin:12px 0;background:#f8fafc;border-radius:10px;border-left:3px solid #8b5cf6;"><strong style="font-size:17px;color:#1e293b;">Ingredient Three</strong><p style="margin:6px 0 0;color:#475569;font-size:15px;">The latest breakthrough discovery, backed by emerging research from top laboratories worldwide.</p></div></div>' },
            { type: 'image', html: '<div data-media-slot="mid" style="text-align:center;padding:30px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:16px;margin:24px 0;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:14px;">📸 Click to add supporting image</span></div>' },
            { type: 'optin', html: '<div style="max-width:520px;margin:40px auto;padding:36px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:16px;border:2px solid #93c5fd;text-align:center;"><h3 style="font-size:22px;font-weight:700;color:#1e40af;margin-bottom:8px;">📨 Get the Full Research Report</h3><p style="color:#3b82f6;font-size:15px;margin-bottom:20px;">Enter your email for exclusive ingredient analysis and reader results.</p><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;max-width:360px;margin:0 auto;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:14px 18px;border:1px solid #bfdbfe;border-radius:10px;font-size:15px;box-sizing:border-box;" /><input type="email" name="email" placeholder="Your Email" required style="width:100%;padding:14px 18px;border:1px solid #bfdbfe;border-radius:10px;font-size:15px;box-sizing:border-box;" /><button type="submit" style="width:100%;padding:16px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:16px;font-weight:700;border:none;border-radius:10px;cursor:pointer;">Send Me the Report →</button></form><p style="color:#94a3b8;font-size:11px;margin-top:10px;">We respect your privacy. Unsubscribe anytime.</p></div>' },
            { type: 'quote', html: '<blockquote style="border-left:4px solid #10b981;padding:20px 24px;margin:28px 0;background:#f0fdf4;border-radius:0 12px 12px 0;"><p style="margin:0;font-size:16px;color:#166534;font-style:italic;">"After trying dozens of solutions, this was the first thing that actually made a noticeable difference. I\'m so glad I gave it a chance."</p><p style="margin:10px 0 0;font-size:13px;color:#6b7280;">— Jennifer R., Verified Customer</p></blockquote>' },
            { type: 'text', html: '<div style="font-size:16px;line-height:1.7;color:#475569;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin:32px 0 16px;">Pros & Cons</h2><div style="display:grid;gap:8px;"><p style="margin:0;">✅ Backed by clinical research</p><p style="margin:0;">✅ 100% natural ingredients</p><p style="margin:0;">✅ Results in as little as 2 weeks</p><p style="margin:0;">✅ 60-day money-back guarantee</p><p style="margin:0;">⚠️ Only available online</p><p style="margin:0;">⚠️ May sell out due to high demand</p></div></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#1e40af,#1d4ed8);border-radius:16px;padding:40px;text-align:center;margin:36px 0;box-shadow:0 8px 32px rgba(30,64,175,0.2);"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 10px;">Ready to Try It Risk-Free?</p><p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0 0 24px;">60-day money-back guarantee · Free shipping</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#1e40af;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.1);">Visit Official Website →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #f1f5f9;">Disclaimer: This article contains affiliate links. Individual results may vary. This content is not medical advice.</p>' },
        ],
    },

    review_authority: {
        name: 'Authority Expert',
        desc: 'Dark accents, credential badges, data-heavy review',
        emoji: '🏅',
        category: 'bridge',
        traffic: ['native', 'seo'],
        structure: [
            { role: 'disclaimer', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'authority_bar', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'data_section', type: 'text' },
            { role: 'expert_quote', type: 'quote' },
            { role: 'ingredients', type: 'text' },
            { role: 'cta_mid', type: 'button' },
            { role: 'testimonials', type: 'text' },
            { role: 'verdict', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<p style="font-size:11px;color:#9ca3af;text-align:center;text-transform:uppercase;letter-spacing:2px;padding:10px;background:#111827;border-radius:8px;margin:0 0 20px;color:#6b7280;">Sponsored Content</p>' },
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;line-height:1.2;color:#0f172a;margin:0 0 16px;">Breaking: New Clinical Study Reveals Breakthrough Natural Solution — Here\'s What the Data Shows</h1>' },
            { type: 'text', html: '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:16px 0;margin:0 0 24px;border-top:2px solid #0f172a;border-bottom:2px solid #0f172a;"><span style="font-size:12px;color:#fff;background:#0f172a;padding:4px 12px;border-radius:20px;font-weight:600;">📊 Research-Based</span><span style="font-size:12px;color:#fff;background:#1e40af;padding:4px 12px;border-radius:20px;font-weight:600;">🔬 Clinically Studied</span><span style="font-size:12px;color:#fff;background:#059669;padding:4px 12px;border-radius:20px;font-weight:600;">✅ Editor\'s Choice 2025</span><span style="font-size:12px;color:#6b7280;padding:4px 0;">Updated: ' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '</span></div>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:#0f172a;border-radius:16px;margin:0 0 32px;min-height:240px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#64748b;font-size:15px;">📸 Click to add hero image</span></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#334155;"><p>A landmark clinical study published this year has identified a natural compound that outperforms conventional approaches by a significant margin. The research, conducted across 3 independent labs, involved over 5,000 participants.</p><p style="margin-top:16px;">The findings have caught the attention of leading researchers and health professionals worldwide. Here\'s a deep dive into the data — and what it means for you.</p></div>' },
            { type: 'text', html: '<div style="background:#f8fafc;border-radius:16px;padding:28px;margin:24px 0;border:1px solid #e2e8f0;"><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;">📊 Key Study Results</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;"><div style="background:white;padding:20px;border-radius:12px;border:1px solid #e2e8f0;"><p style="font-size:32px;font-weight:800;color:#2563eb;margin:0;">94%</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Satisfaction Rate</p></div><div style="background:white;padding:20px;border-radius:12px;border:1px solid #e2e8f0;"><p style="font-size:32px;font-weight:800;color:#059669;margin:0;">2.3x</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">More Effective</p></div><div style="background:white;padding:20px;border-radius:12px;border:1px solid #e2e8f0;"><p style="font-size:32px;font-weight:800;color:#8b5cf6;margin:0;">14 Days</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Avg. Time to Results</p></div></div></div>' },
            { type: 'quote', html: '<blockquote style="border-left:4px solid #0f172a;padding:20px 24px;margin:28px 0;background:#f1f5f9;border-radius:0 12px 12px 0;"><p style="margin:0;font-size:17px;color:#1e293b;font-style:italic;line-height:1.6;">"In my 20 years of research, I\'ve rarely seen such consistent results from a natural compound. The data speaks for itself."</p><p style="margin:12px 0 0;font-size:13px;color:#64748b;font-weight:600;">— Dr. Robert Hayes, PhD · Clinical Nutrition Research</p></blockquote>' },
            { type: 'text', html: '<div style="font-size:16px;color:#475569;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin:32px 0 16px;">Ingredient Analysis</h2><div style="padding:16px 20px;margin:12px 0;background:#0f172a;border-radius:10px;color:#fff;"><strong style="font-size:16px;color:#60a5fa;">Primary Compound</strong><p style="margin:6px 0 0;color:#cbd5e1;font-size:15px;">The core active ingredient, backed by 47 peer-reviewed studies across 12 countries.</p></div><div style="padding:16px 20px;margin:12px 0;background:#1e293b;border-radius:10px;color:#fff;"><strong style="font-size:16px;color:#34d399;">Bioavailability Enhancer</strong><p style="margin:6px 0 0;color:#cbd5e1;font-size:15px;">Increases absorption by up to 3x compared to standard formulations.</p></div></div>' },
            { type: 'button', html: `<div style="background:#0f172a;border-radius:16px;padding:32px;text-align:center;margin:32px 0;"><p style="font-size:18px;color:#e2e8f0;font-weight:600;margin:0 0 16px;">See the complete clinical data and special pricing →</p><a href="${hoplink}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:17px;font-weight:700;border-radius:10px;text-decoration:none;">View Official Research Page</a></div>` },
            { type: 'text', html: '<div style="font-size:16px;color:#475569;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin:32px 0 16px;">What Users Are Reporting</h2><div style="background:#f0fdf4;padding:20px;border-radius:12px;margin:12px 0;border:1px solid #bbf7d0;"><p style="margin:0;font-size:15px;color:#166534;"><strong>Mark T., 52</strong> — "The difference was noticeable within the first week. I wish I\'d found this sooner."</p></div><div style="background:#eff6ff;padding:20px;border-radius:12px;margin:12px 0;border:1px solid #bfdbfe;"><p style="margin:0;font-size:15px;color:#1e40af;"><strong>Lisa K., 45</strong> — "I was skeptical at first, but the results convinced me. I\'ve recommended it to everyone."</p></div></div>' },
            { type: 'text', html: '<div style="background:#f8fafc;border-radius:16px;padding:28px;margin:24px 0;border:2px solid #0f172a;"><h3 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 12px;">🏆 Our Verdict: 9.4/10</h3><p style="font-size:16px;color:#475569;line-height:1.7;margin:0;">Based on the clinical evidence, user reports, and overall value proposition, this is one of the most promising natural solutions we\'ve reviewed. The 60-day money-back guarantee makes it essentially risk-free to try.</p></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:40px;text-align:center;margin:36px 0;box-shadow:0 8px 32px rgba(15,23,42,0.3);"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 8px;">Claim Your Risk-Free Trial</p><p style="font-size:15px;color:#94a3b8;margin:0 0 24px;">60-day guarantee · Free shipping · Secure checkout</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 4px 20px rgba(37,99,235,0.3);">Get Started Now →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #f1f5f9;">Disclaimer: This article contains affiliate links. Individual results may vary.</p>' },
        ],
    },

    review_urgent: {
        name: 'Urgent / Scarcity',
        desc: 'Bold CTAs, red accents, urgency-driven',
        emoji: '🔥',
        category: 'bridge',
        traffic: ['native', 'facebook'],
        structure: [
            { role: 'urgency_banner', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'social_proof', type: 'text' },
            { role: 'benefits', type: 'list' },
            { role: 'cta_mid', type: 'button' },
            { role: 'testimonials', type: 'quote' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:14px 20px;border-radius:12px;text-align:center;margin:0 0 20px;"><p style="font-size:14px;color:#fff;font-weight:700;margin:0;">⚡ SPECIAL OFFER — Limited Stock Available | 67% OFF Today Only</p></div>' },
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;line-height:1.15;color:#0f172a;margin:0 0 20px;text-align:center;">Thousands Are Racing to Get This Before It Sells Out Again</h1>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:16px;margin:0 0 24px;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #fca5a5;"><span style="color:#ef4444;font-size:15px;">📸 Click to add product image</span></div>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.7;color:#334155;text-align:center;max-width:600px;margin:0 auto 24px;"><p>This product went <strong style="color:#dc2626;">viral on social media</strong> after users started sharing their incredible results. Since then, it\'s sold out <strong>3 times</strong> — and just came back in stock today.</p></div>' },
            { type: 'text', html: '<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:20px;background:#f8fafc;border-radius:12px;margin:0 0 24px;"><span style="background:#dcfce7;color:#166534;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;">⭐ 4.9/5 Stars</span><span style="background:#dbeafe;color:#1e40af;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;">👥 50,000+ Sold</span><span style="background:#fef3c7;color:#92400e;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;">🏆 #1 Best Seller</span></div>' },
            { type: 'list', html: '<ul style="list-style:none;padding:0;font-size:18px;line-height:2.2;max-width:520px;margin:0 auto 24px;"><li>✅ Works in as little as <strong>7 days</strong></li><li>✅ 100% natural — <strong>no side effects</strong></li><li>✅ Over <strong>50,000 happy customers</strong></li><li>✅ <strong>60-day money-back guarantee</strong></li><li>✅ <strong>Free shipping</strong> on all orders today</li></ul>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#dc2626,#991b1b);border-radius:16px;padding:36px;text-align:center;margin:24px 0;box-shadow:0 8px 32px rgba(220,38,38,0.25);"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 8px;">⚡ Claim Your 67% Discount</p><p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 20px;">Only 47 units left at this price</p><a href="${hoplink}" style="display:inline-block;padding:20px 60px;background:#fff;color:#dc2626;font-size:20px;font-weight:800;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.15);">YES! Reserve Mine Now →</a></div>` },
            { type: 'quote', html: '<div style="margin:24px 0;"><blockquote style="border-left:4px solid #dc2626;padding:16px 20px;margin:12px 0;background:#fef2f2;border-radius:0 10px 10px 0;"><p style="margin:0;font-size:16px;color:#991b1b;font-style:italic;">"I almost didn\'t order because I thought it was too good to be true. SO glad I did. Best decision I\'ve made this year."</p><p style="margin:8px 0 0;font-size:13px;color:#6b7280;">— Amanda T., ⭐⭐⭐⭐⭐</p></blockquote><blockquote style="border-left:4px solid #f59e0b;padding:16px 20px;margin:12px 0;background:#fffbeb;border-radius:0 10px 10px 0;"><p style="margin:0;font-size:16px;color:#92400e;font-style:italic;">"I ordered 3 bottles and I\'m already seeing results. My only regret is not finding this sooner!"</p><p style="margin:8px 0 0;font-size:13px;color:#6b7280;">— Michael R., ⭐⭐⭐⭐⭐</p></blockquote></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:16px;padding:40px;text-align:center;margin:36px 0;box-shadow:0 8px 32px rgba(245,158,11,0.25);"><p style="font-size:26px;color:#fff;font-weight:800;margin:0 0 8px;">⏰ Don't Miss Out</p><p style="font-size:16px;color:rgba(255,255,255,0.85);margin:0 0 24px;">This special pricing expires when stock runs out</p><a href="${hoplink}" style="display:inline-block;padding:20px 64px;background:#fff;color:#d97706;font-size:20px;font-weight:800;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,0.1);">Get My Discount Now →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary. This site is not part of Facebook or Google.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // LISTICLE (2 variations)
    // ═══════════════════════════════════════════

    listicle_numbered: {
        name: 'Numbered Benefits',
        desc: 'Clean numbered benefit cards with CTA',
        emoji: '📝',
        category: 'listicle',
        traffic: ['native', 'seo'],
        structure: [
            { role: 'category_label', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'intro', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'numbered_items', type: 'text' },
            { role: 'mid_image', type: 'image' },
            { role: 'cta_mid', type: 'button' },
            { role: 'more_items', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<p style="font-size:13px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Trending Now</p>' },
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;line-height:1.2;color:#0f172a;margin:0 0 16px;">7 Reasons Why Thousands Are Making the Switch (And Why You Should Too)</h1>' },
            { type: 'text', html: '<p style="font-size:18px;color:#64748b;margin:0 0 28px;line-height:1.6;">Experts are calling this the most significant breakthrough in years. Here\'s what the research actually shows.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#faf5ff,#f3e8ff);border-radius:16px;margin:0 0 32px;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e9d5ff;"><span style="color:#8b5cf6;font-size:15px;">📸 Click to add hero image</span></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#334155;"><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #7c3aed;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">1. Backed by Clinical Research</h3><p style="margin:0;color:#475569;">Multiple peer-reviewed studies confirm the effectiveness of the key ingredients, with consistent results across diverse populations.</p></div><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #2563eb;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">2. Zero Harsh Side Effects</h3><p style="margin:0;color:#475569;">Users report virtually zero negative side effects, making it one of the safest options available today.</p></div><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #059669;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">3. Results in as Little as 2 Weeks</h3><p style="margin:0;color:#475569;">Participants in clinical trials reported noticeable improvements within the first 14 days of consistent use.</p></div><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #dc2626;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">4. 100% Natural Ingredients</h3><p style="margin:0;color:#475569;">Every ingredient is sourced from nature and rigorously tested for purity and potency.</p></div></div>' },
            { type: 'image', html: '<div data-media-slot="mid" style="text-align:center;padding:30px;background:#f8fafc;border-radius:16px;margin:24px 0;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:14px;">📸 Click to add image</span></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:16px;padding:36px;text-align:center;margin:24px 0;box-shadow:0 8px 32px rgba(124,58,237,0.2);"><p style="font-size:20px;color:#fff;font-weight:700;margin:0 0 16px;">Ready to Experience the Difference?</p><a href="${hoplink}" style="display:inline-block;padding:16px 52px;background:#fff;color:#6d28d9;font-size:17px;font-weight:700;border-radius:10px;text-decoration:none;">See Special Pricing →</a></div>` },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#334155;"><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #f59e0b;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">5. Easy to Use Daily</h3><p style="margin:0;color:#475569;">No complicated routines — just take it once a day and let it work.</p></div><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #ec4899;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">6. Surprisingly Affordable</h3><p style="margin:0;color:#475569;">Costs a fraction of alternatives with better results and a satisfaction guarantee.</p></div><div style="background:#f8fafc;border-radius:12px;padding:24px;margin:16px 0;border-left:4px solid #10b981;"><h3 style="font-size:20px;color:#0f172a;margin:0 0 8px;">7. 60-Day Money-Back Guarantee</h3><p style="margin:0;color:#475569;">Try it completely risk-free. Not satisfied? Get a full refund, no questions asked.</p></div></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:16px;padding:40px;text-align:center;margin:36px 0;"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 24px;">Don't Wait — Try It Risk-Free Today</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#5b21b6;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;">Get Started Now →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #f1f5f9;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    listicle_comparison: {
        name: 'Comparison Chart',
        desc: 'Side-by-side comparison table with verdict',
        emoji: '⚖️',
        category: 'listicle',
        traffic: ['seo', 'native'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'intro', type: 'text' },
            { role: 'comparison_table', type: 'text' },
            { role: 'body', type: 'text' },
            { role: 'verdict', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:800;color:#0f172a;text-align:center;margin:0 0 16px;">[Product] vs. The Competition: Which One Actually Works?</h1>' },
            { type: 'text', html: '<p style="font-size:18px;color:#64748b;text-align:center;max-width:600px;margin:0 auto 32px;">We tested the top 3 options side-by-side. Here\'s what the data reveals.</p>' },
            { type: 'text', html: '<div style="overflow-x:auto;margin:24px 0;"><table style="width:100%;border-collapse:collapse;font-size:15px;"><thead><tr style="background:#0f172a;color:#fff;"><th style="padding:14px 20px;text-align:left;border-radius:8px 0 0 0;">Feature</th><th style="padding:14px 20px;text-align:center;background:#2563eb;">⭐ Our Pick</th><th style="padding:14px 20px;text-align:center;">Option B</th><th style="padding:14px 20px;text-align:center;border-radius:0 8px 0 0;">Option C</th></tr></thead><tbody><tr style="background:#f8fafc;"><td style="padding:12px 20px;font-weight:600;">Clinically Proven</td><td style="padding:12px 20px;text-align:center;color:#16a34a;font-weight:700;">✅ Yes</td><td style="padding:12px 20px;text-align:center;color:#dc2626;">❌ No</td><td style="padding:12px 20px;text-align:center;color:#f59e0b;">⚠️ Limited</td></tr><tr><td style="padding:12px 20px;font-weight:600;">Natural Ingredients</td><td style="padding:12px 20px;text-align:center;color:#16a34a;font-weight:700;">✅ 100%</td><td style="padding:12px 20px;text-align:center;color:#f59e0b;">⚠️ Partial</td><td style="padding:12px 20px;text-align:center;color:#16a34a;">✅ Yes</td></tr><tr style="background:#f8fafc;"><td style="padding:12px 20px;font-weight:600;">Money-Back Guarantee</td><td style="padding:12px 20px;text-align:center;color:#16a34a;font-weight:700;">✅ 60 Days</td><td style="padding:12px 20px;text-align:center;">30 Days</td><td style="padding:12px 20px;text-align:center;color:#dc2626;">❌ None</td></tr><tr><td style="padding:12px 20px;font-weight:600;">Free Shipping</td><td style="padding:12px 20px;text-align:center;color:#16a34a;font-weight:700;">✅ Yes</td><td style="padding:12px 20px;text-align:center;color:#dc2626;">❌ No</td><td style="padding:12px 20px;text-align:center;color:#16a34a;">✅ Yes</td></tr><tr style="background:#f8fafc;"><td style="padding:12px 20px;font-weight:600;">Our Rating</td><td style="padding:12px 20px;text-align:center;font-weight:800;color:#2563eb;">9.5/10</td><td style="padding:12px 20px;text-align:center;">6.2/10</td><td style="padding:12px 20px;text-align:center;">7.1/10</td></tr></tbody></table></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#475569;"><p>After thorough testing, the results were clear. While all three products had their merits, only one consistently delivered on its promises across the board.</p><p style="margin-top:16px;">The key differentiator was the quality of ingredients and the clinical backing — something the competition simply couldn\'t match.</p></div>' },
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:16px;padding:28px;margin:24px 0;border:2px solid #93c5fd;"><h3 style="font-size:22px;font-weight:700;color:#1e40af;margin:0 0 12px;">🏆 Our Verdict: Clear Winner</h3><p style="font-size:16px;color:#475569;line-height:1.7;margin:0;">Based on clinical evidence, value, and user satisfaction, this product stands head and shoulders above the competition. With a 60-day guarantee, there\'s zero risk in trying it yourself.</p></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:16px;padding:40px;text-align:center;margin:36px 0;"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 24px;">Try the #1 Rated Option Risk-Free</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#1d4ed8;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;">See Today's Best Price →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // SOCIAL BRIDGE (2 variations)
    // ═══════════════════════════════════════════

    social_tiktok: {
        name: 'TikTok Viral',
        desc: 'Bold, video-first, emoji-heavy for social traffic',
        emoji: '🎵',
        category: 'social',
        traffic: ['tiktok', 'instagram', 'facebook'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'hero_video', type: 'video' },
            { role: 'benefits', type: 'list' },
            { role: 'social_proof', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 12px;">🔥 This Changed EVERYTHING For Me</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:20px;color:#64748b;margin:0 0 28px;">I was skeptical too. Then I tried it for myself... 👇</p>' },
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:80px 40px;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);border-radius:20px;min-height:400px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0 0 28px;"><span style="color:#666;font-size:18px;">▶ Click to add your video</span></div>' },
            { type: 'list', html: '<ul style="list-style:none;padding:0;font-size:20px;line-height:2.4;max-width:480px;margin:0 auto 28px;"><li>✅ Works in as little as <strong>7 days</strong></li><li>✅ 100% natural — <strong>zero side effects</strong></li><li>✅ Over <strong>50,000+ happy customers</strong></li><li>✅ <strong>60-day money-back</strong> guarantee</li></ul>' },
            { type: 'text', html: '<div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:12px;margin:0 0 24px;"><p style="font-size:16px;color:#166534;font-weight:600;margin:0;">⭐⭐⭐⭐⭐ Rated 4.9/5 by 12,847 customers</p></div>' },
            { type: 'button', html: `<div style="text-align:center;padding:32px;"><p style="font-size:18px;color:#334155;font-weight:600;margin:0 0 16px;">Don't just take my word for it 👇</p><a href="${hoplink}" style="display:inline-block;padding:22px 64px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:22px;font-weight:800;border-radius:14px;text-decoration:none;box-shadow:0 8px 24px rgba(239,68,68,0.3);">👉 YES, Show Me! →</a></div>` },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px;">Results may vary. This is an advertisement.</p>' },
        ],
    },

    social_instagram: {
        name: 'Instagram Clean',
        desc: 'Pastel, image-first, clean aesthetic',
        emoji: '📸',
        category: 'social',
        traffic: ['instagram', 'pinterest', 'facebook'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'benefits', type: 'text' },
            { role: 'testimonial', type: 'quote' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:700;text-align:center;color:#1e293b;line-height:1.3;margin:0 0 24px;font-family:Georgia,serif;">The Secret Everyone\'s Talking About ✨</h1>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:60px;background:linear-gradient(135deg,#fdf2f8,#fce7f3,#fbcfe8);border-radius:20px;margin:0 0 28px;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#ec4899;font-size:16px;">📸 Click to add your best photo</span></div>' },
            { type: 'text', html: '<div style="text-align:center;max-width:500px;margin:0 auto 24px;"><p style="font-size:18px;color:#475569;line-height:1.7;">I\'ve been using this for 3 weeks now and honestly... the results speak for themselves. 💫</p><p style="font-size:16px;color:#94a3b8;margin-top:12px;">Swipe to see why my DMs are blowing up →</p></div>' },
            { type: 'text', html: '<div style="max-width:440px;margin:0 auto 28px;"><div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);padding:16px 20px;border-radius:12px;margin:8px 0;"><p style="margin:0;font-size:16px;color:#831843;">🌸 Gentle enough for sensitive skin</p></div><div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:16px 20px;border-radius:12px;margin:8px 0;"><p style="margin:0;font-size:16px;color:#166534;">🌿 100% clean ingredients</p></div><div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);padding:16px 20px;border-radius:12px;margin:8px 0;"><p style="margin:0;font-size:16px;color:#1e40af;">💎 Visible results in 14 days</p></div><div style="background:linear-gradient(135deg,#fefce8,#fef9c3);padding:16px 20px;border-radius:12px;margin:8px 0;"><p style="margin:0;font-size:16px;color:#854d0e;">⭐ 50,000+ 5-star reviews</p></div></div>' },
            { type: 'quote', html: '<blockquote style="max-width:480px;margin:24px auto;padding:24px;background:linear-gradient(135deg,#faf5ff,#f3e8ff);border-radius:16px;border:none;text-align:center;"><p style="margin:0;font-size:17px;color:#6b21a8;font-style:italic;line-height:1.6;">"I\'ve tried everything and this is the ONLY thing that actually worked. My friends keep asking what my secret is 😍"</p><p style="margin:12px 0 0;font-size:13px;color:#a78bfa;">— @jessicawellness, 28k followers</p></blockquote>' },
            { type: 'button', html: `<div style="text-align:center;padding:28px;"><a href="${hoplink}" style="display:inline-block;padding:20px 56px;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 8px 24px rgba(236,72,153,0.3);">Shop Now — Link in Bio ✨</a></div>` },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:16px;">Ad · Individual results may vary</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // LEAD MAGNET (2 variations)
    // ═══════════════════════════════════════════

    lead_minimal: {
        name: 'Minimal Opt-in',
        desc: 'Focused single-column with big headline and form',
        emoji: '🎁',
        category: 'lead',
        traffic: ['facebook', 'tiktok', 'instagram'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'benefits', type: 'list' },
            { role: 'optin_form', type: 'optin' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:40px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 16px;max-width:600px;margin-left:auto;margin-right:auto;">FREE: The Ultimate Guide to [Topic] (2025 Edition)</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;max-width:500px;margin:0 auto 32px;">Download the complete guide that has helped over 10,000 people transform their results in just 14 days.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:60px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:20px;margin:0 0 32px;min-height:260px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #93c5fd;"><span style="color:#3b82f6;font-size:16px;">📸 Click to add guide cover image</span></div>' },
            { type: 'list', html: '<ul style="list-style:none;padding:0;font-size:18px;line-height:2.2;max-width:500px;margin:0 auto 32px;"><li>✅ Step-by-step blueprint (no fluff)</li><li>✅ Real-world examples & case studies</li><li>✅ Bonus: Quick-start checklist</li><li>✅ 100% free — instant download</li></ul>' },
            { type: 'optin', html: '<div style="max-width:480px;margin:0 auto;padding:40px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:20px;text-align:center;"><h3 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 8px;">📥 Get Your Free Copy Now</h3><p style="color:#94a3b8;font-size:14px;margin:0 0 20px;">Enter your email and we\'ll send it straight to your inbox.</p><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 20px;border:1px solid rgba(255,255,255,0.15);border-radius:12px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.08);color:#fff;" /><input type="email" name="email" placeholder="Your Best Email" required style="width:100%;padding:16px 20px;border:1px solid rgba(255,255,255,0.15);border-radius:12px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.08);color:#fff;" /><button type="submit" style="width:100%;padding:18px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;margin-top:4px;">Download Free Guide →</button></form><p style="color:#475569;font-size:11px;margin:12px 0 0;">🔒 We respect your privacy. Unsubscribe anytime.</p></div>' },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:24px;">By signing up you agree to receive emails. Unsubscribe anytime.</p>' },
        ],
    },

    lead_webinar: {
        name: 'Webinar Registration',
        desc: 'Event-style with countdown, speaker bio',
        emoji: '🎤',
        category: 'lead',
        traffic: ['facebook', 'youtube', 'seo'],
        structure: [
            { role: 'event_banner', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'speaker_bio', type: 'text' },
            { role: 'what_youll_learn', type: 'text' },
            { role: 'optin_form', type: 'optin' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:12px 20px;border-radius:12px;text-align:center;margin:0 0 20px;"><p style="font-size:14px;color:#fff;font-weight:600;margin:0;">🔴 FREE LIVE TRAINING — Limited Spots Available</p></div>' },
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.2;margin:0 0 12px;">How to [Achieve Desired Result] in 30 Days or Less</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;margin:0 0 28px;">Join our FREE masterclass and discover the exact framework used by 5,000+ successful people.</p>' },
            { type: 'text', html: '<div style="max-width:500px;margin:0 auto 28px;display:flex;align-items:center;gap:20px;padding:24px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#dbeafe,#e0e7ff);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:32px;">👤</div><div><p style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 4px;">Hosted by [Speaker Name]</p><p style="font-size:14px;color:#64748b;margin:0;">Industry Expert · 10+ Years Experience · Featured in Forbes, Inc.</p></div></div>' },
            { type: 'text', html: '<div style="max-width:500px;margin:0 auto 28px;"><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;text-align:center;">In This Free Training You\'ll Learn:</h3><div style="display:grid;gap:10px;"><div style="padding:14px 18px;background:#f0fdf4;border-radius:10px;font-size:16px;color:#166534;">🎯 The 3-step framework to get started fast</div><div style="padding:14px 18px;background:#eff6ff;border-radius:10px;font-size:16px;color:#1e40af;">📊 How to avoid the #1 beginner mistake</div><div style="padding:14px 18px;background:#fef3c7;border-radius:10px;font-size:16px;color:#92400e;">💡 The secret strategy nobody talks about</div><div style="padding:14px 18px;background:#fce7f3;border-radius:10px;font-size:16px;color:#9d174d;">🚀 How to see results in just 2 weeks</div></div></div>' },
            { type: 'optin', html: '<div style="max-width:480px;margin:0 auto;padding:36px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:20px;text-align:center;"><h3 style="font-size:22px;color:#fff;font-weight:700;margin:0 0 20px;">🎟️ Reserve Your Free Spot Now</h3><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 20px;border:none;border-radius:12px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.15);color:#fff;" /><input type="email" name="email" placeholder="Your Email" required style="width:100%;padding:16px 20px;border:none;border-radius:12px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.15);color:#fff;" /><button type="submit" style="width:100%;padding:18px;background:#fff;color:#5b21b6;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;">Save My Seat →</button></form><p style="color:rgba(255,255,255,0.5);font-size:12px;margin:12px 0 0;">🔒 100% free. No credit card required.</p></div>' },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:24px;">We respect your privacy. Unsubscribe anytime.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // BLOG POST (2 variations)
    // ═══════════════════════════════════════════

    blog_editorial: {
        name: 'Editorial Long-form',
        desc: 'Magazine-style with pull quotes and sections',
        emoji: '✍️',
        category: 'blog',
        traffic: ['seo', 'pinterest'],
        structure: [
            { role: 'category_label', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'byline', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'section_1', type: 'heading' },
            { role: 'body', type: 'text' },
            { role: 'pull_quote', type: 'quote' },
            { role: 'section_2', type: 'heading' },
            { role: 'body', type: 'text' },
            { role: 'mid_image', type: 'image' },
            { role: 'section_3', type: 'heading' },
            { role: 'body', type: 'text' },
            { role: 'optin_form', type: 'optin' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<p style="font-size:13px;font-weight:600;color:#059669;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Wellness & Lifestyle</p>' },
            { type: 'heading', html: '<h1 style="font-size:38px;font-weight:800;line-height:1.2;color:#0f172a;margin:0 0 16px;letter-spacing:-0.5px;font-family:Georgia,serif;">The Complete Guide to [Topic]: Everything You Need to Know in 2025</h1>' },
            { type: 'text', html: `<div style="display:flex;align-items:center;gap:12px;padding:16px 0;margin:0 0 24px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;"><div style="width:40px;height:40px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;">👤</div><div><p style="font-size:14px;font-weight:600;color:#0f172a;margin:0;">By Editorial Staff</p><p style="font-size:13px;color:#94a3b8;margin:0;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · 12 min read</p></div></div>` },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:16px;margin:0 0 32px;min-height:280px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add featured image</span></div>' },
            { type: 'text', html: '<div style="font-size:19px;line-height:1.9;color:#334155;font-family:Georgia,serif;"><p>If you\'ve been researching [topic], you\'ve likely encountered a flood of conflicting information. Some sources claim one thing; others say the opposite.</p><p style="margin-top:16px;">We spent months diving deep into the research, interviewing experts, and testing approaches firsthand. This guide is the result — a comprehensive, evidence-based resource that cuts through the noise.</p></div>' },
            { type: 'heading', html: '<h2 style="font-size:28px;font-weight:700;color:#0f172a;margin:40px 0 16px;font-family:Georgia,serif;">The Science Behind [Topic]</h2>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.8;color:#475569;font-family:Georgia,serif;"><p>Understanding the mechanism is crucial. Recent research from leading universities has shed new light on how [topic] actually works at a biological level.</p><p style="margin-top:16px;">The key discovery? It\'s not about a single factor — it\'s about the interplay between multiple systems working together. When you understand this, everything changes.</p></div>' },
            { type: 'quote', html: '<blockquote style="margin:36px 0;padding:28px 32px;border:none;background:none;border-left:4px solid #059669;"><p style="margin:0;font-size:24px;color:#0f172a;font-style:italic;line-height:1.5;font-family:Georgia,serif;">"The most exciting discovery of the decade — it fundamentally changes how we approach the problem."</p><p style="margin:16px 0 0;font-size:14px;color:#64748b;font-weight:600;">— Dr. Research Expert, Harvard University</p></blockquote>' },
            { type: 'heading', html: '<h2 style="font-size:28px;font-weight:700;color:#0f172a;margin:40px 0 16px;font-family:Georgia,serif;">What the Research Shows</h2>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.8;color:#475569;font-family:Georgia,serif;"><p>Multiple clinical trials, including a landmark study with over 5,000 participants, have demonstrated significant improvements. The data is compelling across all demographics and age groups.</p></div>' },
            { type: 'image', html: '<div data-media-slot="mid" style="text-align:center;padding:30px;background:#f8fafc;border-radius:16px;margin:28px 0;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:14px;">📸 Click to add supporting image</span></div>' },
            { type: 'heading', html: '<h2 style="font-size:28px;font-weight:700;color:#0f172a;margin:40px 0 16px;font-family:Georgia,serif;">Practical Takeaways</h2>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.8;color:#475569;font-family:Georgia,serif;"><p>Based on our research, here are the most actionable steps you can take today. These recommendations are backed by science and validated by real-world results.</p></div>' },
            { type: 'optin', html: '<div style="max-width:520px;margin:40px auto;padding:32px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border-radius:16px;border:1px solid #86efac;text-align:center;"><h3 style="font-size:20px;font-weight:700;color:#166534;margin:0 0 8px;">📧 Get Weekly Research Updates</h3><p style="color:#4d7c0f;font-size:14px;margin:0 0 16px;">Join 12,000+ readers who get our latest findings every Thursday.</p><form data-at-form="optin" style="display:flex;gap:8px;max-width:400px;margin:0 auto;"><input type="email" name="email" placeholder="Your email" required style="flex:1;padding:14px 18px;border:1px solid #d1d5db;border-radius:10px;font-size:15px;box-sizing:border-box;" /><button type="submit" style="padding:14px 24px;background:#16a34a;color:#fff;font-size:15px;font-weight:700;border:none;border-radius:10px;cursor:pointer;white-space:nowrap;">Subscribe</button></form></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#059669,#047857);border-radius:16px;padding:36px;text-align:center;margin:36px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 20px;">Ready to Get Started?</p><a href="${hoplink}" style="display:inline-block;padding:16px 48px;background:#fff;color:#047857;font-size:17px;font-weight:700;border-radius:10px;text-decoration:none;">Learn More →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:40px;">This article may contain affiliate links. We only recommend products we trust.</p>' },
        ],
    },

    blog_pinterest: {
        name: 'Pinterest Optimized',
        desc: 'Tall images, pin-friendly layout for social SEO',
        emoji: '📌',
        category: 'blog',
        traffic: ['pinterest', 'seo'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'pin_image', type: 'image' },
            { role: 'intro', type: 'text' },
            { role: 'section', type: 'heading' },
            { role: 'body', type: 'text' },
            { role: 'tips', type: 'text' },
            { role: 'pin_image_2', type: 'image' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.2;margin:0 0 24px;">📌 10 Things I Wish I Knew Before Trying [Product] (Save This!)</h1>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:80px 40px;background:linear-gradient(135deg,#fdf2f8,#fce7f3);border-radius:20px;margin:0 0 32px;min-height:400px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #fbcfe8;"><span style="color:#ec4899;font-size:16px;">📸 Add a tall Pinterest-style pin image (2:3 ratio)</span></div>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.8;color:#475569;max-width:600px;margin:0 auto 28px;"><p>I remember the first time I heard about this. Like most people, I was curious but cautious. After months of research and personal testing, I\'m finally sharing everything I\'ve learned.</p><p style="margin-top:16px;"><strong>Save this post</strong> — you\'ll want to come back to it! 📌</p></div>' },
            { type: 'heading', html: '<h2 style="font-size:26px;font-weight:700;color:#0f172a;margin:32px 0 16px;text-align:center;">Here\'s What You Need to Know 👇</h2>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#475569;max-width:600px;margin:0 auto 24px;"><p>After extensive testing, I\'ve compiled the most important tips and insights. Whether you\'re a complete beginner or just looking to optimize your results, this guide covers it all.</p></div>' },
            { type: 'text', html: '<div style="max-width:560px;margin:0 auto 28px;"><div style="background:#fff;border:2px solid #fce7f3;padding:20px 24px;border-radius:14px;margin:12px 0;"><h3 style="font-size:18px;color:#9d174d;margin:0 0 8px;">💡 Tip #1: Start Small</h3><p style="margin:0;font-size:16px;color:#475569;">Don\'t overwhelm yourself. Begin with the basics and build from there.</p></div><div style="background:#fff;border:2px solid #dbeafe;padding:20px 24px;border-radius:14px;margin:12px 0;"><h3 style="font-size:18px;color:#1e40af;margin:0 0 8px;">💡 Tip #2: Be Consistent</h3><p style="margin:0;font-size:16px;color:#475569;">Results come from consistency, not intensity. Stick with it for at least 2 weeks.</p></div><div style="background:#fff;border:2px solid #dcfce7;padding:20px 24px;border-radius:14px;margin:12px 0;"><h3 style="font-size:18px;color:#166534;margin:0 0 8px;">💡 Tip #3: Track Your Progress</h3><p style="margin:0;font-size:16px;color:#475569;">What gets measured gets managed. Keep a simple journal to track changes.</p></div></div>' },
            { type: 'image', html: '<div data-media-slot="pin2" style="text-align:center;padding:60px 40px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:20px;margin:0 0 28px;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #93c5fd;"><span style="color:#3b82f6;font-size:16px;">📸 Add a second pin-ready image</span></div>' },
            { type: 'button', html: `<div style="text-align:center;padding:32px;"><p style="font-size:18px;color:#475569;margin:0 0 16px;">Ready to try it yourself? Here\'s my recommendation:</p><a href="${hoplink}" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 6px 20px rgba(236,72,153,0.25);">Get Started Here →</a></div>` },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:24px;">This post may contain affiliate links. See disclosure for details.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // VSL PAGE (1 variation)
    // ═══════════════════════════════════════════

    vsl_video: {
        name: 'Video Sales Letter',
        desc: 'Full-screen video with minimal text',
        emoji: '🎬',
        category: 'vsl',
        traffic: ['facebook', 'youtube', 'native'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'hero_video', type: 'video' },
            { role: 'cta', type: 'button' },
            { role: 'social_proof', type: 'text' },
            { role: 'guarantee', type: 'text' },
            { role: 'cta_bottom', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:38px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 12px;">Watch This Short Video to Discover How to [Desired Result]</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#ef4444;font-weight:600;margin:0 0 28px;">⚠️ WARNING: Do NOT buy [product] until you watch this.</p>' },
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:100px 40px;background:#000;border-radius:20px;min-height:500px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0 0 28px;box-shadow:0 8px 40px rgba(0,0,0,0.3);"><span style="color:#555;font-size:20px;">▶ Click to add your video</span></div>' },
            { type: 'button', html: `<div style="text-align:center;padding:24px;"><a href="${hoplink}" style="display:inline-block;padding:22px 72px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:22px;font-weight:800;border-radius:14px;text-decoration:none;box-shadow:0 8px 24px rgba(22,163,74,0.3);">YES! Get Instant Access →</a></div>` },
            { type: 'text', html: '<div style="max-width:500px;margin:24px auto;text-align:center;"><p style="font-size:14px;color:#64748b;margin:0 0 12px;">Join 25,000+ people who have already transformed their results:</p><div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;"><span style="font-size:13px;color:#475569;">⭐⭐⭐⭐⭐ 4.9/5</span><span style="font-size:13px;color:#475569;">🛡️ 60-Day Guarantee</span><span style="font-size:13px;color:#475569;">📦 Free Shipping</span></div></div>' },
            { type: 'text', html: '<div style="max-width:480px;margin:24px auto;padding:24px;background:#f0fdf4;border-radius:12px;border:1px solid #86efac;text-align:center;"><p style="font-size:18px;font-weight:700;color:#166534;margin:0 0 8px;">🛡️ 60-Day Money-Back Guarantee</p><p style="font-size:15px;color:#4d7c0f;margin:0;">Not satisfied? Get a full refund — no questions asked.</p></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:16px;padding:40px;text-align:center;margin:28px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 8px;">⏰ Special Pricing Ends Soon</p><p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 20px;">Lock in your discount before it expires</p><a href="${hoplink}" style="display:inline-block;padding:20px 64px;background:#fff;color:#d97706;font-size:20px;font-weight:800;border-radius:12px;text-decoration:none;">Claim My Discount →</a></div>` },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // COMPARISON (1 variation)
    // ═══════════════════════════════════════════

    comparison_products: {
        name: 'Product Showdown',
        desc: 'Feature table with detailed verdict sections',
        emoji: '⚖️',
        category: 'comparison',
        traffic: ['seo', 'native'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'intro', type: 'text' },
            { role: 'hero_image', type: 'image' },
            { role: 'comparison_table', type: 'text' },
            { role: 'winner_section', type: 'text' },
            { role: 'detailed_review', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;text-align:center;color:#0f172a;line-height:1.2;margin:0 0 16px;">[Product A] vs. [Product B]: The Ultimate 2025 Comparison</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;max-width:600px;margin:0 auto 28px;">We put both products through rigorous testing to find the clear winner. Here are the results.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:16px;margin:0 0 32px;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add comparison image</span></div>' },
            { type: 'text', html: '<div style="background:#f8fafc;border-radius:16px;padding:28px;margin:0 0 28px;border:1px solid #e2e8f0;"><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;text-align:center;">🏆 Head-to-Head Comparison</h3><div style="display:grid;gap:2px;"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;"><div style="background:#0f172a;color:#fff;padding:12px;font-weight:700;font-size:14px;">Category</div><div style="background:#2563eb;color:#fff;padding:12px;text-align:center;font-weight:700;font-size:14px;">⭐ Our Pick</div><div style="background:#64748b;color:#fff;padding:12px;text-align:center;font-weight:700;font-size:14px;">Competitor</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;"><div style="background:#f1f5f9;padding:12px;font-size:14px;font-weight:600;">Effectiveness</div><div style="background:#eff6ff;padding:12px;text-align:center;font-size:14px;color:#16a34a;font-weight:700;">★★★★★</div><div style="background:#f8fafc;padding:12px;text-align:center;font-size:14px;">★★★☆☆</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;"><div style="background:#f1f5f9;padding:12px;font-size:14px;font-weight:600;">Side Effects</div><div style="background:#eff6ff;padding:12px;text-align:center;font-size:14px;color:#16a34a;font-weight:700;">None Reported</div><div style="background:#f8fafc;padding:12px;text-align:center;font-size:14px;color:#f59e0b;">Some</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;"><div style="background:#f1f5f9;padding:12px;font-size:14px;font-weight:600;">Price</div><div style="background:#eff6ff;padding:12px;text-align:center;font-size:14px;color:#16a34a;font-weight:700;">$$</div><div style="background:#f8fafc;padding:12px;text-align:center;font-size:14px;color:#dc2626;">$$$$</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;"><div style="background:#f1f5f9;padding:12px;font-size:14px;font-weight:600;">Guarantee</div><div style="background:#eff6ff;padding:12px;text-align:center;font-size:14px;color:#16a34a;font-weight:700;">60 Days</div><div style="background:#f8fafc;padding:12px;text-align:center;font-size:14px;">30 Days</div></div></div></div>' },
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:16px;padding:28px;margin:0 0 24px;border:2px solid #3b82f6;text-align:center;"><p style="font-size:28px;margin:0 0 8px;">🏆</p><h3 style="font-size:24px;font-weight:700;color:#1e40af;margin:0 0 12px;">Winner: [Our Pick]</h3><p style="font-size:16px;color:#475569;margin:0;">Outperforms on effectiveness, value, and customer satisfaction. The 60-day guarantee seals the deal.</p></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#475569;"><h2 style="font-size:24px;font-weight:700;color:#0f172a;margin:32px 0 16px;">Detailed Analysis</h2><p>Both products approach the problem from different angles, but the data clearly favors our top pick. Users report faster results, fewer side effects, and better overall value.</p><p style="margin-top:16px;">The clinical backing is also significantly stronger — with 47 peer-reviewed studies compared to just 8 for the competitor.</p></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);border-radius:16px;padding:40px;text-align:center;margin:36px 0;"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 8px;">Try the #1 Rated Product Risk-Free</p><p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0 0 24px;">60-day guarantee · Free shipping · Best price online</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:#fff;color:#1d4ed8;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;">Visit Official Website →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:32px;">This comparison is based on publicly available data. Affiliate links may be used.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // SQUEEZE PAGE (2 variations)
    // ═══════════════════════════════════════════

    squeeze_quick: {
        name: 'Quick Capture',
        desc: 'Ultra-minimal: headline + form + done',
        emoji: '🎯',
        category: 'squeeze',
        traffic: ['facebook', 'tiktok', 'instagram'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'optin_form', type: 'optin' },
            { role: 'trust_badges', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:42px;font-weight:800;text-align:center;color:#0f172a;line-height:1.1;margin:40px 0 16px;max-width:560px;margin-left:auto;margin-right:auto;">Get [Desired Result] in 14 Days — Free Guide</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;max-width:420px;margin:0 auto 36px;">Enter your email below and get instant access. No spam, ever.</p>' },
            { type: 'optin', html: '<div style="max-width:420px;margin:0 auto;"><form data-at-form="optin" style="display:flex;flex-direction:column;gap:12px;"><input type="email" name="email" placeholder="Enter your best email..." required style="width:100%;padding:20px 24px;border:2px solid #e2e8f0;border-radius:14px;font-size:18px;box-sizing:border-box;text-align:center;" /><button type="submit" style="width:100%;padding:20px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:20px;font-weight:700;border:none;border-radius:14px;cursor:pointer;box-shadow:0 6px 20px rgba(37,99,235,0.25);">Get Free Instant Access →</button></form></div>' },
            { type: 'text', html: '<div style="text-align:center;margin-top:28px;"><p style="font-size:13px;color:#94a3b8;">🔒 Your email is 100% safe. We never spam.</p><div style="display:flex;gap:20px;justify-content:center;margin-top:12px;"><span style="font-size:12px;color:#cbd5e1;">🛡️ Secure</span><span style="font-size:12px;color:#cbd5e1;">📧 No Spam</span><span style="font-size:12px;color:#cbd5e1;">🚀 Instant Access</span></div></div>' },
        ],
    },

    squeeze_countdown: {
        name: 'Countdown Squeeze',
        desc: 'Urgency-focused with countdown timer styling',
        emoji: '⏱️',
        category: 'squeeze',
        traffic: ['facebook', 'native', 'email'],
        structure: [
            { role: 'urgency_banner', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'countdown', type: 'text' },
            { role: 'optin_form', type: 'optin' },
            { role: 'social_proof', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:#dc2626;padding:10px;text-align:center;border-radius:8px;margin:0 0 20px;"><p style="font-size:13px;color:#fff;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:1px;">⚠️ This offer expires soon — act now</p></div>' },
            { type: 'heading', html: '<h1 style="font-size:38px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 20px;">FREE Report: How [Specific Benefit] in Just 14 Days</h1>' },
            { type: 'text', html: '<div style="display:flex;justify-content:center;gap:16px;margin:0 0 32px;"><div style="text-align:center;background:#0f172a;padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:28px;font-weight:800;color:#fff;margin:0;">00</p><p style="font-size:11px;color:#64748b;margin:4px 0 0;text-transform:uppercase;">Hours</p></div><div style="text-align:center;background:#0f172a;padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:28px;font-weight:800;color:#ef4444;margin:0;">47</p><p style="font-size:11px;color:#64748b;margin:4px 0 0;text-transform:uppercase;">Minutes</p></div><div style="text-align:center;background:#0f172a;padding:16px 20px;border-radius:12px;min-width:72px;"><p style="font-size:28px;font-weight:800;color:#fff;margin:0;">23</p><p style="font-size:11px;color:#64748b;margin:4px 0 0;text-transform:uppercase;">Seconds</p></div></div>' },
            { type: 'optin', html: '<div style="max-width:440px;margin:0 auto;padding:36px;background:linear-gradient(135deg,#fef2f2,#fee2e2);border-radius:20px;border:2px solid #fca5a5;"><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 20px;border:1px solid #fca5a5;border-radius:12px;font-size:16px;box-sizing:border-box;" /><input type="email" name="email" placeholder="Your Email" required style="width:100%;padding:16px 20px;border:1px solid #fca5a5;border-radius:12px;font-size:16px;box-sizing:border-box;" /><button type="submit" style="width:100%;padding:18px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;">🔥 Send Me the Free Report →</button></form><p style="text-align:center;color:#9ca3af;font-size:11px;margin:10px 0 0;">🔒 We respect your privacy. Unsubscribe anytime.</p></div>' },
            { type: 'text', html: '<div style="text-align:center;margin-top:24px;"><p style="font-size:14px;color:#64748b;">⭐ Trusted by <strong>12,847 people</strong> this month</p></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // AD CREATIVE
    // ═══════════════════════════════════════════

    ad_side_by_side: {
        name: 'Side-by-Side',
        desc: 'Product image left (600×800), headline + bullets + CTA on right',
        emoji: '📢',
        category: 'ad',
        traffic: ['native', 'display', 'facebook', 'tiktok'],
        structure: [
            { role: 'columns_layout', type: 'columns' },
            { role: 'body', type: 'text' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            {
                type: 'columns',
                columns: [
                    {
                        width: '40%',
                        blocks: [
                            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:16px;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add product image</span></div>' },
                        ],
                    },
                    {
                        width: '60%',
                        blocks: [
                            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.2;margin:0 0 16px;">Your Headline Goes Here — Grab Attention Fast</h1>' },
                            { type: 'list', html: '<ul style="list-style:none;padding:0;font-size:16px;line-height:2.2;margin:0 0 24px;"><li>✅ First key benefit — what makes it unique</li><li>✅ Second benefit — why readers should care</li><li>✅ Third benefit — create urgency or desire here</li></ul>' },
                            { type: 'button', html: `<div style="padding:8px 0;"><a href="${hoplink || '#'}" target="_blank" data-cta="true" style="display:inline-block;padding:18px 48px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 6px 20px rgba(37,99,235,0.3);">Get Started Now →</a></div>` },
                        ],
                    },
                ],
                styles: { gap: '36px' },
            },
            {
                type: 'text', html: '<p style="font-size:15px;color:#64748b;line-height:1.7;margin-top:24px;">Brief supporting text goes here. Explain the offer, add social proof, or include a personal note to build trust with your reader.</p>',
                styles: { fontSize: '15px', color: '#64748b', lineHeight: '1.7' }
            },
            {
                type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:24px;">This is an advertisement. Individual results may vary.</p>',
                styles: { fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '24px' }
            },
        ],
    },
};
