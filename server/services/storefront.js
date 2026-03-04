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

module.exports = { generateStorefrontHTML };
