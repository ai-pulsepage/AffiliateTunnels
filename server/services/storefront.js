/**
 * Storefront Service — Generates the public-facing product showcase page
 * Server-rendered HTML for SEO, Pinterest OG tags, and fast loading
 */

function generateStorefrontHTML(settings, categories, items) {
    const brand = settings?.brand_name || 'DealFindAI';
    const headline = settings?.hero_headline || 'Premium Products, Curated For You';
    const subtitle = settings?.hero_subtitle || 'We empower the future of AI and product marketing through social media and product placement.';
    const accent = settings?.accent_color || '#6366f1';
    const logoUrl = settings?.logo_url || '';
    const footerText = settings?.footer_text || `© ${new Date().getFullYear()} ${brand}. All rights reserved.`;

    // Only show categories that have visible items
    const activeCategoryIds = new Set(items.map(i => i.category_id).filter(Boolean));
    const activeCategories = categories.filter(c => activeCategoryIds.has(c.id));

    const itemCards = items.map(item => {
        const cat = categories.find(c => c.id === item.category_id);
        return `
        <div class="sf-card" data-category="${cat?.slug || 'all'}">
            <div class="sf-card-img">
                ${item.card_image_url
                ? `<img src="${escapeHtml(item.card_image_url)}" alt="${escapeHtml(item.display_title)}" loading="lazy" />`
                : `<div class="sf-card-placeholder"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>`
            }
            </div>
            <div class="sf-card-body">
                ${cat ? `<span class="sf-card-cat">${escapeHtml(cat.name)}</span>` : ''}
                <h3 class="sf-card-title">${escapeHtml(item.display_title || 'Untitled')}</h3>
                <p class="sf-card-desc">${escapeHtml(item.display_desc || '')}</p>
                ${item.price_label ? `<span class="sf-card-price">${escapeHtml(item.price_label)}</span>` : ''}
                <a href="${escapeHtml(item.page_url)}" class="sf-card-btn" target="_blank" rel="noopener">View Details →</a>
            </div>
        </div>`;
    }).join('\n');

    const categoryButtons = activeCategories.map(c =>
        `<button class="sf-filter-btn" data-filter="${escapeHtml(c.slug)}">${escapeHtml(c.name)}</button>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(brand)} — ${escapeHtml(headline)}</title>
    <meta name="description" content="${escapeHtml(subtitle)}">
    <meta property="og:title" content="${escapeHtml(brand)} — ${escapeHtml(headline)}">
    <meta property="og:description" content="${escapeHtml(subtitle)}">
    <meta property="og:type" content="website">
    ${logoUrl ? `<meta property="og:image" content="${escapeHtml(logoUrl)}">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent: ${accent};
            --accent-light: ${accent}22;
            --bg: #0a0a0f;
            --surface: #12121a;
            --surface-2: #1a1a26;
            --surface-3: #22222f;
            --text: #f0f0f5;
            --text-muted: #8888a0;
            --border: rgba(255,255,255,0.06);
            --glow: ${accent}33;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        /* ─── Header ─── */
        .sf-header {
            position: sticky; top: 0; z-index: 100;
            backdrop-filter: blur(20px) saturate(1.4);
            -webkit-backdrop-filter: blur(20px) saturate(1.4);
            background: rgba(10,10,15,0.8);
            border-bottom: 1px solid var(--border);
        }
        .sf-header-inner {
            max-width: 1280px; margin: 0 auto;
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 32px;
        }
        .sf-logo {
            display: flex; align-items: center; gap: 12px;
            text-decoration: none; color: var(--text);
        }
        .sf-logo-icon {
            width: 40px; height: 40px; border-radius: 12px;
            background: linear-gradient(135deg, var(--accent), #a855f7);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 20px var(--glow);
        }
        .sf-logo-icon svg { width: 20px; height: 20px; color: #fff; }
        .sf-logo-text { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
        .sf-header-tag {
            font-size: 12px; color: var(--text-muted);
            background: var(--surface-2); padding: 6px 14px; border-radius: 20px;
            border: 1px solid var(--border);
        }

        /* ─── Hero ─── */
        .sf-hero {
            position: relative;
            padding: 100px 32px 80px;
            text-align: center;
            overflow: hidden;
        }
        .sf-hero::before {
            content: '';
            position: absolute; inset: 0;
            background: radial-gradient(ellipse 80% 60% at 50% 0%, var(--glow), transparent 70%);
            pointer-events: none;
        }
        .sf-hero-badge {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 18px; border-radius: 100px;
            background: var(--accent-light);
            border: 1px solid ${accent}44;
            font-size: 13px; font-weight: 600; color: var(--accent);
            margin-bottom: 28px;
        }
        .sf-hero h1 {
            font-size: clamp(36px, 5vw, 64px);
            font-weight: 900; letter-spacing: -1.5px;
            line-height: 1.1; margin-bottom: 20px;
            background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .sf-hero p {
            font-size: 18px; color: var(--text-muted);
            max-width: 640px; margin: 0 auto 40px; line-height: 1.7;
        }

        /* ─── Filters ─── */
        .sf-filters {
            display: flex; justify-content: center; gap: 10px;
            flex-wrap: wrap; padding: 0 32px 48px;
        }
        .sf-filter-btn {
            padding: 10px 22px; border-radius: 10px;
            border: 1px solid var(--border);
            background: var(--surface-2); color: var(--text-muted);
            font-size: 14px; font-weight: 500; cursor: pointer;
            transition: all 0.2s ease;
        }
        .sf-filter-btn:hover, .sf-filter-btn.active {
            background: var(--accent); color: #fff;
            border-color: var(--accent);
            box-shadow: 0 4px 20px var(--glow);
        }

        /* ─── Grid ─── */
        .sf-grid {
            max-width: 1280px; margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 28px; padding: 0 32px 80px;
        }

        /* ─── Card ─── */
        .sf-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .sf-card:hover {
            transform: translateY(-4px);
            border-color: ${accent}44;
            box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 40px var(--glow);
        }
        .sf-card-img {
            position: relative; width: 100%;
            aspect-ratio: 16/10; overflow: hidden;
            background: var(--surface-2);
        }
        .sf-card-img img {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.4s ease;
        }
        .sf-card:hover .sf-card-img img { transform: scale(1.05); }
        .sf-card-placeholder {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            color: var(--text-muted);
        }
        .sf-card-body { padding: 24px; }
        .sf-card-cat {
            display: inline-block;
            font-size: 11px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 1.2px; color: var(--accent);
            margin-bottom: 8px;
        }
        .sf-card-title {
            font-size: 20px; font-weight: 700; line-height: 1.3;
            margin-bottom: 8px; letter-spacing: -0.3px;
        }
        .sf-card-desc {
            font-size: 14px; color: var(--text-muted);
            line-height: 1.6; margin-bottom: 16px;
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .sf-card-price {
            display: inline-block;
            font-size: 15px; font-weight: 700; color: #10b981;
            margin-bottom: 16px;
        }
        .sf-card-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 12px 24px; border-radius: 10px;
            background: linear-gradient(135deg, var(--accent), #a855f7);
            color: #fff; font-size: 14px; font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 16px var(--glow);
        }
        .sf-card-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 24px var(--glow);
        }

        /* ─── Empty State ─── */
        .sf-empty {
            text-align: center; padding: 80px 32px;
            color: var(--text-muted);
        }
        .sf-empty svg { width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.4; }
        .sf-empty h3 { font-size: 20px; font-weight: 600; color: var(--text); margin-bottom: 8px; }

        /* ─── Footer ─── */
        .sf-footer {
            border-top: 1px solid var(--border);
            padding: 32px; text-align: center;
            color: var(--text-muted); font-size: 13px;
        }

        /* ─── Mobile ─── */
        @media (max-width: 768px) {
            .sf-header-inner { padding: 12px 16px; }
            .sf-header-tag { display: none; }
            .sf-hero { padding: 60px 20px 48px; }
            .sf-hero p { font-size: 16px; }
            .sf-filters { padding: 0 16px 32px; }
            .sf-grid { padding: 0 16px 60px; grid-template-columns: 1fr; gap: 20px; }
        }

        /* ─── Animations ─── */
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sf-card { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .sf-card:nth-child(1) { animation-delay: 0.05s; }
        .sf-card:nth-child(2) { animation-delay: 0.1s; }
        .sf-card:nth-child(3) { animation-delay: 0.15s; }
        .sf-card:nth-child(4) { animation-delay: 0.2s; }
        .sf-card:nth-child(5) { animation-delay: 0.25s; }
        .sf-card:nth-child(6) { animation-delay: 0.3s; }
        .sf-card:nth-child(7) { animation-delay: 0.35s; }
        .sf-card:nth-child(8) { animation-delay: 0.4s; }
        .sf-card:nth-child(9) { animation-delay: 0.45s; }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="sf-header">
        <div class="sf-header-inner">
            <a href="/" class="sf-logo">
                <div class="sf-logo-icon">
                    ${logoUrl
            ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brand)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
            : `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
        }
                </div>
                <span class="sf-logo-text">${escapeHtml(brand)}</span>
            </a>
            <span class="sf-header-tag">✨ Curated Collection</span>
        </div>
    </header>

    <!-- Hero -->
    <section class="sf-hero">
        <div class="sf-hero-badge">🔥 Featured Products</div>
        <h1>${escapeHtml(headline)}</h1>
        <p>${escapeHtml(subtitle)}</p>
    </section>

    <!-- Category Filters (only show if there are categories with items) -->
    ${activeCategories.length > 0 ? `
    <div class="sf-filters">
        <button class="sf-filter-btn active" data-filter="all">All</button>
        ${categoryButtons}
    </div>
    ` : ''}

    <!-- Product Grid -->
    ${items.length > 0 ? `
    <div class="sf-grid">
        ${itemCards}
    </div>
    ` : `
    <div class="sf-empty">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <h3>Coming Soon</h3>
        <p>Our curated collection is being prepared. Check back soon!</p>
    </div>
    `}

    <!-- Footer -->
    <footer class="sf-footer">
        <p>${escapeHtml(footerText)}</p>
    </footer>

    <!-- Category Filter Script -->
    <script>
    (function() {
        const buttons = document.querySelectorAll('.sf-filter-btn');
        const cards = document.querySelectorAll('.sf-card');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                cards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = '';
                        card.style.animation = 'fadeUp 0.4s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    })();
    </script>
    <script type="text/javascript" src="http://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=15493e3b9670c8396b808af5c75f62d424018c7f"></script>
</body>
</html>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = { generateStorefrontHTML, generateMicrositeHTML };

/**
 * Microsite Renderer — generates HTML for subdomain microsites
 * Routes: /, /products, /products/:slug, /blog, /blog/:slug, /reviews
 */
function generateMicrositeHTML(microsite, products, pathSlug, blogPosts = [], reviews = []) {
    const title = microsite.site_title || 'Products';
    const subtitle = microsite.site_subtitle || '';
    const accent = microsite.accent_color || '#6366f1';
    const logoUrl = microsite.logo_url || '';
    const subdomain = microsite.subdomain || '';

    // Route: /blog
    if (pathSlug === 'blog') {
        return buildBlogIndex(microsite, blogPosts, accent);
    }

    // Route: /blog/:slug
    if (pathSlug && pathSlug.startsWith('blog/')) {
        const blogSlug = pathSlug.replace('blog/', '');
        const post = blogPosts.find(p => p.slug === blogSlug);
        if (!post) return null;
        return buildBlogPostPage(post, microsite, accent);
    }

    // Route: /reviews
    if (pathSlug === 'reviews') {
        return buildReviewsPage(microsite, reviews, accent);
    }

    // Route: /products
    if (pathSlug === 'products') {
        return buildMultiProductPage(microsite, products, accent, title, subtitle, logoUrl, blogPosts, reviews);
    }

    // Route: /:product-slug (specific product)
    if (pathSlug) {
        const product = products.find(p => p.slug === pathSlug);
        if (!product) return null;
        return buildSingleProductPage(product, microsite, accent, blogPosts, reviews);
    }

    // Route: / (home page)
    // Single product → premium showcase page
    if (products.length === 1) {
        return buildSingleProductPage(products[0], microsite, accent, blogPosts, reviews);
    }

    // Multi-product → hero + grid
    return buildMultiProductPage(microsite, products, accent, title, subtitle, logoUrl, blogPosts, reviews);
}

/**
 * Premium single-product showcase page
 * Built server-side from stored data for consistent, beautiful results
 */
function buildSingleProductPage(product, microsite, accent) {
    const name = escapeHtml(product.product_name || 'Product');
    const desc = escapeHtml(product.product_desc || '');
    const price = escapeHtml(product.price_label || '');
    const link = escapeHtml(product.affiliate_url || '#');
    const siteTitle = escapeHtml(microsite.site_title || 'Products');
    const logoUrl = microsite.logo_url || '';

    // Parse images and product intel
    let images = [];
    try { images = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []); } catch { images = []; }
    if (images.length === 0 && product.card_image_url) images = [product.card_image_url];

    let intel = {};
    try { intel = typeof product.product_intel === 'string' ? JSON.parse(product.product_intel) : (product.product_intel || {}); } catch { intel = {}; }

    // Use the best available description: salesDescription > intel description > product_desc
    const salesDesc = escapeHtml(intel.salesDescription || intel.description || product.product_desc || '');
    const brand = escapeHtml(intel.brand || siteTitle);

    // Build carousel slides
    const carouselSlides = images.slice(0, 6).map((url, i) =>
        `<div class="slide${i === 0 ? ' active' : ''}" data-idx="${i}"><img src="${escapeHtml(url)}" alt="${name} - Image ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" /></div>`
    ).join('');
    const carouselDots = images.slice(0, 6).map((_, i) =>
        `<button class="dot${i === 0 ? ' active' : ''}" onclick="goSlide(${i})" aria-label="Image ${i + 1}"></button>`
    ).join('');

    // Build specs from intel
    const specs = [];
    if (intel.specifications) {
        const specEntries = Object.entries(intel.specifications).slice(0, 6);
        specEntries.forEach(([key, val]) => {
            if (val && typeof val === 'string') specs.push({ label: key, value: val });
        });
    }
    const specsHtml = specs.length > 0 ? specs.map(s =>
        `<div class="spec"><span class="spec-label">${escapeHtml(s.label)}</span><span class="spec-value">${escapeHtml(s.value)}</span></div>`
    ).join('') : '';

    // Build features from intel
    const features = (intel.keyFeatures || intel.features || []).slice(0, 4);
    const featuresHtml = features.map(f =>
        `<div class="feature"><span class="feature-icon">✓</span><span>${escapeHtml(typeof f === 'string' ? f : f.name || f.feature || '')}</span></div>`
    ).join('');

    // Build selling points badges (financing, HSA/FSA, shipping, warranty, etc.)
    const badges = [];
    const usedKeywords = new Set(); // Track keywords to prevent duplicates

    const truncate = (s, max = 50) => s && s.length > max ? s.substring(0, max).trim() + '…' : s;

    if (intel.financing && intel.financing.available) {
        const f = intel.financing;
        badges.push({ icon: '💳', title: f.apr || '0% APR', detail: `${f.monthlyFrom ? `As low as ${f.monthlyFrom}` : 'Financing available'}${f.provider ? ` with ${f.provider}` : ''}` });
        usedKeywords.add('financ').add('apr').add('affirm');
    }
    if (intel.medicalDiscount && intel.medicalDiscount.eligible) {
        const m = intel.medicalDiscount;
        badges.push({ icon: '🏥', title: m.type || 'HSA/FSA Eligible', detail: truncate(m.savings || 'Use your health savings') });
        usedKeywords.add('hsa').add('fsa').add('medical');
    }
    if (intel.shipping) {
        badges.push({ icon: '🚚', title: 'Shipping', detail: truncate(intel.shipping) });
        usedKeywords.add('ship').add('curbside').add('delivery');
    }
    if (intel.warranty) {
        badges.push({ icon: '🛡️', title: 'Warranty', detail: truncate(intel.warranty) });
        usedKeywords.add('warrant');
    }
    if (intel.deliveryTime) {
        badges.push({ icon: '📦', title: 'Delivery', detail: truncate(intel.deliveryTime) });
        usedKeywords.add('deliver').add('weeks');
    }
    // Add extra selling points, skipping any that overlap with dedicated fields
    if (intel.sellingPoints && Array.isArray(intel.sellingPoints)) {
        for (const sp of intel.sellingPoints.slice(0, 6)) {
            if (!sp.title) continue;
            const lower = (sp.title + ' ' + (sp.detail || '')).toLowerCase();
            const isDuplicate = [...usedKeywords].some(kw => lower.includes(kw));
            if (!isDuplicate) {
                badges.push({ icon: sp.icon || '✨', title: escapeHtml(sp.title), detail: truncate(escapeHtml(sp.detail || '')) });
            }
        }
    }
    if (intel.bonuses && Array.isArray(intel.bonuses)) {
        for (const bonus of intel.bonuses.slice(0, 2)) {
            if (bonus) badges.push({ icon: '🎁', title: 'Included', detail: truncate(escapeHtml(typeof bonus === 'string' ? bonus : bonus.name || '')) });
        }
    }
    const badgesHtml = badges.length > 0 ? badges.slice(0, 6).map(b =>
        `<div class="badge"><span class="badge-icon">${b.icon}</span><div><span class="badge-title">${b.title}</span><span class="badge-detail">${b.detail}</span></div></div>`
    ).join('') : '';

    // Email popup
    const popupHtml = microsite.optin_enabled ? buildEmailPopup(microsite, accent) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${siteTitle}</title>
<meta name="description" content="${salesDesc.substring(0, 160)}">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${salesDesc.substring(0, 160)}">
<meta property="og:type" content="product">
${images[0] ? `<meta property="og:image" content="${escapeHtml(images[0])}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${name}">
<meta name="twitter:description" content="${salesDesc.substring(0, 160)}">
${images[0] ? `<meta name="twitter:image" content="${escapeHtml(images[0])}">` : ''}
<script type="application/ld+json">
${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.product_name || 'Product',
        "description": intel.salesDescription || intel.description || product.product_desc || '',
        "image": images[0] || '',
        "brand": { "@type": "Brand", "name": intel.brand || siteTitle },
        ...(product.price_label ? { "offers": { "@type": "Offer", "price": product.price_label.replace(/[^0-9.]/g, ''), "priceCurrency": "USD", "availability": "https://schema.org/InStock", "url": product.affiliate_url } } : {}),
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "120" }
    })}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--accent:${accent};--accent-h:${accent}18;--accent-g:${accent}40}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#fafafa;color:#1a1a2e;line-height:1.6;-webkit-font-smoothing:antialiased}

/* Header */
.hdr{position:sticky;top:0;z-index:90;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,0.06)}
.hdr-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 24px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#1a1a2e;font-size:17px;font-weight:800}
.brand-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#a855f7);display:flex;align-items:center;justify-content:center}
.brand-icon img{width:100%;height:100%;object-fit:cover;border-radius:10px}
.hdr-cta{padding:10px 22px;border-radius:10px;background:var(--accent);color:#fff;font-size:14px;font-weight:600;text-decoration:none;transition:all .25s;box-shadow:0 2px 12px var(--accent-h)}
.hdr-cta:hover{transform:translateY(-1px);box-shadow:0 4px 20px var(--accent-g)}

/* Hero Section */
.hero{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;padding:48px 24px 56px;align-items:center}

/* Carousel */
.carousel{position:relative;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,0.08);aspect-ratio:1/1}
.slide{display:none;width:100%;height:100%}
.slide.active{display:block}
.slide img{width:100%;height:100%;object-fit:contain;padding:16px}
.dots{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px}
.dot{width:10px;height:10px;border-radius:50%;border:2px solid rgba(0,0,0,0.2);background:transparent;cursor:pointer;transition:all .25s;padding:0}
.dot.active{background:var(--accent);border-color:var(--accent);transform:scale(1.2)}
.nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.1);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:2}
.nav-btn:hover{background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.nav-prev{left:12px}
.nav-next{right:12px}
.thumbs{display:flex;gap:8px;margin-top:12px}
.thumb{width:64px;height:64px;border-radius:10px;overflow:hidden;border:2px solid transparent;cursor:pointer;transition:all .2s;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.thumb.active{border-color:var(--accent);box-shadow:0 2px 12px var(--accent-h)}
.thumb img{width:100%;height:100%;object-fit:contain;padding:4px}

/* Product Info */
.info{display:flex;flex-direction:column;gap:20px}
.info h1{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-1px;line-height:1.15;color:#0f0f23}
.rating{display:flex;align-items:center;gap:8px;font-size:14px;color:#666}
.stars{color:#f59e0b;font-size:18px;letter-spacing:2px}
.price-tag{font-size:32px;font-weight:800;color:var(--accent)}
.price-sub{font-size:14px;color:#888;font-weight:400}
.info-desc{font-size:15px;color:#555;line-height:1.7;max-height:120px;overflow:hidden}
.cta-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:18px 40px;border-radius:14px;background:var(--accent);color:#fff;font-size:17px;font-weight:700;text-decoration:none;transition:all .3s;box-shadow:0 6px 24px var(--accent-h);border:none;cursor:pointer;width:100%;max-width:380px}
.cta-primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px var(--accent-g)}
.cta-micro{text-align:center;color:#888;font-size:12px;margin-top:-10px}

/* Features Strip */
.features-strip{background:#fff;border-top:1px solid rgba(0,0,0,0.05);border-bottom:1px solid rgba(0,0,0,0.05)}
.features-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0;padding:0}
.feature{display:flex;align-items:center;gap:14px;padding:24px 28px;border-right:1px solid rgba(0,0,0,0.05);font-size:14px;font-weight:500;color:#333}
.feature:last-child{border-right:none}
.feature-icon{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--accent-h),transparent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}

/* Selling Point Badges */
.badges{display:flex;flex-wrap:wrap;gap:10px}
.badge{display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f8f8fc;border:1px solid rgba(0,0,0,0.06);border-radius:12px;flex:1 1 calc(50% - 5px);min-width:180px;transition:all .2s}
.badge:hover{border-color:var(--accent-h);background:#f0f0ff}
.badge-icon{font-size:20px;flex-shrink:0}
.badge-title{display:block;font-size:13px;font-weight:700;color:#0f0f23}
.badge-detail{display:block;font-size:12px;color:#666;line-height:1.3}

/* Specs Section */
.specs-section{max-width:1080px;margin:0 auto;padding:48px 24px}
.specs-section h2{font-size:24px;font-weight:800;color:#0f0f23;margin-bottom:24px;text-align:center}
.specs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.spec{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#fff;border-radius:12px;border:1px solid rgba(0,0,0,0.06);transition:all .2s}
.spec:hover{border-color:var(--accent-h);box-shadow:0 2px 12px rgba(0,0,0,0.04)}
.spec-label{font-size:13px;color:#888;font-weight:500;text-transform:uppercase;letter-spacing:0.5px}
.spec-value{font-size:15px;font-weight:600;color:#1a1a2e}

/* Final CTA */
.final-cta{text-align:center;padding:64px 24px;background:linear-gradient(180deg,#fafafa,#f0f0f5)}
.final-cta h2{font-size:clamp(24px,3.5vw,36px);font-weight:800;color:#0f0f23;margin-bottom:12px}
.final-cta p{color:#666;font-size:16px;margin-bottom:28px;max-width:500px;margin-left:auto;margin-right:auto}

/* Footer */
.ftr{padding:24px;text-align:center;color:#aaa;font-size:12px;border-top:1px solid rgba(0,0,0,0.05)}

/* Email Popup */
.popup-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);z-index:200;align-items:center;justify-content:center}
.popup-overlay.show{display:flex}
.popup{background:#fff;border-radius:20px;max-width:420px;width:90%;padding:40px 32px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.2);position:relative;animation:popIn .3s ease}
@keyframes popIn{from{opacity:0;transform:scale(0.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
.popup-close{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:50%;border:none;background:#f5f5f5;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;color:#888;transition:all .2s}
.popup-close:hover{background:#e5e5e5;color:#333}
.popup h3{font-size:22px;font-weight:800;color:#0f0f23;margin-bottom:8px}
.popup p{font-size:14px;color:#666;margin-bottom:24px}
.popup input{width:100%;padding:14px 16px;border:2px solid #e5e5e5;border-radius:10px;font-size:15px;margin-bottom:10px;transition:border-color .2s;font-family:inherit}
.popup input:focus{outline:none;border-color:var(--accent)}
.popup button[type=submit]{width:100%;padding:16px;border:none;border-radius:10px;background:var(--accent);color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s}
.popup button[type=submit]:hover{opacity:0.9}
.popup .privacy{font-size:11px;color:#aaa;margin-top:12px}

/* Responsive */
@media(max-width:768px){
  .hero{grid-template-columns:1fr;gap:28px;padding:24px 16px 40px}
  .carousel{aspect-ratio:4/3}
  .features-inner{grid-template-columns:1fr 1fr}
  .feature{padding:18px 16px;font-size:13px}
  .thumbs{overflow-x:auto;padding-bottom:4px}
  .specs-grid{grid-template-columns:1fr}
  .cta-primary{max-width:100%}
}
@media(max-width:480px){
  .features-inner{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- Header -->
<header class="hdr">
<div class="hdr-inner">
  <a href="/" class="brand">
    <div class="brand-icon">${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="">` : `<svg fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`}</div>
    ${siteTitle}
  </a>
  <nav style="display:flex;gap:4px;align-items:center;margin-left:auto;margin-right:16px">
    <a href="/products" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;color:#555;transition:all .2s">Products</a>
    <a href="/reviews" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;color:#555;transition:all .2s">Reviews</a>
    <a href="/blog" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;color:#555;transition:all .2s">Blog</a>
  </nav>
  <a href="${link}" class="hdr-cta" target="_blank" rel="noopener">Shop Now →</a>
</div>
</header>

<!-- Hero: Image Carousel + Product Info -->
<section class="hero">
  <div>
    <div class="carousel" id="carousel">
      ${carouselSlides || `<div class="slide active"><div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc"><svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div></div>`}
      ${images.length > 1 ? `<button class="nav-btn nav-prev" onclick="prevSlide()">‹</button><button class="nav-btn nav-next" onclick="nextSlide()">›</button>` : ''}
      ${images.length > 1 ? `<div class="dots">${carouselDots}</div>` : ''}
    </div>
    ${images.length > 1 ? `<div class="thumbs">${images.slice(0, 6).map((url, i) => `<div class="thumb${i === 0 ? ' active' : ''}" onclick="goSlide(${i})"><img src="${escapeHtml(url)}" alt="Thumb ${i + 1}" loading="lazy" /></div>`).join('')}</div>` : ''}
  </div>

  <div class="info">
    <h1>${name}</h1>
    <div class="rating"><span class="stars">★★★★★</span> <span>4.8/5 rating</span></div>
    ${price ? `<div class="price-tag">${price} <span class="price-sub">USD</span></div>` : ''}
    ${badgesHtml ? `<div class="badges">${badgesHtml}</div>` : ''}
    ${salesDesc ? `<p class="info-desc">${salesDesc}</p>` : ''}
    <a href="${link}" class="cta-primary" target="_blank" rel="noopener">Shop Now — ${price || 'View Pricing'} →</a>
    <p class="cta-micro">✓ Secure checkout${intel.shipping ? ` · ${escapeHtml(intel.shipping)}` : ''}</p>
  </div>
</section>

<!-- Features Strip -->
${featuresHtml ? `<div class="features-strip"><div class="features-inner">${featuresHtml}</div></div>` : ''}

<!-- Specs -->
${specsHtml ? `<section class="specs-section"><h2>Product Specifications</h2><div class="specs-grid">${specsHtml}</div></section>` : ''}

<!-- Final CTA -->
<section class="final-cta">
  <h2>Ready to Experience ${name}?</h2>
  <p>Join thousands of satisfied customers. Order today and transform your space.</p>
  <a href="${link}" class="cta-primary" target="_blank" rel="noopener" style="margin:0 auto">Get Yours Now →</a>
</section>

<!-- Footer -->
<footer class="ftr">
  <p>© ${new Date().getFullYear()} ${siteTitle}</p>
</footer>

${popupHtml}

<!-- Carousel JS -->
<script>
let cur=0;const slides=document.querySelectorAll('.slide'),dots=document.querySelectorAll('.dot'),thumbs=document.querySelectorAll('.thumb');
function goSlide(n){slides.forEach(s=>s.classList.remove('active'));dots.forEach(d=>d.classList.remove('active'));thumbs.forEach(t=>t.classList.remove('active'));
cur=n;if(slides[cur])slides[cur].classList.add('active');if(dots[cur])dots[cur].classList.add('active');if(thumbs[cur])thumbs[cur].classList.add('active')}
function nextSlide(){goSlide((cur+1)%slides.length)}function prevSlide(){goSlide((cur-1+slides.length)%slides.length)}
</script>
</body>
</html>`;
}

/**
 * Multi-product grid page
 */
function buildMultiProductPage(microsite, products, accent, title, subtitle, logoUrl) {
    const heroImage = products[0]?.card_image_url || '';
    const productCards = products.map(p => {
        const link = `/${p.slug}`;
        return `
        <div class="ms-card">
            <div class="ms-card-img">
                ${p.card_image_url
                ? `<img src="${escapeHtml(p.card_image_url)}" alt="${escapeHtml(p.product_name)}" loading="lazy" />`
                : `<div class="ms-card-placeholder"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>`
            }
            </div>
            <div class="ms-card-body">
                <h3 class="ms-card-title">${escapeHtml(p.product_name || 'Product')}</h3>
                <p class="ms-card-desc">${escapeHtml((p.product_desc || '').substring(0, 200))}</p>
                ${p.price_label ? `<span class="ms-card-price">${escapeHtml(p.price_label)}</span>` : ''}
                <a href="${escapeHtml(link)}" class="ms-card-btn">View Details →</a>
            </div>
        </div>`;
    }).join('\n');

    const optinHtml = microsite.optin_enabled ? buildOptinInline(microsite, accent) : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(subtitle || title)}">
<meta property="og:title" content="${escapeHtml(title)}">
${heroImage ? `<meta property="og:image" content="${escapeHtml(heroImage)}">` : ''}
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--accent:${accent}}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#fafafa;color:#1a1a2e;line-height:1.6;-webkit-font-smoothing:antialiased}
.hdr{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,0.06)}
.hdr-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;padding:14px 24px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#1a1a2e;font-size:17px;font-weight:800}
.brand-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#a855f7);display:flex;align-items:center;justify-content:center}
.ms-hero{padding:64px 24px 40px;text-align:center}
.ms-hero h1{font-size:clamp(28px,4vw,48px);font-weight:900;letter-spacing:-1px;color:#0f0f23;margin-bottom:12px}
.ms-hero p{font-size:17px;color:#666;max-width:520px;margin:0 auto}
.ms-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;padding:0 24px 60px}
.ms-card{background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden;transition:all .3s;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
.ms-card:hover{transform:translateY(-4px);border-color:${accent}44;box-shadow:0 12px 40px rgba(0,0,0,0.08)}
.ms-card-img{width:100%;aspect-ratio:16/10;overflow:hidden;background:#f5f5f5}
.ms-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.ms-card:hover .ms-card-img img{transform:scale(1.05)}
.ms-card-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ccc}
.ms-card-body{padding:20px}
.ms-card-title{font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:8px}
.ms-card-desc{font-size:14px;color:#888;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ms-card-price{display:inline-block;font-size:16px;font-weight:700;color:var(--accent);margin-bottom:14px}
.ms-card-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:10px;background:var(--accent);color:#fff;font-size:14px;font-weight:600;text-decoration:none;transition:all .25s}
.ms-card-btn:hover{opacity:0.9;transform:translateY(-1px)}
.ftr{border-top:1px solid rgba(0,0,0,0.05);padding:24px;text-align:center;color:#aaa;font-size:12px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.ms-card{animation:fadeUp .5s ease forwards;opacity:0}
.ms-card:nth-child(1){animation-delay:.05s}.ms-card:nth-child(2){animation-delay:.1s}.ms-card:nth-child(3){animation-delay:.15s}.ms-card:nth-child(4){animation-delay:.2s}
@media(max-width:768px){.ms-hero{padding:40px 16px 24px}.ms-grid{padding:0 16px 40px;grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="hdr"><div class="hdr-inner"><a href="/" class="brand"><div class="brand-icon"><svg fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>${escapeHtml(title)}</a><nav style="display:flex;gap:4px;align-items:center;margin-left:auto"><a href="/products" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700;color:${accent};background:${accent}12">Products</a><a href="/reviews" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;color:#555">Reviews</a><a href="/blog" style="padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;color:#555">Blog</a></nav></div></header>
<section class="ms-hero"><h1>${escapeHtml(title)}</h1>${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}</section>
<div class="ms-grid">${productCards}</div>
${optinHtml}
<footer class="ftr"><p>© ${new Date().getFullYear()} ${escapeHtml(title)}</p></footer>
</body></html>`;
}

function buildEmailPopup(microsite, accent) {
    const headline = microsite.optin_headline || 'Get an Exclusive Offer';
    const incentive = microsite.optin_incentive || 'Enter your email to receive a special discount code.';
    return `
<div class="popup-overlay" id="emailPopup">
  <div class="popup">
    <button class="popup-close" onclick="closePopup()">✕</button>
    <h3>${escapeHtml(headline)}</h3>
    <p>${escapeHtml(incentive)}</p>
    <form data-at-form="optin" method="POST" action="/api/leads" onsubmit="handlePopupSubmit(event)">
      <input type="text" name="name" placeholder="Your name" />
      <input type="email" name="email" placeholder="Your email" required />
      <button type="submit">Claim My Offer →</button>
    </form>
    <p class="privacy">We respect your privacy. Unsubscribe anytime.</p>
  </div>
</div>
<script>
function closePopup(){document.getElementById('emailPopup').classList.remove('show')}
function handlePopupSubmit(e){e.preventDefault();const f=e.target;fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.name.value,email:f.email.value,source:'microsite-popup'})}).then(()=>{f.innerHTML='<p style="font-size:18px;font-weight:700;color:var(--accent);padding:20px">🎉 You\\'re in! Check your email.</p>'}).catch(()=>{f.innerHTML='<p style="color:#e74c3c">Something went wrong. Please try again.</p>'})}
setTimeout(()=>{if(!sessionStorage.getItem('popup_shown')){document.getElementById('emailPopup').classList.add('show');sessionStorage.setItem('popup_shown','1')}},8000);
</script>`;
}

function buildOptinInline(microsite, accent) {
    const headline = microsite.optin_headline || 'Get an Exclusive Discount';
    const incentive = microsite.optin_incentive || 'Enter your email to receive your special offer link.';
    return `
    <div style="max-width:520px;margin:40px auto;padding:36px;background:#fff;border-radius:20px;border:1px solid rgba(0,0,0,0.06);text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
        <h3 style="font-size:22px;font-weight:800;color:#0f0f23;margin-bottom:8px;">${escapeHtml(headline)}</h3>
        <p style="color:#666;font-size:14px;margin-bottom:20px;">${escapeHtml(incentive)}</p>
        <form data-at-form="optin" method="POST" action="/api/leads" style="display:flex;flex-direction:column;gap:10px;max-width:360px;margin:0 auto;">
            <input type="text" name="name" placeholder="Your Name" style="padding:14px 18px;border:2px solid #e5e5e5;background:#fff;color:#1a1a2e;border-radius:10px;font-size:15px;font-family:inherit" />
            <input type="email" name="email" placeholder="Your Email" required style="padding:14px 18px;border:2px solid #e5e5e5;background:#fff;color:#1a1a2e;border-radius:10px;font-size:15px;font-family:inherit" />
            <button type="submit" style="padding:16px;background:${accent};color:#fff;font-size:16px;font-weight:700;border:none;border-radius:10px;cursor:pointer;font-family:inherit">Get My Discount →</button>
        </form>
        <p style="color:#aaa;font-size:11px;margin-top:10px;">We respect your privacy. Unsubscribe anytime.</p>
    </div>`;
}

// ─── Shared Navigation Bar ──────────────────────────────────────
function buildMicrositeNav(microsite, accent, activePage = '') {
    const siteTitle = escapeHtml(microsite.site_title || 'Products');
    const logoUrl = microsite.logo_url || '';
    return `
<header style="position:sticky;top:0;z-index:90;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,0,0,0.06)">
<div style="max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 24px">
  <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#0f0f23;font-weight:700;font-size:16px">
    <div style="width:32px;height:32px;border-radius:10px;background:${accent};display:flex;align-items:center;justify-content:center">${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="" style="width:18px;height:18px;object-fit:contain">` : `<svg fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`}</div>
    ${siteTitle}
  </a>
  <nav style="display:flex;gap:4px;align-items:center">
    <a href="/products" style="padding:8px 16px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:${activePage === 'products' ? '700' : '500'};color:${activePage === 'products' ? accent : '#555'};background:${activePage === 'products' ? accent + '12' : 'transparent'};transition:all .2s">Products</a>
    <a href="/reviews" style="padding:8px 16px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:${activePage === 'reviews' ? '700' : '500'};color:${activePage === 'reviews' ? accent : '#555'};background:${activePage === 'reviews' ? accent + '12' : 'transparent'};transition:all .2s">Reviews</a>
    <a href="/blog" style="padding:8px 16px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:${activePage === 'blog' ? '700' : '500'};color:${activePage === 'blog' ? accent : '#555'};background:${activePage === 'blog' ? accent + '12' : 'transparent'};transition:all .2s">Blog</a>
  </nav>
</div>
</header>`;
}

// ─── Shared Page Shell ──────────────────────────────────────────
function buildPageShell(title, description, accent, bodyHtml, extraHead = '', microsite = null) {
    const optinPopup = (microsite && microsite.optin_enabled) ? `
<!-- Opt-in Popup -->
<div id="optin-overlay" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9998;backdrop-filter:blur(4px);opacity:0;transition:opacity .3s"></div>
<div id="optin-popup" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);background:#fff;border-radius:20px;padding:40px;max-width:420px;width:90%;z-index:9999;box-shadow:0 24px 64px rgba(0,0,0,0.2);text-align:center;opacity:0;transition:all .3s">
    <div style="width:48px;height:48px;background:${accent};border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
        <svg width="24" height="24" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    </div>
    <h3 style="font-size:20px;font-weight:800;color:#111;margin-bottom:8px">${escapeHtml(microsite.optin_headline || 'Stay in the Loop')}</h3>
    <p style="font-size:14px;color:#666;margin-bottom:20px;line-height:1.5">${escapeHtml(microsite.optin_incentive || 'Get exclusive deals and new content delivered to your inbox.')}</p>
    <form id="optin-form" style="text-align:left">
        <input type="text" id="optin-name" placeholder="Your name (optional)" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;margin-bottom:8px;outline:none">
        <input type="email" id="optin-email" placeholder="Your email" required style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;margin-bottom:12px;outline:none">
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#888;margin-bottom:16px;cursor:pointer">
            <input type="checkbox" id="optin-consent" required style="margin-top:2px;accent-color:${accent}">
            <span>I agree to receive educational content and promotions. We never share your email with anyone.</span>
        </label>
        <button type="submit" id="optin-btn" style="width:100%;padding:14px;background:${accent};color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:transform .2s,opacity .2s">Subscribe</button>
    </form>
    <button id="optin-close" style="margin-top:16px;background:none;border:none;color:#999;font-size:13px;cursor:pointer;padding:4px 12px">No thanks</button>
    <p id="optin-success" style="display:none;color:${accent};font-weight:600;font-size:15px;margin-top:8px">✓ You're in! Check your inbox.</p>
</div>
<script>
(function(){
    if(sessionStorage.getItem('optin_dismissed_${microsite.subdomain}'))return;
    setTimeout(function(){
        var o=document.getElementById('optin-overlay'),p=document.getElementById('optin-popup');
        o.style.display='block';p.style.display='block';
        setTimeout(function(){o.style.opacity='1';p.style.opacity='1';p.style.transform='translate(-50%,-50%) scale(1)';},50);
    }, 5000);
    function close(){
        var o=document.getElementById('optin-overlay'),p=document.getElementById('optin-popup');
        o.style.opacity='0';p.style.opacity='0';p.style.transform='translate(-50%,-50%) scale(0.95)';
        setTimeout(function(){o.style.display='none';p.style.display='none';},300);
        sessionStorage.setItem('optin_dismissed_${microsite.subdomain}','1');
    }
    document.getElementById('optin-close').onclick=close;
    document.getElementById('optin-overlay').onclick=close;
    document.getElementById('optin-form').onsubmit=function(e){
        e.preventDefault();
        var btn=document.getElementById('optin-btn');
        btn.textContent='Subscribing...';btn.disabled=true;
        fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
            email:document.getElementById('optin-email').value,
            name:document.getElementById('optin-name').value
        })}).then(function(r){return r.json()}).then(function(){
            document.getElementById('optin-form').style.display='none';
            document.getElementById('optin-close').style.display='none';
            document.getElementById('optin-success').style.display='block';
            sessionStorage.setItem('optin_dismissed_${microsite.subdomain}','1');
            setTimeout(close,3000);
        }).catch(function(){btn.textContent='Try again';btn.disabled=false;});
    };
})();
</script>
` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml((description || '').substring(0, 160))}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml((description || '').substring(0, 160))}">
<meta name="twitter:card" content="summary_large_image">
${extraHead}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--accent:${accent}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#fafafa;color:#1a1a2e;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
.container{max-width:1080px;margin:0 auto;padding:48px 24px}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px}
.card{background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);overflow:hidden;transition:all .3s;text-decoration:none;color:inherit;display:flex;flex-direction:column}
.card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.08);transform:translateY(-2px)}
.card-img{width:100%;aspect-ratio:16/10;object-fit:cover;background:#f5f5f5}
.card-body{padding:24px;flex:1;display:flex;flex-direction:column}
.card-title{font-size:18px;font-weight:700;color:#0f0f23;margin-bottom:8px;line-height:1.3}
.card-excerpt{font-size:14px;color:#666;line-height:1.5;flex:1}
.card-meta{font-size:12px;color:#999;margin-top:16px;display:flex;align-items:center;gap:8px}
.tag{display:inline-block;padding:4px 10px;background:var(--accent);color:#fff;border-radius:6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.empty{text-align:center;padding:80px 24px;color:#888;font-size:16px}
footer{text-align:center;padding:32px;color:#888;font-size:13px;border-top:1px solid rgba(0,0,0,0.06)}
@media(max-width:768px){.card-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
${bodyHtml}
${optinPopup}
<footer><p>© ${new Date().getFullYear()} ${escapeHtml(title.split('|')[0].trim())}</p></footer>
</body>
</html>`;
}

// ─── Blog Index Page ────────────────────────────────────────────
function buildBlogIndex(microsite, blogPosts, accent) {
    const siteTitle = escapeHtml(microsite.site_title || 'Blog');
    const nav = buildMicrositeNav(microsite, accent, 'blog');

    const postsHtml = blogPosts.length > 0 ? blogPosts.map(post => {
        const title = escapeHtml(post.title || 'Untitled');
        const excerpt = escapeHtml((post.excerpt || '').substring(0, 200));
        const date = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const author = escapeHtml(post.author_name || 'Staff Writer');
        const img = post.featured_image ? `<img class="card-img" src="${escapeHtml(post.featured_image)}" alt="${title}" loading="lazy">` : `<div class="card-img" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${accent}15,${accent}05)"><svg width="48" height="48" fill="none" stroke="${accent}" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6.25a.75.75 0 0 1 .75.75v4.25H17a.75.75 0 0 1 0 1.5h-4.25V17a.75.75 0 0 1-1.5 0v-4.25H7a.75.75 0 0 1 0-1.5h4.25V7a.75.75 0 0 1 .75-.75z"/></svg></div>`;
        return `<a href="/blog/${escapeHtml(post.slug)}" class="card">
            ${img}
            <div class="card-body">
                ${post.target_keyword ? `<span class="tag">${escapeHtml(post.target_keyword)}</span>` : ''}
                <h2 class="card-title">${title}</h2>
                <p class="card-excerpt">${excerpt}</p>
                <div class="card-meta"><span>By ${author}</span>${date ? ` · <span>${date}</span>` : ''}</div>
            </div>
        </a>`;
    }).join('') : '<div class="empty"><p>No blog posts yet. Check back soon!</p></div>';

    const body = `${nav}
<div class="container">
    <h1 style="font-size:32px;font-weight:800;color:#0f0f23;margin-bottom:8px">Blog</h1>
    <p style="color:#666;margin-bottom:32px;font-size:16px">Insights, guides, and expert advice</p>
    <div class="card-grid">${postsHtml}</div>
</div>`;

    return buildPageShell(`Blog | ${siteTitle}`, `Latest articles and insights from ${siteTitle}`, accent, body, '', microsite);
}

// ─── Individual Blog Post Page ──────────────────────────────────
function buildBlogPostPage(post, microsite, accent) {
    const siteTitle = escapeHtml(microsite.site_title || 'Blog');
    const nav = buildMicrositeNav(microsite, accent, 'blog');
    const title = escapeHtml(post.title || 'Untitled');
    const author = escapeHtml(post.author_name || 'Staff Writer');
    const authorTitle = escapeHtml(post.author_title || '');
    const date = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const content = post.content_html || '';
    const keyword = escapeHtml(post.target_keyword || '');

    // JSON-LD Article schema
    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title || '',
        "description": post.seo_description || post.excerpt || '',
        "image": post.featured_image || '',
        "author": { "@type": "Person", "name": post.author_name || 'Staff Writer' },
        "publisher": { "@type": "Organization", "name": microsite.site_title || '' },
        "datePublished": post.published_at || post.created_at || '',
        "dateModified": post.updated_at || post.published_at || '',
        "keywords": post.target_keyword || '',
    });

    const extraHead = `
<meta property="og:type" content="article">
${post.featured_image ? `<meta property="og:image" content="${escapeHtml(post.featured_image)}">` : ''}
<script type="application/ld+json">${jsonLd}</script>`;

    const body = `${nav}
<article style="max-width:740px;margin:0 auto;padding:48px 24px">
    ${keyword ? `<span class="tag" style="margin-bottom:16px">${keyword}</span>` : ''}
    <h1 style="font-size:36px;font-weight:900;color:#0f0f23;line-height:1.2;margin:16px 0 24px">${title}</h1>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid rgba(0,0,0,0.06)">
        <div style="width:44px;height:44px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">${author.charAt(0)}</div>
        <div>
            <div style="font-weight:600;color:#0f0f23;font-size:15px">${author}</div>
            <div style="font-size:13px;color:#888">${authorTitle}${authorTitle && date ? ' · ' : ''}${date}</div>
        </div>
    </div>
    ${post.featured_image ? `<img src="${escapeHtml(post.featured_image)}" alt="${title}" style="width:100%;border-radius:16px;margin-bottom:32px;aspect-ratio:16/9;object-fit:cover">` : ''}
    <div class="blog-content" style="font-size:17px;line-height:1.8;color:#333">
        ${content}
    </div>
    <div style="margin-top:48px;padding-top:32px;border-top:1px solid rgba(0,0,0,0.06);text-align:center">
        <a href="/blog" style="color:${accent};font-weight:600;text-decoration:none;font-size:15px">← Back to all articles</a>
    </div>
</article>
<style>
.blog-content h2{font-size:24px;font-weight:800;color:#0f0f23;margin:36px 0 16px}
.blog-content h3{font-size:20px;font-weight:700;color:#0f0f23;margin:28px 0 12px}
.blog-content p{margin-bottom:18px}
.blog-content ul,.blog-content ol{margin:16px 0;padding-left:28px}
.blog-content li{margin-bottom:8px}
.blog-content blockquote{border-left:4px solid ${accent};padding:16px 24px;margin:24px 0;background:#f8f8fc;border-radius:0 12px 12px 0;font-style:italic;color:#555}
.blog-content a{color:${accent};font-weight:500}
.blog-content img{max-width:100%;border-radius:12px;margin:24px 0}
.blog-content strong{color:#0f0f23}
</style>`;

    return buildPageShell(
        post.seo_title || `${post.title} | ${siteTitle}`,
        post.seo_description || post.excerpt || '',
        accent, body, extraHead, microsite
    );
}

// ─── Reviews Page ───────────────────────────────────────────────
function buildReviewsPage(microsite, reviews, accent) {
    const siteTitle = escapeHtml(microsite.site_title || 'Reviews');
    const nav = buildMicrositeNav(microsite, accent, 'reviews');

    const reviewsHtml = reviews.length > 0 ? reviews.map(review => {
        const name = escapeHtml(review.name || 'Review');
        const desc = escapeHtml((review.seo_description || '').substring(0, 150));
        const img = review.thumbnail_url
            ? `<img class="card-img" src="${escapeHtml(review.thumbnail_url)}" alt="${name}" loading="lazy">`
            : `<div class="card-img" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${accent}20,${accent}08)"><svg width="48" height="48" fill="none" stroke="${accent}" stroke-width="1.5" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></div>`;
        const slug = escapeHtml(review.slug || '');
        return `<a href="/p/${slug}" class="card" target="_blank" rel="noopener">
            ${img}
            <div class="card-body">
                <span class="tag">Review</span>
                <h2 class="card-title">${name}</h2>
                <p class="card-excerpt">${desc}</p>
            </div>
        </a>`;
    }).join('') : '<div class="empty"><p>No reviews yet. Check back soon!</p></div>';

    const body = `${nav}
<div class="container">
    <h1 style="font-size:32px;font-weight:800;color:#0f0f23;margin-bottom:8px">Reviews</h1>
    <p style="color:#666;margin-bottom:32px;font-size:16px">In-depth product reviews and comparisons</p>
    <div class="card-grid">${reviewsHtml}</div>
</div>`;

    return buildPageShell(`Reviews | ${siteTitle}`, `Product reviews and comparisons from ${siteTitle}`, accent, body, '', microsite);
}

