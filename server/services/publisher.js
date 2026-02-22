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

module.exports = { generatePublishedHTML };
