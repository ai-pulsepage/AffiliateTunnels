/**
 * Premium Templates — Modern visual designs
 * Split into separate file for maintainability
 */

export const PREMIUM_TEMPLATES = {

    // ═══════════════════════════════════════════
    // ✨ VISUAL HERO TEMPLATES
    // ═══════════════════════════════════════════

    hero_gradient: {
        name: '✨ Gradient Hero',
        desc: 'Full-bleed gradient with centered content, trust badges, glassmorphism cards',
        emoji: '🌟',
        category: 'hero',
        traffic: ['facebook', 'tiktok', 'native', 'seo'],
        structure: [
            { role: 'hero_section', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'subheadline', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'trust_strip', type: 'text' },
            { role: 'features', type: 'text' },
            { role: 'testimonials', type: 'text' },
            { role: 'cta_bottom', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7);padding:80px 24px 60px;border-radius:0 0 32px 32px;text-align:center;margin:-20px -20px 0;"><h1 style="font-size:44px;font-weight:800;color:#fff;line-height:1.1;margin:0 auto 16px;max-width:640px;letter-spacing:-1px;">The Natural Breakthrough Thousands Are Raving About</h1><p style="font-size:20px;color:rgba(255,255,255,0.85);max-width:500px;margin:0 auto 32px;line-height:1.6;">Discover the clinically-proven solution that\'s changing lives — backed by science, loved by real people.</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:18px 52px;background:#fff;color:#4f46e5;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 8px 32px rgba(0,0,0,0.2);">Get Started Today →</a></div>' },
            { type: 'text', html: '<div style="display:flex;justify-content:center;gap:32px;flex-wrap:wrap;padding:32px 0;"><span style="font-size:13px;color:#64748b;font-weight:600;">🔬 Clinically Tested</span><span style="font-size:13px;color:#64748b;font-weight:600;">⭐ 4.9/5 Rating</span><span style="font-size:13px;color:#64748b;font-weight:600;">🛡️ 60-Day Guarantee</span><span style="font-size:13px;color:#64748b;font-weight:600;">📦 Free Shipping</span></div>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:20px 0 40px;"><div style="background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.15);padding:28px 24px;border-radius:16px;text-align:center;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🧬</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Science-Backed</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Developed using peer-reviewed research from leading institutions.</p></div><div style="background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.15);padding:28px 24px;border-radius:16px;text-align:center;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#059669,#10b981);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">🌿</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">100% Natural</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Pure, clean ingredients with zero artificial additives.</p></div><div style="background:rgba(79,70,229,0.05);border:1px solid rgba(79,70,229,0.15);padding:28px 24px;border-radius:16px;text-align:center;"><div style="width:56px;height:56px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">⚡</div><h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px;">Fast Results</h3><p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">Most users see noticeable improvements within 14 days.</p></div></div>' },
            { type: 'text', html: '<div style="margin:20px 0 40px;"><h2 style="text-align:center;font-size:28px;font-weight:700;color:#0f172a;margin:0 0 24px;">What People Are Saying</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;"><div style="background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border:1px solid rgba(79,70,229,0.12);padding:24px;border-radius:16px;"><p style="font-size:15px;color:#475569;margin:0 0 12px;line-height:1.6;font-style:italic;">"I\'ve tried everything and this is the first thing that actually delivered real results. Absolutely life-changing."</p><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#dbeafe,#e0e7ff);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div><div><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0;">Jessica M.</p><p style="font-size:12px;color:#f59e0b;margin:0;">⭐⭐⭐⭐⭐</p></div></div></div><div style="background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border:1px solid rgba(79,70,229,0.12);padding:24px;border-radius:16px;"><p style="font-size:15px;color:#475569;margin:0 0 12px;line-height:1.6;font-style:italic;">"Within two weeks I could tell the difference. My energy is through the roof and I feel 10 years younger."</p><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#dcfce7,#d1fae5);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div><div><p style="font-size:13px;font-weight:600;color:#0f172a;margin:0;">Robert K.</p><p style="font-size:12px;color:#f59e0b;margin:0;">⭐⭐⭐⭐⭐</p></div></div></div></div></div>' },
            { type: 'button', html: '<div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:20px;padding:48px 32px;text-align:center;margin:20px 0;"><p style="font-size:26px;color:#fff;font-weight:700;margin:0 0 8px;">Ready to Transform Your Life?</p><p style="font-size:16px;color:rgba(255,255,255,0.8);margin:0 0 28px;">Join 50,000+ satisfied customers. Risk-free with our 60-day guarantee.</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:20px 60px;background:#fff;color:#4f46e5;font-size:20px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 6px 24px rgba(0,0,0,0.15);">Claim Your Bottle Now →</a></div>' },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    hero_dark: {
        name: '✨ Dark Premium',
        desc: 'Sleek dark mode with neon accents, glassmorphism stat cards',
        emoji: '🌙',
        category: 'hero',
        traffic: ['facebook', 'tiktok', 'native'],
        structure: [
            { role: 'hero_section', type: 'text' },
            { role: 'stats', type: 'text' },
            { role: 'features', type: 'text' },
            { role: 'testimonial', type: 'quote' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#0f0f1a,#1a1a2e);padding:72px 24px;border-radius:24px;text-align:center;margin:0 0 0;"><p style="font-size:13px;color:#22d3ee;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 20px;">✨ Premium Formula</p><h1 style="font-size:42px;font-weight:800;color:#fff;line-height:1.1;margin:0 0 16px;max-width:600px;margin-left:auto;margin-right:auto;">Unlock Your Full Potential With Science</h1><p style="font-size:18px;color:rgba(255,255,255,0.6);max-width:480px;margin:0 auto 36px;">The next-generation formula trusted by elite performers worldwide.</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#22d3ee,#06b6d4);color:#0f172a;font-size:18px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 0 32px rgba(34,211,238,0.3);">Shop Now →</a></div>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:32px 0;"><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#22d3ee,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">94%</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Satisfaction Rate</p></div><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">50K+</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Happy Customers</p></div><div style="background:rgba(255,255,255,0.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#34d399,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">14 Days</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Avg. Time to Results</p></div></div>' },
            { type: 'text', html: '<div style="margin:24px 0;"><div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:24px;border-radius:16px;margin:12px 0;display:flex;align-items:center;gap:20px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#22d3ee,#06b6d4);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">🧬</div><div><h3 style="font-size:16px;font-weight:700;color:#fff;margin:0 0 4px;">Clinically Proven Ingredients</h3><p style="font-size:14px;color:#94a3b8;margin:0;">Backed by 47 peer-reviewed studies from top research institutions.</p></div></div><div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:24px;border-radius:16px;margin:12px 0;display:flex;align-items:center;gap:20px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#a78bfa,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">⚡</div><div><h3 style="font-size:16px;font-weight:700;color:#fff;margin:0 0 4px;">Maximum Absorption</h3><p style="font-size:14px;color:#94a3b8;margin:0;">Advanced bioavailability technology for 3x better absorption.</p></div></div><div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:24px;border-radius:16px;margin:12px 0;display:flex;align-items:center;gap:20px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#34d399,#10b981);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;">🛡️</div><div><h3 style="font-size:16px;font-weight:700;color:#fff;margin:0 0 4px;">Risk-Free Guarantee</h3><p style="font-size:14px;color:#94a3b8;margin:0;">Full 60-day money-back guarantee. No questions asked.</p></div></div></div>' },
            { type: 'quote', html: '<blockquote style="border:1px solid rgba(34,211,238,0.2);padding:28px;border-radius:16px;background:rgba(34,211,238,0.03);margin:28px 0;"><p style="margin:0 0 12px;font-size:17px;color:#e2e8f0;font-style:italic;line-height:1.6;">"This is hands down the best product I\'ve ever used. The results were visible within the first week."</p><p style="margin:0;font-size:13px;color:#22d3ee;font-weight:600;">— Dr. Michael Chen, Wellness Expert</p></blockquote>' },
            { type: 'button', html: '<div style="background:linear-gradient(135deg,#0f0f1a,#1a1a2e);border:1px solid rgba(34,211,238,0.2);border-radius:20px;padding:48px 32px;text-align:center;margin:20px 0;"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 8px;">Limited Time: Save 40% Today</p><p style="font-size:15px;color:rgba(255,255,255,0.5);margin:0 0 28px;">Free shipping on all orders. 60-day guarantee.</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:20px 60px;background:linear-gradient(135deg,#22d3ee,#06b6d4);color:#0f172a;font-size:20px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 0 40px rgba(34,211,238,0.3);">Order Now →</a></div>' },
            { type: 'text', html: '<p style="font-size:12px;color:#475569;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    hero_video: {
        name: '✨ Video Hero',
        desc: 'Video-first with overlay text, minimal distraction design',
        emoji: '🎬',
        category: 'hero',
        traffic: ['facebook', 'youtube', 'tiktok'],
        structure: [
            { role: 'hero_video', type: 'video' },
            { role: 'headline', type: 'heading' },
            { role: 'cta', type: 'button' },
            { role: 'social_proof', type: 'text' },
            { role: 'benefits', type: 'text' },
            { role: 'cta_bottom', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:120px 40px;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);border-radius:24px;min-height:480px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;margin:0 0 0;position:relative;"><span style="color:#666;font-size:20px;margin-bottom:20px;">▶ Click to add your video</span><p style="font-size:12px;color:#444;">Supports YouTube, Vimeo, or direct upload</p></div>' },
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:32px 0 16px;max-width:600px;margin-left:auto;margin-right:auto;">Watch How This Simple Method Is Changing Lives Worldwide</h1>' },
            { type: 'button', html: '<div style="text-align:center;padding:20px 0;"><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:22px 72px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:22px;font-weight:800;border-radius:50px;text-decoration:none;box-shadow:0 8px 32px rgba(22,163,74,0.3);">YES! Show Me How →</a></div>' },
            { type: 'text', html: '<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;padding:24px 0;"><span style="font-size:14px;color:#475569;font-weight:600;">⭐⭐⭐⭐⭐ 4.9/5</span><span style="font-size:14px;color:#475569;">|</span><span style="font-size:14px;color:#475569;font-weight:600;">25,000+ customers</span><span style="font-size:14px;color:#475569;">|</span><span style="font-size:14px;color:#475569;font-weight:600;">🛡️ 60-Day Guarantee</span></div>' },
            { type: 'text', html: '<div style="max-width:520px;margin:16px auto 32px;"><div style="padding:16px 20px;background:#f0fdf4;border-radius:12px;margin:8px 0;font-size:16px;color:#166534;">✅ Works in as little as <strong>7 days</strong></div><div style="padding:16px 20px;background:#eff6ff;border-radius:12px;margin:8px 0;font-size:16px;color:#1e40af;">✅ 100% natural — <strong>zero side effects</strong></div><div style="padding:16px 20px;background:#faf5ff;border-radius:12px;margin:8px 0;font-size:16px;color:#6b21a8;">✅ <strong>60-day money-back</strong> guarantee</div></div>' },
            { type: 'button', html: '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:20px;padding:40px;text-align:center;margin:16px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 8px;">⏰ Special Pricing Ends Soon</p><p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 24px;">Lock in your discount before time runs out</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:20px 64px;background:#fff;color:#d97706;font-size:20px;font-weight:800;border-radius:50px;text-decoration:none;">Claim My Discount →</a></div>' },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    hero_mobile: {
        name: '✨ Mobile Social',
        desc: 'TikTok/Instagram optimized, narrow layout, pill elements, sticky CTA',
        emoji: '📱',
        category: 'hero',
        traffic: ['tiktok', 'instagram', 'facebook'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'benefits', type: 'text' },
            { role: 'testimonials', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 20px;max-width:480px;margin-left:auto;margin-right:auto;">🔥 Everyone Is Talking About This</h1>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:80px 40px;background:linear-gradient(135deg,#fdf2f8,#fce7f3,#e0e7ff);border-radius:24px;margin:0 auto 24px;max-width:480px;min-height:320px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#ec4899;font-size:16px;">📸 Add your best photo or video</span></div>' },
            { type: 'text', html: '<div style="max-width:480px;margin:0 auto 24px;"><div style="background:#fff;border:2px solid #e0e7ff;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#4f46e5;font-weight:600;">✅ Works in 7 days or less</div><div style="background:#fff;border:2px solid #dcfce7;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#16a34a;font-weight:600;">✅ 100% natural ingredients</div><div style="background:#fff;border:2px solid #fef3c7;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#d97706;font-weight:600;">⭐ 50,000+ 5-star reviews</div><div style="background:#fff;border:2px solid #fce7f3;padding:16px 20px;border-radius:50px;margin:8px 0;text-align:center;font-size:16px;color:#db2777;font-weight:600;">🛡️ 60-day money-back guarantee</div></div>' },
            { type: 'text', html: '<div style="max-width:480px;margin:0 auto 24px;"><div style="background:linear-gradient(135deg,#faf5ff,#f3e8ff);padding:20px;border-radius:16px;margin:8px 0;text-align:center;"><p style="font-size:16px;color:#6b21a8;font-style:italic;margin:0 0 8px;">"My friends keep asking what my secret is 😍"</p><p style="font-size:13px;color:#a78bfa;margin:0;">— @jessicawellness</p></div><div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:20px;border-radius:16px;margin:8px 0;text-align:center;"><p style="font-size:16px;color:#166534;font-style:italic;margin:0 0 8px;">"Hands down the best thing I\'ve ever tried 🙌"</p><p style="font-size:13px;color:#4ade80;margin:0;">— @mikefitlife</p></div></div>' },
            { type: 'button', html: '<div style="text-align:center;padding:24px 0;max-width:480px;margin:0 auto;"><a href="' + (hoplink || '#') + '" style="display:block;padding:20px;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;font-size:20px;font-weight:800;border-radius:50px;text-decoration:none;text-align:center;box-shadow:0 8px 24px rgba(236,72,153,0.3);">👉 Shop Now — Link in Bio ✨</a></div>' },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:12px;">Ad · Individual results may vary</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // ✨ CONVERSION / FUNNEL TEMPLATES
    // ═══════════════════════════════════════════

    funnel_offer_stack: {
        name: '✨ Offer Stack',
        desc: 'Value stack with crossed-out prices, guarantee badge, urgency',
        emoji: '💰',
        category: 'funnel',
        traffic: ['facebook', 'native', 'email'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'value_stack', type: 'text' },
            { role: 'pricing', type: 'text' },
            { role: 'guarantee', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 12px;">Here\'s Everything You Get Today</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#dc2626;font-weight:600;margin:0 0 32px;">⏰ This special offer expires at midnight</p>' },
            { type: 'text', html: '<div style="max-width:560px;margin:0 auto 32px;"><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:#f8fafc;border-radius:12px;margin:8px 0;border-left:4px solid #16a34a;"><span style="font-size:17px;color:#0f172a;font-weight:600;">✅ Main Product (Full Supply)</span><span style="font-size:17px;color:#dc2626;text-decoration:line-through;">$97</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:#f8fafc;border-radius:12px;margin:8px 0;border-left:4px solid #16a34a;"><span style="font-size:17px;color:#0f172a;font-weight:600;">✅ Bonus #1: Quick-Start Guide</span><span style="font-size:17px;color:#dc2626;text-decoration:line-through;">$47</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:#f8fafc;border-radius:12px;margin:8px 0;border-left:4px solid #16a34a;"><span style="font-size:17px;color:#0f172a;font-weight:600;">✅ Bonus #2: VIP Support Access</span><span style="font-size:17px;color:#dc2626;text-decoration:line-through;">$29</span></div><div style="display:flex;justify-content:space-between;align-items:center;padding:18px 24px;background:#f8fafc;border-radius:12px;margin:8px 0;border-left:4px solid #16a34a;"><span style="font-size:17px;color:#0f172a;font-weight:600;">✅ Bonus #3: Recipe Book</span><span style="font-size:17px;color:#dc2626;text-decoration:line-through;">$19</span></div><div style="padding:20px 24px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;margin:16px 0;text-align:center;border:2px solid #86efac;"><p style="font-size:15px;color:#64748b;margin:0 0 4px;">Total Value: <span style="text-decoration:line-through;">$192</span></p><p style="font-size:32px;font-weight:800;color:#16a34a;margin:0;">Today Only: $49</p></div></div>' },
            { type: 'text', html: '<div style="max-width:480px;margin:0 auto 28px;padding:24px;background:#fffbeb;border-radius:16px;border:2px solid #fde68a;text-align:center;"><p style="font-size:20px;font-weight:700;color:#92400e;margin:0 0 8px;">🛡️ 60-Day Money-Back Guarantee</p><p style="font-size:15px;color:#a16207;margin:0;">Try it risk-free. If you\'re not 100% satisfied, get a full refund — no questions asked.</p></div>' },
            { type: 'button', html: '<div style="text-align:center;padding:20px 0;"><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:22px 72px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:22px;font-weight:800;border-radius:50px;text-decoration:none;box-shadow:0 8px 32px rgba(22,163,74,0.3);">🔥 YES! Claim This Deal →</a><p style="font-size:13px;color:#64748b;margin:12px 0 0;">🔒 Secure 256-bit SSL checkout</p></div>' },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:24px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },

    funnel_clinical: {
        name: '✨ Clinical Trust',
        desc: 'Clean medical design with trust badges, expert quotes, research cards',
        emoji: '🏥',
        category: 'funnel',
        traffic: ['native', 'seo', 'facebook'],
        structure: [
            { role: 'trust_bar', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'research', type: 'text' },
            { role: 'expert_quote', type: 'quote' },
            { role: 'ingredients', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;padding:16px;background:#f0f9ff;border-radius:12px;margin:0 0 24px;border:1px solid #bae6fd;"><span style="font-size:12px;color:#0369a1;font-weight:600;">🔬 Clinically Studied</span><span style="font-size:12px;color:#0369a1;font-weight:600;">✅ FDA Compliant</span><span style="font-size:12px;color:#0369a1;font-weight:600;">🇺🇸 Made in USA</span><span style="font-size:12px;color:#0369a1;font-weight:600;">🏗️ GMP Certified</span></div>' },
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;text-align:center;color:#0c4a6e;line-height:1.2;margin:0 0 24px;">Groundbreaking Research Reveals a Natural Path to [Desired Outcome]</h1>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:16px;margin:0 0 32px;min-height:240px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #bae6fd;"><span style="color:#0284c7;font-size:15px;">📸 Click to add product/research image</span></div>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:0 0 32px;"><div style="background:#fff;border:1px solid #e0f2fe;padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#0284c7;margin:0;">94%</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Success Rate in Trials</p></div><div style="background:#fff;border:1px solid #e0f2fe;padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#0284c7;margin:0;">47</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Published Studies</p></div><div style="background:#fff;border:1px solid #e0f2fe;padding:24px;border-radius:16px;text-align:center;"><p style="font-size:36px;font-weight:800;color:#0284c7;margin:0;">5,000+</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Study Participants</p></div></div>' },
            { type: 'quote', html: '<blockquote style="border-left:4px solid #0284c7;padding:24px 28px;margin:24px 0;background:#f0f9ff;border-radius:0 16px 16px 0;"><div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#bae6fd,#e0f2fe);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;">👨‍⚕️</div><div><p style="font-size:14px;font-weight:700;color:#0c4a6e;margin:0;">Dr. James Reynolds, MD</p><p style="font-size:12px;color:#64748b;margin:0;">Board-Certified Nutritionist</p></div></div><p style="margin:0;font-size:17px;color:#0c4a6e;font-style:italic;line-height:1.6;">"The data on these ingredients is remarkable. This is one of the most well-formulated products I\'ve reviewed in my 20 years of practice."</p></blockquote>' },
            { type: 'text', html: '<div style="margin:24px 0;"><h2 style="font-size:24px;font-weight:700;color:#0c4a6e;margin:0 0 16px;text-align:center;">Key Ingredients</h2><div style="background:#fff;border:1px solid #e0f2fe;padding:20px 24px;border-radius:12px;margin:8px 0;display:flex;align-items:center;gap:16px;"><div style="width:40px;height:40px;background:#e0f2fe;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">🧬</div><div><p style="font-size:16px;font-weight:600;color:#0c4a6e;margin:0 0 4px;">Ingredient A — 500mg</p><p style="font-size:14px;color:#64748b;margin:0;">Clinically proven to support natural recovery processes.</p></div></div><div style="background:#fff;border:1px solid #e0f2fe;padding:20px 24px;border-radius:12px;margin:8px 0;display:flex;align-items:center;gap:16px;"><div style="width:40px;height:40px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">🌿</div><div><p style="font-size:16px;font-weight:600;color:#0c4a6e;margin:0 0 4px;">Ingredient B — 300mg</p><p style="font-size:14px;color:#64748b;margin:0;">Enhances bioavailability for maximum absorption.</p></div></div></div>' },
            { type: 'button', html: '<div style="background:linear-gradient(135deg,#0284c7,#0369a1);border-radius:20px;padding:44px 32px;text-align:center;margin:28px 0;"><p style="font-size:24px;color:#fff;font-weight:700;margin:0 0 24px;">Try It Risk-Free Today</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:20px 60px;background:#fff;color:#0369a1;font-size:20px;font-weight:700;border-radius:50px;text-decoration:none;">View Clinical Results →</a></div>' },
            { type: 'text', html: '<p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:32px;">*These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary. This is an advertisement.</p>' },
        ],
    },

    funnel_side_by_side: {
        name: '✨ Side-by-Side Plus',
        desc: 'Enhanced split layout with comparison, winner card, rounded elements',
        emoji: '⚖️',
        category: 'funnel',
        traffic: ['seo', 'native', 'facebook'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'comparison', type: 'text' },
            { role: 'verdict', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;text-align:center;color:#0f172a;line-height:1.2;margin:0 0 8px;">We Tested Both. Here\'s the Clear Winner.</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;margin:0 0 32px;">An honest, side-by-side comparison backed by data.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:20px;margin:0 0 32px;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add comparison image</span></div>' },
            { type: 'text', html: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:0 0 32px;"><div style="background:#f0fdf4;border:2px solid #86efac;padding:28px;border-radius:20px;text-align:center;"><div style="background:#16a34a;color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:50px;display:inline-block;margin:0 0 16px;">⭐ OUR PICK</div><h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px;">Product A</h3><div style="text-align:left;font-size:15px;color:#475569;line-height:2;"><p style="margin:0;">✅ Clinically proven</p><p style="margin:0;">✅ 100% natural</p><p style="margin:0;">✅ 60-day guarantee</p><p style="margin:0;">✅ Free shipping</p><p style="margin:0;">✅ 4.9/5 rating</p></div></div><div style="background:#f8fafc;border:1px solid #e2e8f0;padding:28px;border-radius:20px;text-align:center;opacity:0.85;"><div style="background:#94a3b8;color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:50px;display:inline-block;margin:0 0 16px;">COMPETITOR</div><h3 style="font-size:20px;font-weight:700;color:#64748b;margin:0 0 16px;">Product B</h3><div style="text-align:left;font-size:15px;color:#94a3b8;line-height:2;"><p style="margin:0;">⚠️ Limited studies</p><p style="margin:0;">⚠️ Some synthetic</p><p style="margin:0;">❌ 30 days only</p><p style="margin:0;">❌ $9.99 shipping</p><p style="margin:0;">⚠️ 3.2/5 rating</p></div></div></div>' },
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #16a34a;border-radius:20px;padding:32px;text-align:center;margin:0 0 28px;"><p style="font-size:32px;margin:0 0 8px;">🏆</p><h3 style="font-size:24px;font-weight:700;color:#166534;margin:0 0 8px;">The Verdict Is Clear</h3><p style="font-size:16px;color:#475569;margin:0;">Product A outperforms on every metric. With better ingredients, stronger research, and a risk-free guarantee — it\'s the obvious choice.</p></div>' },
            { type: 'button', html: '<div style="text-align:center;padding:20px 0;"><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:20px 64px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:20px;font-weight:700;border-radius:50px;text-decoration:none;box-shadow:0 8px 24px rgba(22,163,74,0.25);">Try the Winner Risk-Free →</a></div>' },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:24px;">This comparison is based on publicly available data. Affiliate links may be used.</p>' },
        ],
    },

    // ═══════════════════════════════════════════
    // ✨ ENHANCED SQUEEZE / LEAD TEMPLATES
    // ═══════════════════════════════════════════

    squeeze_glass: {
        name: '✨ Glassmorphism Squeeze',
        desc: 'Gradient background with frosted glass card, pill-shaped inputs',
        emoji: '🎯',
        category: 'squeeze',
        traffic: ['facebook', 'tiktok', 'instagram'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'optin_form', type: 'optin' },
            { role: 'social_proof', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#7c3aed,#db2777,#f59e0b);padding:80px 24px;border-radius:24px;text-align:center;"><h1 style="font-size:40px;font-weight:800;color:#fff;line-height:1.1;margin:0 0 12px;max-width:500px;margin-left:auto;margin-right:auto;">Get the Free Blueprint That Changes Everything</h1><p style="font-size:18px;color:rgba(255,255,255,0.8);margin:0 auto 36px;max-width:400px;">Join 15,000+ people who already have their copy.</p><div style="max-width:400px;margin:0 auto;padding:32px;background:rgba(255,255,255,0.12);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);border-radius:20px;"><form data-at-form="optin" style="display:flex;flex-direction:column;gap:12px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 24px;border:none;border-radius:50px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.9);" /><input type="email" name="email" placeholder="Your Best Email" required style="width:100%;padding:16px 24px;border:none;border-radius:50px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.9);" /><button type="submit" style="width:100%;padding:18px;background:#fff;color:#7c3aed;font-size:18px;font-weight:700;border:none;border-radius:50px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.1);">Download Free →</button></form><p style="color:rgba(255,255,255,0.6);font-size:12px;margin:12px 0 0;">🔒 No spam. Unsubscribe anytime.</p></div></div>' },
            { type: 'text', html: '<div style="text-align:center;padding:24px 0;"><p style="font-size:14px;color:#64748b;">Trusted by readers at <strong>Forbes</strong> · <strong>Inc.</strong> · <strong>Healthline</strong></p></div>' },
        ],
    },

    lead_deluxe: {
        name: '✨ Lead Magnet Deluxe',
        desc: 'Split layout with ebook mockup, FREE badge, rounded form card',
        emoji: '🎁',
        category: 'lead',
        traffic: ['facebook', 'instagram', 'seo'],
        structure: [
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'benefits', type: 'list' },
            { role: 'optin_form', type: 'optin' },
            { role: 'trust', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="text-align:center;margin:0 0 12px;"><span style="display:inline-block;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;font-size:14px;font-weight:800;padding:8px 24px;border-radius:50px;transform:rotate(-2deg);box-shadow:0 4px 12px rgba(220,38,38,0.3);">100% FREE</span></div>' },
            { type: 'heading', html: '<h1 style="font-size:38px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 12px;">The Ultimate Guide to [Topic]</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;margin:0 0 32px;">Download the complete blueprint used by 10,000+ people to get real results.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:60px;background:linear-gradient(135deg,#eff6ff,#e0e7ff,#f5f3ff);border-radius:24px;margin:0 0 32px;min-height:280px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #c7d2fe;"><span style="color:#6366f1;font-size:16px;">📸 Click to add ebook cover / mockup image</span></div>' },
            { type: 'text', html: '<div style="max-width:500px;margin:0 auto 32px;"><div style="padding:12px 20px;margin:6px 0;font-size:17px;color:#334155;">📖 Step-by-step blueprint (zero fluff)</div><div style="padding:12px 20px;margin:6px 0;font-size:17px;color:#334155;">📊 Real case studies with exact numbers</div><div style="padding:12px 20px;margin:6px 0;font-size:17px;color:#334155;">🎯 Quick-start checklist included</div><div style="padding:12px 20px;margin:6px 0;font-size:17px;color:#334155;">🎁 Bonus: Private community access</div></div>' },
            { type: 'optin', html: '<div style="max-width:480px;margin:0 auto;padding:36px;background:#fff;border-radius:24px;border:2px solid #e0e7ff;box-shadow:0 8px 32px rgba(99,102,241,0.1);"><h3 style="font-size:22px;font-weight:700;color:#0f172a;text-align:center;margin:0 0 20px;">📥 Get Your Free Copy</h3><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 20px;border:2px solid #e2e8f0;border-radius:50px;font-size:16px;box-sizing:border-box;" /><input type="email" name="email" placeholder="Your Best Email" required style="width:100%;padding:16px 20px;border:2px solid #e2e8f0;border-radius:50px;font-size:16px;box-sizing:border-box;" /><button type="submit" style="width:100%;padding:18px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:18px;font-weight:700;border:none;border-radius:50px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.3);">Download Free Guide →</button></form><p style="text-align:center;color:#94a3b8;font-size:12px;margin:12px 0 0;">🔒 100% free. No credit card needed.</p></div>' },
            { type: 'text', html: '<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;padding:24px 0;"><span style="font-size:13px;color:#94a3b8;">🔒 Secure</span><span style="font-size:13px;color:#94a3b8;">📧 No Spam</span><span style="font-size:13px;color:#94a3b8;">🚀 Instant Access</span></div>' },
        ],
    },

    // ═══════════════════════════════════════════
    // ✨ ENHANCED BLOG / SOCIAL / WEBINAR
    // ═══════════════════════════════════════════

    blog_magazine: {
        name: '✨ Magazine Editorial',
        desc: 'High-end editorial with author byline, serif typography, pull quotes',
        emoji: '✍️',
        category: 'blog',
        traffic: ['seo', 'pinterest', 'native'],
        structure: [
            { role: 'hero_image', type: 'image' },
            { role: 'headline', type: 'heading' },
            { role: 'byline', type: 'text' },
            { role: 'intro', type: 'text' },
            { role: 'pull_quote', type: 'quote' },
            { role: 'body', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:80px 40px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:24px;margin:0 0 32px;min-height:360px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#64748b;font-size:16px;">📸 Click to add full-bleed hero image</span></div>' },
            { type: 'heading', html: '<h1 style="font-size:42px;font-weight:800;line-height:1.15;color:#0f172a;margin:0 0 16px;font-family:Georgia,serif;letter-spacing:-1px;">The Complete Guide to [Topic]: What Science Actually Says in 2025</h1>' },
            { type: 'text', html: '<div style="display:flex;align-items:center;gap:14px;padding:16px 0;margin:0 0 32px;border-top:2px solid #0f172a;border-bottom:1px solid #e2e8f0;"><div style="width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700;">E</div><div><p style="font-size:14px;font-weight:700;color:#0f172a;margin:0;">Editorial Staff</p><p style="font-size:13px;color:#94a3b8;margin:0;">Published Feb 2025 · 8 min read</p></div></div>' },
            { type: 'text', html: '<div style="font-size:19px;line-height:1.9;color:#334155;font-family:Georgia,serif;max-width:680px;"><p style="font-size:21px;color:#0f172a;font-weight:500;">If you\'ve been researching this topic, you\'ve likely encountered conflicting information. We spent months reviewing clinical data to separate fact from fiction.</p><p style="margin-top:24px;">What we discovered may surprise you — and could fundamentally change your approach.</p></div>' },
            { type: 'quote', html: '<blockquote style="margin:48px 0;padding:32px 40px;border:none;border-left:4px solid #0f172a;background:none;"><p style="margin:0;font-size:28px;color:#0f172a;font-style:italic;line-height:1.4;font-family:Georgia,serif;">"The most significant discovery of the decade — it changes everything we thought we knew."</p><p style="margin:20px 0 0;font-size:14px;color:#64748b;font-weight:600;font-family:sans-serif;">— Dr. Research Expert, Harvard Medical School</p></blockquote>' },
            { type: 'text', html: '<div style="font-size:18px;line-height:1.9;color:#475569;font-family:Georgia,serif;max-width:680px;"><h2 style="font-size:28px;font-weight:700;color:#0f172a;margin:48px 0 16px;font-family:Georgia,serif;">What the Research Shows</h2><p>Multiple clinical trials, including a landmark study with 5,000 participants, demonstrate significant improvements across every measured metric. The key finding? The approach is remarkably simple.</p><h2 style="font-size:28px;font-weight:700;color:#0f172a;margin:48px 0 16px;font-family:Georgia,serif;">Practical Takeaways</h2><p>Based on our analysis, here are the most actionable steps you can take today — backed by evidence and validated by real-world results.</p></div>' },
            { type: 'button', html: '<div style="background:#0f172a;border-radius:20px;padding:44px;text-align:center;margin:48px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 20px;font-family:Georgia,serif;">Ready to Take the Next Step?</p><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:18px 52px;background:#fff;color:#0f172a;font-size:17px;font-weight:700;border-radius:50px;text-decoration:none;">Learn More →</a></div>' },
            { type: 'text', html: '<p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:40px;font-family:sans-serif;">This article may contain affiliate links. We only recommend products we trust.</p>' },
        ],
    },

    social_native_ad: {
        name: '✨ Native Ad Premium',
        desc: 'News-site feel with masthead, sponsored badge, native ad styling',
        emoji: '📢',
        category: 'social',
        traffic: ['native', 'facebook', 'seo'],
        structure: [
            { role: 'masthead', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'hero_image', type: 'image' },
            { role: 'body', type: 'text' },
            { role: 'social_proof', type: 'text' },
            { role: 'cta', type: 'button' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:3px solid #0f172a;margin:0 0 24px;"><span style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Health & Science Daily</span><span style="font-size:12px;color:#fff;background:#dc2626;padding:4px 12px;border-radius:50px;font-weight:600;">SPONSORED</span></div>' },
            { type: 'heading', html: '<h1 style="font-size:34px;font-weight:800;line-height:1.2;color:#0f172a;margin:0 0 16px;">New Study Reveals a Surprisingly Simple Solution That\'s Helping Thousands</h1>' },
            { type: 'text', html: '<p style="font-size:14px;color:#94a3b8;margin:0 0 24px;"><em>Published today</em> · 5 min read</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:#f8fafc;border-radius:12px;margin:0 0 28px;min-height:250px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid #e2e8f0;"><span style="color:#94a3b8;font-size:15px;">📸 Click to add news-style image</span></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.8;color:#475569;"><p>Researchers have uncovered a remarkably simple approach that could change the way millions of people address [problem]. The findings, published in a leading journal, show results that have surprised even the most skeptical experts.</p><p style="margin-top:16px;">"We were genuinely taken aback by how effective this turned out to be," says lead researcher Dr. Sarah Mitchell. "The data speaks for itself — and the implications are enormous."</p><p style="margin-top:16px;">What makes this discovery particularly noteworthy is its accessibility. Unlike complex protocols, this approach can be adopted by virtually anyone, regardless of age, background, or experience.</p><p style="margin-top:16px;"><a href="' + (hoplink || '#') + '" style="color:#2563eb;font-weight:600;text-decoration:underline;">→ Click here to see the full research findings</a></p></div>' },
            { type: 'text', html: '<div style="background:#f0fdf4;padding:20px 24px;border-radius:12px;margin:28px 0;border:1px solid #bbf7d0;"><p style="font-size:15px;color:#166534;font-weight:600;margin:0 0 4px;">⭐ Over 50,000 people have already tried this approach</p><p style="font-size:14px;color:#4d7c0f;margin:0;">94% reported positive results within the first 14 days.</p></div>' },
            { type: 'button', html: '<div style="text-align:center;padding:28px 0;"><a href="' + (hoplink || '#') + '" style="display:inline-block;padding:18px 52px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:18px;font-weight:700;border-radius:12px;text-decoration:none;box-shadow:0 4px 16px rgba(37,99,235,0.25);">Read the Full Study →</a></div>' },
            { type: 'text', html: '<p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:32px;border-top:1px solid #f1f5f9;padding-top:16px;">Advertorial · This article is sponsored content. Individual results may vary.</p>' },
        ],
    },

    lead_webinar_replay: {
        name: '✨ Webinar Replay',
        desc: 'Event registration with video hero, speaker bio, agenda timeline',
        emoji: '🎥',
        category: 'lead',
        traffic: ['facebook', 'youtube', 'email'],
        structure: [
            { role: 'event_banner', type: 'text' },
            { role: 'headline', type: 'heading' },
            { role: 'hero_video', type: 'video' },
            { role: 'speaker_bio', type: 'text' },
            { role: 'agenda', type: 'text' },
            { role: 'optin_form', type: 'optin' },
            { role: 'disclosure', type: 'text' },
        ],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:14px 20px;border-radius:50px;text-align:center;margin:0 auto 24px;max-width:400px;"><p style="font-size:14px;color:#fff;font-weight:700;margin:0;">🔴 LIVE REPLAY — Watch Before It\'s Removed</p></div>' },
            { type: 'heading', html: '<h1 style="font-size:36px;font-weight:800;text-align:center;color:#0f172a;line-height:1.15;margin:0 0 12px;">How to [Achieve Result] in 30 Days Using This Simple Method</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#64748b;margin:0 0 32px;">Over 5,000 people watched this live. Here\'s your chance to see what you missed.</p>' },
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:100px 40px;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);border-radius:24px;min-height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;margin:0 0 32px;box-shadow:0 12px 40px rgba(0,0,0,0.2);"><div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><span style="font-size:28px;margin-left:4px;">▶</span></div><span style="color:#555;font-size:16px;">Click to add your webinar replay video</span></div>' },
            { type: 'text', html: '<div style="max-width:540px;margin:0 auto 32px;display:flex;align-items:center;gap:20px;padding:24px;background:#f8fafc;border-radius:20px;border:1px solid #e2e8f0;"><div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:28px;color:#fff;font-weight:700;">S</div><div><p style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px;">Hosted by [Speaker Name]</p><p style="font-size:14px;color:#64748b;margin:0;">Industry Expert · 10+ Years Experience</p><p style="font-size:13px;color:#94a3b8;margin:4px 0 0;">Featured in Forbes, Inc., and Healthline</p></div></div>' },
            { type: 'text', html: '<div style="max-width:540px;margin:0 auto 32px;"><h3 style="font-size:20px;font-weight:700;color:#0f172a;text-align:center;margin:0 0 20px;">What You\'ll Learn:</h3><div style="position:relative;padding-left:32px;"><div style="position:absolute;left:11px;top:0;bottom:0;width:2px;background:#e2e8f0;"></div><div style="position:relative;padding:12px 0;"><div style="position:absolute;left:-26px;top:16px;width:12px;height:12px;background:#6366f1;border-radius:50%;"></div><p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 4px;">The 3-Step Framework</p><p style="font-size:14px;color:#64748b;margin:0;">The exact system used by top performers</p></div><div style="position:relative;padding:12px 0;"><div style="position:absolute;left:-26px;top:16px;width:12px;height:12px;background:#22d3ee;border-radius:50%;"></div><p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 4px;">The #1 Mistake to Avoid</p><p style="font-size:14px;color:#64748b;margin:0;">Why 90% of people fail (and how to fix it)</p></div><div style="position:relative;padding:12px 0;"><div style="position:absolute;left:-26px;top:16px;width:12px;height:12px;background:#10b981;border-radius:50%;"></div><p style="font-size:16px;color:#0f172a;font-weight:600;margin:0 0 4px;">Real Results in 14 Days</p><p style="font-size:14px;color:#64748b;margin:0;">Case studies with actual data and timelines</p></div></div></div>' },
            { type: 'optin', html: '<div style="max-width:480px;margin:0 auto;padding:36px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:24px;text-align:center;"><h3 style="font-size:22px;color:#fff;font-weight:700;margin:0 0 8px;">🎟️ Get Instant Access to the Replay</h3><p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 20px;">Enter your email to watch the full presentation.</p><form data-at-form="optin" style="display:flex;flex-direction:column;gap:10px;"><input type="text" name="name" placeholder="Your Name" style="width:100%;padding:16px 20px;border:none;border-radius:50px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.15);color:#fff;" /><input type="email" name="email" placeholder="Your Email" required style="width:100%;padding:16px 20px;border:none;border-radius:50px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.15);color:#fff;" /><button type="submit" style="width:100%;padding:18px;background:#fff;color:#4f46e5;font-size:18px;font-weight:700;border:none;border-radius:50px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.1);">Watch the Replay →</button></form><p style="color:rgba(255,255,255,0.5);font-size:12px;margin:12px 0 0;">🔒 100% free. No credit card required.</p></div>' },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#d1d5db;margin-top:24px;">We respect your privacy. Unsubscribe anytime.</p>' },
        ],
    },
};
