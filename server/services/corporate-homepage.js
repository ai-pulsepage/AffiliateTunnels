/**
 * Corporate Homepage — dealfindai.com root domain
 * Static editorial marketing agency page with partnership contact form
 */

function generateCorporateHomepage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DealFindAI — Editorial Marketing Agency</title>
<meta name="description" content="We review products, create data-driven guides, and build audiences. Partner with us to get your products in front of the right buyers.">
<meta property="og:title" content="DealFindAI — Editorial Marketing Agency">
<meta property="og:description" content="We review products, create guides, and build engaged audiences.">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DealFindAI",
  "url": "https://dealfindai.com",
  "description": "Editorial marketing agency specializing in product reviews, content creation, and audience building.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Partnership Inquiries",
    "url": "https://dealfindai.com"
  }
}
</script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0a1a;color:#e2e8f0;line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:#818cf8}

/* Hero */
.hero{padding:120px 24px 80px;text-align:center;background:linear-gradient(180deg,#0f0f2e 0%,#0a0a1a 100%);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%);pointer-events:none}
.hero h1{font-size:clamp(32px,5vw,56px);font-weight:900;line-height:1.1;color:#fff;margin-bottom:20px;letter-spacing:-0.03em}
.hero h1 span{background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:18px;color:#94a3b8;max-width:600px;margin:0 auto;line-height:1.6}
.hero-cta{margin-top:40px;display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.hero-cta a{display:inline-block;padding:16px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;transition:all .3s}
.hero-cta .primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 24px rgba(99,102,241,0.4)}
.hero-cta .primary:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(99,102,241,0.5)}
.hero-cta .secondary{border:1px solid rgba(255,255,255,0.15);color:#e2e8f0}
.hero-cta .secondary:hover{background:rgba(255,255,255,0.05)}

/* Sections */
.section{padding:80px 24px}
.container{max-width:1080px;margin:0 auto}
.section-title{font-size:28px;font-weight:800;color:#fff;text-align:center;margin-bottom:12px}
.section-subtitle{font-size:15px;color:#94a3b8;text-align:center;margin-bottom:48px;max-width:600px;margin-left:auto;margin-right:auto}

/* Services Grid */
.services{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.service-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:32px;transition:all .3s}
.service-card:hover{border-color:rgba(99,102,241,0.3);transform:translateY(-4px)}
.service-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:24px}
.service-card h3{font-size:18px;font-weight:700;color:#fff;margin-bottom:8px}
.service-card p{font-size:14px;color:#94a3b8;line-height:1.6}

/* Contact Form */
.contact{background:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.contact-form{display:flex;flex-direction:column;gap:12px}
.contact-form input,.contact-form textarea{width:100%;padding:14px 18px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;outline:none;transition:border-color .3s}
.contact-form input:focus,.contact-form textarea:focus{border-color:#6366f1}
.contact-form textarea{resize:vertical;min-height:100px}
.contact-form label{display:flex;align-items:flex-start;gap:8px;font-size:12px;color:#64748b;cursor:pointer}
.contact-form label input[type="checkbox"]{margin-top:2px;accent-color:#6366f1}
.contact-form button{padding:14px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;transition:all .3s}
.contact-form button:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(99,102,241,0.4)}

/* Footer */
footer{text-align:center;padding:40px 24px;color:#475569;font-size:13px;border-top:1px solid rgba(255,255,255,0.06)}

@media(max-width:768px){
  .contact-grid{grid-template-columns:1fr}
  .services{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- Hero -->
<section class="hero">
    <div class="container">
        <h1>We Build <span>Audiences</span><br>That Buy</h1>
        <p>DealFindAI is an editorial marketing agency. We review high-value products, create data-driven content, and connect manufacturers with engaged buyers.</p>
        <div class="hero-cta">
            <a href="#contact" class="primary">Partner With Us</a>
            <a href="#services" class="secondary">What We Do</a>
        </div>
    </div>
</section>

<!-- Services -->
<section class="section" id="services">
    <div class="container">
        <h2 class="section-title">What We Do</h2>
        <p class="section-subtitle">We combine editorial expertise with AI-powered tools to create content that drives real purchase decisions.</p>
        <div class="services">
            <div class="service-card">
                <div class="service-icon" style="background:rgba(99,102,241,0.15)">📝</div>
                <h3>Product Reviews</h3>
                <p>In-depth, honest reviews of high-value products. We test, compare, and recommend — building trust with buyers and driving conversions for brands.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background:rgba(168,85,247,0.15)">📊</div>
                <h3>Content & Guides</h3>
                <p>SEO-optimized blog posts, buying guides, and educational content that attracts organic traffic and positions your product as the top choice.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background:rgba(34,211,238,0.15)">🎯</div>
                <h3>Audience Building</h3>
                <p>Category-specific email lists of engaged buyers. We nurture audiences through drip campaigns and blog notifications — ready to convert.</p>
            </div>
        </div>
    </div>
</section>

<!-- Why Partner -->
<section class="section">
    <div class="container">
        <h2 class="section-title">Why Brands Partner With Us</h2>
        <p class="section-subtitle">We don't just generate traffic. We build trust, educate buyers, and drive high-intent purchase decisions.</p>
        <div class="services">
            <div class="service-card">
                <div class="service-icon" style="background:rgba(16,185,129,0.15)">🌐</div>
                <h3>Dedicated Microsites</h3>
                <p>Your product gets its own branded subdomain with product showcases, blog content, and email opt-ins — a complete sales ecosystem.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background:rgba(245,158,11,0.15)">🤖</div>
                <h3>AI-Powered Content</h3>
                <p>Our AI content engine produces SEO-optimized articles, product comparisons, and buying guides — consistently and at scale.</p>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background:rgba(239,68,68,0.15)">📈</div>
                <h3>Performance Tracking</h3>
                <p>Full analytics on page views, subscriber growth, email engagement, and conversion metrics so you see exactly what's working.</p>
            </div>
        </div>
    </div>
</section>

<!-- Contact -->
<section class="section contact" id="contact">
    <div class="container">
        <div class="contact-grid">
            <div>
                <h2 style="font-size:28px;font-weight:800;color:#fff;margin-bottom:12px">Want Us to Review Your Product?</h2>
                <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin-bottom:16px">Whether you're a manufacturer, brand, or distributor — we'd love to hear from you. Tell us about your product and we'll explore how we can build its audience.</p>
                <ul style="list-style:none;color:#94a3b8;font-size:14px;margin-top:20px">
                    <li style="margin-bottom:8px">✓ Dedicated product reviews on our network</li>
                    <li style="margin-bottom:8px">✓ SEO-optimized content driving organic traffic</li>
                    <li style="margin-bottom:8px">✓ Email marketing to engaged category audiences</li>
                    <li>✓ Full performance reporting and analytics</li>
                </ul>
            </div>
            <div>
                <form id="contact-form" class="contact-form">
                    <input type="text" id="contact-name" placeholder="Your name" required>
                    <input type="email" id="contact-email" placeholder="Your email" required>
                    <input type="text" id="contact-company" placeholder="Company / Brand name">
                    <textarea id="contact-message" placeholder="Tell us about your product..." rows="4"></textarea>
                    <label>
                        <input type="checkbox" id="contact-consent" required>
                        <span>I agree to receive follow-up communications. We never share your email with anyone.</span>
                    </label>
                    <button type="submit" id="contact-btn">Send Partnership Inquiry</button>
                    <p id="contact-success" style="display:none;color:#818cf8;font-weight:600;text-align:center;margin-top:8px">✓ Thanks! We'll be in touch soon.</p>
                </form>
            </div>
        </div>
    </div>
</section>

<footer>
    <div class="container">
        <p>© ${new Date().getFullYear()} DealFindAI. All rights reserved.</p>
    </div>
</footer>

<script>
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = document.getElementById('contact-btn');
    btn.textContent = 'Sending...'; btn.disabled = true;
    fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: document.getElementById('contact-email').value,
            name: document.getElementById('contact-name').value,
            company: document.getElementById('contact-company').value,
            message: document.getElementById('contact-message').value,
            source: 'corporate'
        })
    }).then(function(r) { return r.json(); })
    .then(function() {
        document.getElementById('contact-form').style.display = 'none';
        document.getElementById('contact-success').style.display = 'block';
    }).catch(function() { btn.textContent = 'Try again'; btn.disabled = false; });
});
</script>
</body>
</html>`;
}

module.exports = { generateCorporateHomepage };
