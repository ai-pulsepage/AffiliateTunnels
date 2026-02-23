const { getSettingSync } = require('../config/settings');

function generatePublishedHTML(page, funnel) {
  const ga4Id = funnel.ga4_id || getSettingSync('default_ga4_id') || '';
  const fbPixelId = funnel.fb_pixel_id || getSettingSync('default_fb_pixel_id') || '';
  const appBaseUrl = getSettingSync('app_base_url') || '';
  const physicalAddress = getSettingSync('physical_address') || '';

  const ga4Script = ga4Id ? `
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4Id}');
    </script>` : '';

  const fbPixelScript = fbPixelId ? `
    <!-- Facebook Pixel -->
    <script>
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${fbPixelId}');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"/></noscript>` : '';

  const trackingScript = appBaseUrl ? `
    <!-- AffiliateTunnels Tracking -->
    <script>
      (function(){
        var fid="${funnel.id}",pid="${page.id}";
        var vid=localStorage.getItem('at_vid')||crypto.randomUUID();
        localStorage.setItem('at_vid',vid);
        var sid=sessionStorage.getItem('at_sid')||crypto.randomUUID();
        sessionStorage.setItem('at_sid',sid);
        var u=new URL(location.href);
        fetch("${appBaseUrl}/api/tracking/event",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({funnel_id:fid,page_id:pid,event_type:"pageview",visitor_id:vid,session_id:sid,
            referrer:document.referrer,page_url:location.href,
            utm_source:u.searchParams.get("utm_source")||"",
            utm_medium:u.searchParams.get("utm_medium")||"",
            utm_campaign:u.searchParams.get("utm_campaign")||""
          })
        }).catch(function(){});
        document.addEventListener("click",function(e){
          var t=e.target.closest("a,button,[data-track]");
          if(t){fetch("${appBaseUrl}/api/tracking/event",{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({funnel_id:fid,page_id:pid,event_type:"click",visitor_id:vid,session_id:sid,
              element_id:t.id||t.textContent.substring(0,50),page_url:location.href})
          }).catch(function(){});}
        });
        var startTime=Date.now();
        window.addEventListener("beforeunload",function(){
          var seconds=Math.round((Date.now()-startTime)/1000);
          navigator.sendBeacon("${appBaseUrl}/api/tracking/event",JSON.stringify({
            funnel_id:fid,page_id:pid,event_type:"bounce",visitor_id:vid,session_id:sid,
            time_on_page:seconds,page_url:location.href}));
        });
      })();
    </script>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.seo_title || funnel.seo_title || funnel.name}</title>
  <meta name="description" content="${page.seo_description || funnel.seo_description || ''}">
  <meta property="og:title" content="${page.seo_title || funnel.name}">
  <meta property="og:description" content="${page.seo_description || ''}">
  ${page.og_image_url ? `<meta property="og:image" content="${page.og_image_url}">` : ''}
  <meta property="og:type" content="website">
  ${ga4Script}
  ${fbPixelScript}
  ${page.custom_head || ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${page.css_output || ''}
  </style>
</head>
<body>
  ${page.html_output || ''}
  <!-- Affiliate Disclosure -->
  <div style="text-align:center;padding:20px;font-size:12px;color:#888;border-top:1px solid #eee;margin-top:40px;">
    <p>This page contains affiliate links. We may earn a commission if you make a purchase through our links, at no extra cost to you.</p>
    ${physicalAddress ? `<p style="margin-top:8px;">${physicalAddress}</p>` : ''}
  </div>
  ${trackingScript}
  ${page.custom_body || ''}
</body>
</html>`;

  return html;
}


module.exports = { generatePublishedHTML, generateBlogHTML, generateBlogIndexHTML };

function generateBlogHTML(post) {
  const ga4Id = getSettingSync('default_ga4_id') || '';
  const physicalAddress = getSettingSync('physical_address') || '';
  const r2PublicUrl = getSettingSync('r2_public_url') || '';

  const ga4Script = ga4Id ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4Id}');
    </script>` : '';

  const publishDate = post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString();
  const displayDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seo_title || post.title,
    "description": post.seo_description || post.excerpt || '',
    "datePublished": publishDate,
    "dateModified": new Date(post.updated_at).toISOString(),
    ...(post.featured_image ? { "image": post.featured_image } : {}),
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.seo_title || post.title}</title>
  <meta name="description" content="${(post.seo_description || post.excerpt || '').replace(/"/g, '&quot;')}">
  ${post.seo_keyword ? `<meta name="keywords" content="${post.seo_keyword}">` : ''}
  <meta property="og:type" content="article">
  <meta property="og:title" content="${post.seo_title || post.title}">
  <meta property="og:description" content="${post.seo_description || post.excerpt || ''}">
  ${post.featured_image ? `<meta property="og:image" content="${post.featured_image}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.seo_title || post.title}">
  <meta name="twitter:description" content="${post.seo_description || post.excerpt || ''}">
  ${post.featured_image ? `<meta name="twitter:image" content="${post.featured_image}">` : ''}
  <link rel="canonical" href="${r2PublicUrl}/blog/${post.slug}/index.html">
  <script type="application/ld+json">${jsonLd}</script>
  ${ga4Script}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #333; line-height: 1.8; background: #fff; }
    .blog-container { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
    .blog-header { border-bottom: 3px solid #222; padding-bottom: 16px; margin-bottom: 32px; }
    .blog-title { font-size: 34px; font-weight: 700; line-height: 1.2; color: #111; margin-bottom: 12px; }
    .blog-meta { font-size: 14px; color: #888; }
    .blog-meta span { margin-right: 12px; }
    .blog-category { display: inline-block; background: #e63946; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px; border-radius: 3px; margin-bottom: 12px; font-family: -apple-system, sans-serif; }
    .blog-featured-image { width: 100%; border-radius: 10px; margin-bottom: 32px; }
    .blog-content { font-size: 17px; }
    .blog-content p { margin-bottom: 20px; }
    .blog-content h2 { font-size: 24px; color: #111; margin: 36px 0 16px; }
    .blog-content h3 { font-size: 20px; color: #222; margin: 28px 0 12px; }
    .blog-content a { color: #e63946; text-decoration: underline; }
    .blog-content blockquote { border-left: 4px solid #e63946; padding: 16px 20px; margin: 28px 0; background: #fdf0f0; font-style: italic; border-radius: 0 8px 8px 0; }
    .blog-content img { max-width: 100%; border-radius: 8px; margin: 20px 0; }
    .blog-content ul, .blog-content ol { padding-left: 24px; margin-bottom: 20px; }
    .blog-content li { margin-bottom: 8px; }
    .blog-footer { text-align: center; padding: 24px; font-size: 12px; color: #888; border-top: 1px solid #eee; margin-top: 48px; font-family: -apple-system, sans-serif; }
  </style>
</head>
<body>
  <article class="blog-container">
    <header class="blog-header">
      ${post.category ? `<span class="blog-category">${post.category}</span>` : ''}
      <h1 class="blog-title">${post.title}</h1>
      <div class="blog-meta">
        <span>${displayDate}</span>
        ${post.category ? `<span>· ${post.category}</span>` : ''}
      </div>
    </header>
    ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-featured-image">` : ''}
    <div class="blog-content">
      ${post.content_html || ''}
    </div>
  </article>
  <div class="blog-footer">
    <p>This page contains affiliate links. We may earn a commission if you make a purchase through our links, at no extra cost to you.</p>
    ${physicalAddress ? `<p style="margin-top:8px;">${physicalAddress}</p>` : ''}
  </div>
</body>
</html>`;
}

function generateBlogIndexHTML(posts) {
  const ga4Id = getSettingSync('default_ga4_id') || '';
  const r2PublicUrl = getSettingSync('r2_public_url') || '';

  const ga4Script = ga4Id ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${ga4Id}');
    </script>` : '';

  const postCards = posts.map(p => {
    const date = p.published_at
      ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    return `
        <a href="${r2PublicUrl}/blog/${p.slug}/index.html" style="text-decoration:none;color:inherit;" class="blog-card">
          ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" class="blog-card-image">` : '<div class="blog-card-image-placeholder"></div>'}
          <div class="blog-card-body">
            ${p.category ? `<span class="blog-card-category">${p.category}</span>` : ''}
            <h2 class="blog-card-title">${p.title}</h2>
            <p class="blog-card-excerpt">${p.excerpt || ''}</p>
            <span class="blog-card-date">${date}</span>
          </div>
        </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
  <meta name="description" content="Read our latest articles and tips.">
  ${ga4Script}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background: #f9fafb; }
    .blog-index { max-width: 1080px; margin: 0 auto; padding: 48px 24px; }
    .blog-index-header { text-align: center; margin-bottom: 48px; }
    .blog-index-header h1 { font-size: 36px; font-weight: 800; color: #111; }
    .blog-index-header p { font-size: 16px; color: #666; margin-top: 8px; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .blog-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; display: block; }
    .blog-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .blog-card-image { width: 100%; height: 200px; object-fit: cover; }
    .blog-card-image-placeholder { width: 100%; height: 200px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); }
    .blog-card-body { padding: 20px; }
    .blog-card-category { display: inline-block; background: #e63946; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 2px 8px; border-radius: 3px; margin-bottom: 8px; }
    .blog-card-title { font-size: 18px; font-weight: 700; color: #111; line-height: 1.3; margin-bottom: 8px; }
    .blog-card-excerpt { font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .blog-card-date { font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="blog-index">
    <div class="blog-index-header">
      <h1>Blog</h1>
      <p>Latest articles and tips</p>
    </div>
    <div class="blog-grid">
      ${postCards}
    </div>
  </div>
</body>
</html>`;
}
