const AFFILIATE_LINK = 'https://hop.clickbank.net/?affiliate=gabeseba&vendor=tedsplans&cbpage=optin';

// These are the exact blocks that match the TemplateEditor block format.
// The user can use "AI Generate" in the UI with style "blog_post"
// and paste this product info, or use these blocks directly.

const blocks = [
    // Category tag
    {
        type: 'text',
        html: '<p style="font-size:13px;font-weight:600;color:#b45309;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">DIY WOODWORKING</p>'
    },
    // Title
    {
        type: 'heading',
        html: '<h1 style="font-size:34px;font-weight:800;line-height:1.25;color:#111;margin:0 0 12px;">I Found 16,000 Woodworking Plans in One Place — Here\'s Why I Stopped Searching Pinterest for Free Plans</h1>'
    },
    // Date line
    {
        type: 'text',
        html: `<p style="font-size:14px;color:#888;margin:0 0 24px;">Updated February 2026 · 6 min read</p>`
    },
    // Hero image placeholder
    {
        type: 'image',
        html: '<div data-media-slot="hero" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:10px;margin:0 0 28px;min-height:220px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add featured woodworking image</span></div>'
    },
    // Intro
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><p>If you\'re anything like me, you\'ve spent <strong>hours scrolling through Pinterest</strong> looking for woodworking plans. You find something that looks good, click through, and it\'s either a dead link, a blurry sketch with no measurements, or a "plan" that\'s really just a photo of someone else\'s finished project.</p><p style="margin-top:16px;">Sound familiar? I was stuck in that cycle for months — saving hundreds of pins but never actually <em>building</em> anything because I couldn\'t find a complete, reliable plan.</p><p style="margin-top:16px;">Then a friend in my woodworking group told me about a collection of <strong>16,000 step-by-step plans</strong> created by a master craftsman named Ted McGrath. I was skeptical at first. Sixteen thousand? That sounded too good to be true.</p><p style="margin-top:16px;">But after trying it, I realized <strong>this changes everything</strong> for hobbyist woodworkers. Here\'s what I discovered.</p></div>`
    },
    // Section: The Problem
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><h2 style="font-size:24px;color:#111;margin:36px 0 16px;">The Problem With "Free" Woodworking Plans Online</h2><p>Don\'t get me wrong — there are some great free plans out there. But after wasting three perfectly good pieces of oak on a bookshelf plan that had <strong>wrong measurements</strong>, I learned the hard way:</p><ul style="padding-left:24px;margin:16px 0;"><li style="margin-bottom:10px;">Most free plans are <strong>incomplete</strong> — missing cut lists, materials lists, or actual dimensions</li><li style="margin-bottom:10px;">Measurements are often <strong>inaccurate</strong>, leading to wasted wood and frustration</li><li style="margin-bottom:10px;">There\'s <strong>no consistency</strong> — every plan uses a different format and skill level</li><li style="margin-bottom:10px;">You end up spending more time <strong>searching</strong> for plans than actually <strong>building</strong></li></ul></div>`
    },
    // Image: supporting
    {
        type: 'image',
        html: '<div data-media-slot="mid" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:10px;margin:16px 0;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add woodworking project image</span></div>'
    },
    // Section: What's Different
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><h2 style="font-size:24px;color:#111;margin:36px 0 16px;">What Makes TedsWoodworking Different</h2><p>What blew me away about Ted\'s collection wasn\'t just the sheer number of plans — it\'s the <strong>quality and detail</strong> in every single one:</p></div>`
    },
    // Benefits list
    {
        type: 'list',
        html: `<ul style="padding-left:24px;font-size:17px;color:#444;line-height:2;"><li style="margin-bottom:8px;">✅ <strong>16,000+ plans</strong> covering furniture, sheds, outdoor projects, cabinets, toys, and more</li><li style="margin-bottom:8px;">✅ <strong>Step-by-step instructions</strong> with clear, numbered steps anyone can follow</li><li style="margin-bottom:8px;">✅ <strong>Detailed cut lists</strong> so you know exactly what lumber to buy</li><li style="margin-bottom:8px;">✅ <strong>Complete materials lists</strong> — no more guessing at the hardware store</li><li style="margin-bottom:8px;">✅ <strong>3D exploded diagrams</strong> showing exactly how every piece fits together</li><li style="margin-bottom:8px;">✅ Plans for <strong>every skill level</strong> — from total beginner to advanced</li><li style="margin-bottom:8px;">✅ <strong>150+ instructional videos</strong> included as bonuses</li></ul>`
    },
    // Quote
    {
        type: 'quote',
        html: '<blockquote style="border-left:4px solid #b45309;padding:16px 20px;margin:28px 0;background:#fffbeb;font-style:italic;border-radius:0 8px 8px 0;"><p style="margin:0;font-size:16px;color:#555;">"I built my first piece of furniture — a farmhouse dining table — using one of these plans. The 3D diagrams made it so clear, even my wife couldn\'t believe I did it myself."</p><p style="margin:8px 0 0;font-size:13px;color:#888;">— Mark T., weekend woodworker</p></blockquote>'
    },
    // First CTA
    {
        type: 'button',
        html: `<div style="background:linear-gradient(135deg,#b45309,#92400e);border-radius:12px;padding:32px;text-align:center;margin:32px 0;"><p style="font-size:18px;color:#fff;font-weight:700;margin:0 0 8px;">🪵 Want to See the Full Collection?</p><p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 16px;">Get access to 50 FREE woodworking plans to start with.</p><a href="${AFFILIATE_LINK}" style="display:inline-block;padding:14px 44px;background:#fff;color:#92400e;font-size:16px;font-weight:700;border-radius:8px;text-decoration:none;">Get 50 FREE Plans →</a></div>`
    },
    // Section: Who It's For
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><h2 style="font-size:24px;color:#111;margin:36px 0 16px;">Who Is This For?</h2><p>What I love about this collection is that it truly covers <strong>every level of experience</strong>:</p><ul style="padding-left:24px;margin:16px 0;"><li style="margin-bottom:10px;"><strong>Complete beginners:</strong> Simple projects like birdhouses, shelves, and picture frames with easy-to-follow steps</li><li style="margin-bottom:10px;"><strong>Intermediate builders:</strong> Furniture projects like tables, bed frames, and outdoor benches</li><li style="margin-bottom:10px;"><strong>Advanced woodworkers:</strong> Complex builds like garden sheds, pergolas, gazebos, and multi-piece cabinets</li></ul><p style="margin-top:16px;">Whether you\'re building your first bookshelf or your 50th — there\'s a plan in this collection that\'s perfect for your next project.</p></div>`
    },
    // Section: My Favorite Projects
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><h2 style="font-size:24px;color:#111;margin:36px 0 16px;">5 Projects I\'ve Built So Far</h2><p>Here are some of my favorites from the collection:</p><ol style="padding-left:24px;margin:16px 0;"><li style="margin-bottom:10px;"><strong>Farmhouse Dining Table</strong> — The first thing I built. The plan even told me which wood to buy at Home Depot.</li><li style="margin-bottom:10px;"><strong>10×12 Storage Shed</strong> — Saved over $3,000 compared to a pre-built shed. The cut list was spot-on.</li><li style="margin-bottom:10px;"><strong>Kids\' Bunk Bed</strong> — My daughter picked the design. It took one weekend.</li><li style="margin-bottom:10px;"><strong>Outdoor Adirondack Chairs</strong> — Made a set of 4 for our patio. Neighbors keep asking where I bought them.</li><li style="margin-bottom:10px;"><strong>Kitchen Spice Rack</strong> — A Sunday afternoon project. Perfect for getting started.</li></ol></div>`
    },
    // Image: project showcase
    {
        type: 'image',
        html: '<div data-media-slot="projects" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:10px;margin:16px 0;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add project showcase image</span></div>'
    },
    // Section: Bottom Line
    {
        type: 'text',
        html: `<div style="font-size:17px;line-height:1.8;color:#444;"><h2 style="font-size:24px;color:#111;margin:36px 0 16px;">The Bottom Line</h2><p>I used to spend more time <em>looking</em> for plans than actually building things. Now I just open the collection, find exactly what I need, and get to work.</p><p style="margin-top:16px;">If you\'re tired of incomplete free plans, guessing at measurements, and wasting good wood on bad instructions — <strong>this is worth checking out</strong>.</p><p style="margin-top:16px;">They\'re currently offering <strong>50 free plans</strong> so you can see the quality for yourself before committing to anything. No risk, no credit card required — just grab the plans and start building.</p></div>`
    },
    // Final CTA
    {
        type: 'button',
        html: `<div style="text-align:center;padding:24px;"><a href="${AFFILIATE_LINK}" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#b45309,#92400e);color:#fff;font-size:20px;font-weight:700;border-radius:10px;text-decoration:none;box-shadow:0 4px 20px rgba(180,83,9,0.3);">🪵 Get Your 50 FREE Plans →</a></div>`
    },
    // Disclaimer
    {
        type: 'text',
        html: '<p style="font-size:12px;color:#bbb;text-align:center;margin-top:40px;border-top:1px solid #eee;padding-top:16px;">Disclosure: This article contains affiliate links. If you end up purchasing through my link, I may earn a small commission at no extra cost to you. I only recommend products I genuinely use and believe in.</p>'
    },
];

// Output the full HTML as page blocks
const html = blocks.map((b, i) =>
    `<div data-block-type="${b.type}" data-block-id="teds-${i}">${b.html}</div>`
).join('\n');

require('fs').writeFileSync('./teds_page_output.html', html);
console.log('Page content saved to teds_page_output.html');
console.log(`Generated ${blocks.length} blocks, ${html.length} characters`);
