/**
 * GrapeJS Custom Block Definitions
 * Optimized for ClickBank affiliate funnel pages
 */

export function registerCustomBlocks(editor) {
    const bm = editor.BlockManager;

    // ──────────────────────────────────────────
    // LAYOUT BLOCKS
    // ──────────────────────────────────────────
    bm.add('section-hero', {
        label: '🎯 Hero Section',
        category: 'Layout',
        content: `
      <section style="padding: 80px 24px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="font-size: 48px; font-weight: 800; color: #fff; margin-bottom: 16px; line-height: 1.1;">
            Your Compelling Headline Goes Here
          </h1>
          <p style="font-size: 20px; color: #94a3b8; margin-bottom: 32px; line-height: 1.6;">
            A powerful subheadline that explains the value proposition and creates curiosity.
          </p>
          <a href="#" style="display: inline-block; padding: 16px 40px; background: #6366f1; color: #fff; font-size: 18px; font-weight: 700; border-radius: 12px; text-decoration: none; transition: all 0.2s;">
            Get Started Now →
          </a>
        </div>
      </section>
    `,
    });

    bm.add('two-columns', {
        label: '◧ Two Columns',
        category: 'Layout',
        content: `
      <div style="display: flex; gap: 32px; padding: 40px 24px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 300px; padding: 20px;">
          <h2 style="font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px;">Left Column</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Add your content here. This is a flexible two-column layout.</p>
        </div>
        <div style="flex: 1; min-width: 300px; padding: 20px;">
          <h2 style="font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 12px;">Right Column</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Add your content here. Both columns are responsive and stack on mobile.</p>
        </div>
      </div>
    `,
    });

    bm.add('three-columns', {
        label: '◫ Three Columns',
        category: 'Layout',
        content: `
      <div style="display: flex; gap: 24px; padding: 40px 24px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px;">Feature One</h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Description of the first feature or benefit.</p>
        </div>
        <div style="flex: 1; min-width: 250px; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px;">Feature Two</h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Description of the second feature or benefit.</p>
        </div>
        <div style="flex: 1; min-width: 250px; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 8px;">Feature Three</h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Description of the third feature or benefit.</p>
        </div>
      </div>
    `,
    });

    bm.add('divider', {
        label: '── Divider',
        category: 'Layout',
        content: `<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 40px auto; max-width: 1100px;" />`,
    });

    bm.add('spacer', {
        label: '↕ Spacer',
        category: 'Layout',
        content: `<div style="height: 60px;"></div>`,
    });

    // ──────────────────────────────────────────
    // TEXT BLOCKS
    // ──────────────────────────────────────────
    bm.add('heading', {
        label: 'H Heading',
        category: 'Text',
        content: `<h2 style="font-size: 36px; font-weight: 700; color: #fff; max-width: 800px; margin: 24px auto; padding: 0 24px; text-align: center;">Your Headline Here</h2>`,
    });

    bm.add('subheading', {
        label: 'h Sub-Heading',
        category: 'Text',
        content: `<h3 style="font-size: 24px; font-weight: 500; color: #94a3b8; max-width: 700px; margin: 16px auto; padding: 0 24px; text-align: center;">Supporting text that adds context</h3>`,
    });

    bm.add('paragraph', {
        label: '¶ Paragraph',
        category: 'Text',
        content: `<p style="font-size: 16px; color: #cbd5e1; line-height: 1.8; max-width: 700px; margin: 16px auto; padding: 0 24px;">Write your body text here. This paragraph block includes comfortable reading width and line spacing optimized for long-form content.</p>`,
    });

    bm.add('bullet-list', {
        label: '• Bullet List',
        category: 'Text',
        content: `
      <ul style="max-width: 600px; margin: 24px auto; padding: 0 24px; list-style: none;">
        <li style="padding: 8px 0; color: #cbd5e1; font-size: 16px; display: flex; align-items: flex-start; gap: 12px;">
          <span style="color: #10b981; font-size: 18px; line-height: 24px;">✓</span>
          <span>First benefit or feature point</span>
        </li>
        <li style="padding: 8px 0; color: #cbd5e1; font-size: 16px; display: flex; align-items: flex-start; gap: 12px;">
          <span style="color: #10b981; font-size: 18px; line-height: 24px;">✓</span>
          <span>Second benefit or feature point</span>
        </li>
        <li style="padding: 8px 0; color: #cbd5e1; font-size: 16px; display: flex; align-items: flex-start; gap: 12px;">
          <span style="color: #10b981; font-size: 18px; line-height: 24px;">✓</span>
          <span>Third benefit or feature point</span>
        </li>
      </ul>
    `,
    });

    // ──────────────────────────────────────────
    // MEDIA BLOCKS
    // ──────────────────────────────────────────
    bm.add('image-block', {
        label: '🖼 Image',
        category: 'Media',
        content: `
      <div style="text-align: center; padding: 24px;">
        <img src="https://placehold.co/800x400/1a1a2e/6366f1?text=Your+Image" alt="Image" style="max-width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);" />
      </div>
    `,
    });

    bm.add('video-embed', {
        label: '▶ Video',
        category: 'Media',
        content: `
      <div style="max-width: 800px; margin: 32px auto; padding: 0 24px;">
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
        </div>
      </div>
    `,
    });

    // ──────────────────────────────────────────
    // CONVERSION BLOCKS
    // ──────────────────────────────────────────
    bm.add('cta-button', {
        label: '🔘 CTA Button',
        category: 'Conversion',
        content: `
      <div style="text-align: center; padding: 32px 24px;">
        <a href="#" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 20px; font-weight: 700; border-radius: 14px; text-decoration: none; box-shadow: 0 8px 24px rgba(99,102,241,0.3); transition: all 0.2s;">
          Click Here To Get Started →
        </a>
        <p style="color: #64748b; font-size: 13px; margin-top: 10px;">🔒 30-Day Money Back Guarantee</p>
      </div>
    `,
    });

    bm.add('optin-form', {
        label: '📧 Opt-in Form',
        category: 'Conversion',
        content: `
      <div style="max-width: 480px; margin: 40px auto; padding: 40px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
        <h3 style="font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 8px;">Get Your Free Guide</h3>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Enter your email below to get instant access.</p>
        <form data-at-form="optin" style="display: flex; flex-direction: column; gap: 12px;">
          <input type="text" name="name" placeholder="Your Name" style="width: 100%; padding: 14px 18px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; box-sizing: border-box;" />
          <input type="email" name="email" placeholder="Your Best Email" required style="width: 100%; padding: 14px 18px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 15px; box-sizing: border-box;" />
          <button type="submit" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 17px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;">
            Yes! Send Me The Guide →
          </button>
        </form>
        <p style="color: #475569; font-size: 11px; margin-top: 12px;">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    `,
    });

    bm.add('countdown-timer', {
        label: '⏱ Countdown',
        category: 'Conversion',
        content: `
      <div style="text-align: center; padding: 40px 24px; background: linear-gradient(135deg, #1e1b4b, #312e81); margin: 24px 0;">
        <p style="color: #c4b5fd; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">⚡ Limited Time Offer</p>
        <div data-at-countdown="true" data-at-minutes="30" style="display: flex; justify-content: center; gap: 16px;">
          <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px 20px; min-width: 70px;">
            <span data-at-countdown-hours style="display: block; font-size: 36px; font-weight: 800; color: #fff;">00</span>
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Hours</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px 20px; min-width: 70px;">
            <span data-at-countdown-minutes style="display: block; font-size: 36px; font-weight: 800; color: #fff;">30</span>
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Minutes</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px 20px; min-width: 70px;">
            <span data-at-countdown-seconds style="display: block; font-size: 36px; font-weight: 800; color: #fff;">00</span>
            <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Seconds</span>
          </div>
        </div>
      </div>
    `,
    });

    bm.add('sticky-cta', {
        label: '📌 Sticky CTA',
        category: 'Conversion',
        content: `
      <div data-at-sticky="true" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15,15,18,0.95); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; z-index: 1000; text-align: center;">
        <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <p style="color: #fff; font-size: 15px; font-weight: 600; margin: 0;">🔥 Don't miss out — this offer expires soon!</p>
          <a href="#" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; font-weight: 700; border-radius: 10px; text-decoration: none; white-space: nowrap;">
            Claim Your Spot →
          </a>
        </div>
      </div>
    `,
    });

    bm.add('exit-intent', {
        label: '🚪 Exit Popup',
        category: 'Conversion',
        content: `
      <div data-at-exit-intent="true" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center;">
        <div style="background: #1e1e2e; border-radius: 20px; padding: 48px; max-width: 480px; width: 90%; text-align: center; position: relative; border: 1px solid rgba(255,255,255,0.08);">
          <button onclick="this.closest('[data-at-exit-intent]').style.display='none'" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer;">×</button>
          <h2 style="font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px;">Wait! Don't Leave Yet 🛑</h2>
          <p style="color: #94a3b8; font-size: 15px; margin-bottom: 24px;">We have a special offer just for you.</p>
          <a href="#" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font-size: 18px; font-weight: 700; border-radius: 12px; text-decoration: none;">
            Get 50% Off Now →
          </a>
          <p style="color: #475569; font-size: 12px; margin-top: 16px; cursor: pointer;" onclick="this.closest('[data-at-exit-intent]').style.display='none'">No thanks, I'll pass</p>
        </div>
      </div>
    `,
    });

    // ──────────────────────────────────────────
    // SOCIAL PROOF BLOCKS
    // ──────────────────────────────────────────
    bm.add('testimonial', {
        label: '💬 Testimonial',
        category: 'Social Proof',
        content: `
      <div style="max-width: 600px; margin: 32px auto; padding: 32px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
        <div style="display: flex; gap: 4px; margin-bottom: 16px;">
          <span style="color: #fbbf24; font-size: 18px;">★</span>
          <span style="color: #fbbf24; font-size: 18px;">★</span>
          <span style="color: #fbbf24; font-size: 18px;">★</span>
          <span style="color: #fbbf24; font-size: 18px;">★</span>
          <span style="color: #fbbf24; font-size: 18px;">★</span>
        </div>
        <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; font-style: italic; margin-bottom: 20px;">
          "This product completely changed my results. I went from making nothing to earning consistent commissions within just 2 weeks. Highly recommend!"
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px;">JD</div>
          <div>
            <p style="color: #fff; font-weight: 600; font-size: 14px; margin: 0;">John Doe</p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">Verified Buyer</p>
          </div>
        </div>
      </div>
    `,
    });

    bm.add('testimonial-row', {
        label: '💬💬 Testimonials Row',
        category: 'Social Proof',
        content: `
      <div style="display: flex; gap: 24px; padding: 40px 24px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px; padding: 28px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; gap: 3px; margin-bottom: 12px;">${'<span style="color: #fbbf24; font-size: 16px;">★</span>'.repeat(5)}</div>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; font-style: italic; margin-bottom: 16px;">"Amazing results from day one. Can't recommend enough!"</p>
          <p style="color: #94a3b8; font-size: 13px; font-weight: 500;">— Sarah M.</p>
        </div>
        <div style="flex: 1; min-width: 280px; padding: 28px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; gap: 3px; margin-bottom: 12px;">${'<span style="color: #fbbf24; font-size: 16px;">★</span>'.repeat(5)}</div>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; font-style: italic; margin-bottom: 16px;">"Finally something that actually works. Worth every penny."</p>
          <p style="color: #94a3b8; font-size: 13px; font-weight: 500;">— Mike R.</p>
        </div>
        <div style="flex: 1; min-width: 280px; padding: 28px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; gap: 3px; margin-bottom: 12px;">${'<span style="color: #fbbf24; font-size: 16px;">★</span>'.repeat(5)}</div>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; font-style: italic; margin-bottom: 16px;">"The best investment I've made for my business this year."</p>
          <p style="color: #94a3b8; font-size: 13px; font-weight: 500;">— Lisa K.</p>
        </div>
      </div>
    `,
    });

    // ──────────────────────────────────────────
    // PRICING BLOCKS
    // ──────────────────────────────────────────
    bm.add('pricing-table', {
        label: '💰 Pricing Table',
        category: 'Conversion',
        content: `
      <div style="display: flex; gap: 24px; padding: 48px 24px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; justify-content: center;">
        <div style="flex: 1; min-width: 260px; max-width: 380px; padding: 36px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); text-align: center;">
          <h3 style="font-size: 18px; font-weight: 600; color: #94a3b8; margin-bottom: 8px;">Basic</h3>
          <div style="margin-bottom: 24px;"><span style="font-size: 48px; font-weight: 800; color: #fff;">$27</span><span style="color: #64748b; font-size: 14px;">/one-time</span></div>
          <ul style="list-style: none; padding: 0; margin-bottom: 28px; text-align: left;">
            <li style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">✓ Core features included</li>
            <li style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">✓ Email support</li>
            <li style="padding: 8px 0; color: #475569; font-size: 14px;">✗ Advanced analytics</li>
          </ul>
          <a href="#" style="display: block; padding: 14px; background: rgba(255,255,255,0.08); color: #fff; font-weight: 600; border-radius: 10px; text-decoration: none;">Get Basic</a>
        </div>
        <div style="flex: 1; min-width: 260px; max-width: 380px; padding: 36px; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-radius: 20px; border: 2px solid #6366f1; text-align: center; position: relative;">
          <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;">BEST VALUE</div>
          <h3 style="font-size: 18px; font-weight: 600; color: #c4b5fd; margin-bottom: 8px;">Premium</h3>
          <div style="margin-bottom: 24px;"><span style="font-size: 48px; font-weight: 800; color: #fff;">$47</span><span style="color: #64748b; font-size: 14px;">/one-time</span></div>
          <ul style="list-style: none; padding: 0; margin-bottom: 28px; text-align: left;">
            <li style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">✓ Everything in Basic</li>
            <li style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">✓ Advanced analytics</li>
            <li style="padding: 8px 0; color: #cbd5e1; font-size: 14px;">✓ Priority support</li>
          </ul>
          <a href="#" style="display: block; padding: 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700; border-radius: 10px; text-decoration: none;">Get Premium →</a>
        </div>
      </div>
    `,
    });

    // ──────────────────────────────────────────
    // COMPLIANCE BLOCKS
    // ──────────────────────────────────────────
    bm.add('affiliate-disclosure', {
        label: '⚖ Affiliate Disclosure',
        category: 'Compliance',
        content: `
      <div style="max-width: 800px; margin: 32px auto; padding: 20px 24px; background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15); border-radius: 12px;">
        <p style="color: #fbbf24; font-size: 12px; font-weight: 600; margin-bottom: 4px;">AFFILIATE DISCLOSURE</p>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
          This page contains affiliate links. If you click on a link and make a purchase, I may receive a commission at no additional cost to you. I only recommend products I genuinely believe in. Results may vary and testimonials are not claimed to represent typical results. Please do your own due diligence.
        </p>
      </div>
    `,
    });

    bm.add('income-disclaimer', {
        label: '📋 Income Disclaimer',
        category: 'Compliance',
        content: `
      <div style="max-width: 800px; margin: 32px auto; padding: 20px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;">
        <p style="color: #64748b; font-size: 12px; font-weight: 600; margin-bottom: 4px;">INCOME DISCLAIMER</p>
        <p style="color: #64748b; font-size: 11px; line-height: 1.6; margin: 0;">
          The income figures stated on this page are our personal results and those of our students. Please understand these results are not typical. We're not implying you'll duplicate them. The average person who buys "how to" information gets little to no results. We're using these references for example purposes only. Your results will vary and depend on many factors including but not limited to your background, experience, and work ethic.
        </p>
      </div>
    `,
    });

    bm.add('footer', {
        label: '🦶 Footer',
        category: 'Compliance',
        content: `
      <footer style="padding: 40px 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; margin-top: 60px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <p style="color: #475569; font-size: 12px; line-height: 1.8;">
            © ${new Date().getFullYear()} Your Company Name. All Rights Reserved.<br />
            <a href="/privacy" style="color: #6366f1; text-decoration: none;">Privacy Policy</a> · 
            <a href="/terms" style="color: #6366f1; text-decoration: none;">Terms of Service</a> · 
            <a href="/disclaimer" style="color: #6366f1; text-decoration: none;">Disclaimer</a>
          </p>
          <p style="color: #334155; font-size: 11px; margin-top: 8px;">
            This site is not a part of the Facebook™ website or Facebook™ Inc.<br />
            Additionally, this site is NOT endorsed by Facebook™ in any way.<br />
            ClickBank is a registered trademark of Click Sales, Inc.
          </p>
        </div>
      </footer>
    `,
    });

    // ──────────────────────────────────────────
    // BONUS / BRIDGE PAGE BLOCKS
    // ──────────────────────────────────────────
    bm.add('bonus-box', {
        label: '🎁 Bonus Box',
        category: 'Social Proof',
        content: `
      <div style="max-width: 600px; margin: 24px auto; padding: 28px; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02)); border-radius: 16px; border: 1px solid rgba(16,185,129,0.2);">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="min-width: 50px; height: 50px; background: rgba(16,185,129,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎁</div>
          <div>
            <p style="color: #10b981; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">EXCLUSIVE BONUS</p>
            <h4 style="font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 6px;">Bonus #1: Quick-Start Guide</h4>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 4px;">Get started in under 10 minutes with our step-by-step guide that walks you through everything.</p>
            <p style="color: #10b981; font-size: 14px; font-weight: 600;">Value: $97 — FREE with your purchase</p>
          </div>
        </div>
      </div>
    `,
    });

    bm.add('urgency-banner', {
        label: '🔥 Urgency Banner',
        category: 'Conversion',
        content: `
      <div style="background: linear-gradient(90deg, #dc2626, #ef4444); padding: 12px 24px; text-align: center;">
        <p style="color: #fff; font-size: 15px; font-weight: 700; margin: 0;">
          ⚠️ WARNING: This special pricing won't last. Only <span style="text-decoration: underline;">37 spots</span> remaining at this price!
        </p>
      </div>
    `,
    });

    bm.add('guarantee-badge', {
        label: '🛡 Guarantee',
        category: 'Conversion',
        content: `
      <div style="text-align: center; padding: 48px 24px;">
        <div style="display: inline-block; padding: 32px 40px; border: 3px solid rgba(16,185,129,0.3); border-radius: 20px; background: rgba(16,185,129,0.05);">
          <div style="font-size: 48px; margin-bottom: 8px;">🛡️</div>
          <h3 style="font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px;">60-Day Money-Back Guarantee</h3>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; max-width: 350px;">Try it risk-free. If you're not 100% satisfied within 60 days, we'll refund every penny. No questions asked.</p>
        </div>
      </div>
    `,
    });

    bm.add('faq-section', {
        label: '❓ FAQ',
        category: 'Social Proof',
        content: `
      <div style="max-width: 700px; margin: 48px auto; padding: 0 24px;">
        <h2 style="font-size: 32px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 32px;">Frequently Asked Questions</h2>
        <div style="border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
          <details style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <summary style="padding: 20px 24px; color: #fff; font-weight: 600; font-size: 15px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
              How quickly will I see results?
            </summary>
            <div style="padding: 0 24px 20px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Most users start seeing initial results within the first week. However, significant results typically come within 2-4 weeks of consistent use.
            </div>
          </details>
          <details style="border-bottom: 1px solid rgba(255,255,255,0.06);">
            <summary style="padding: 20px 24px; color: #fff; font-weight: 600; font-size: 15px; cursor: pointer; list-style: none;">
              Is there a money-back guarantee?
            </summary>
            <div style="padding: 0 24px 20px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Yes! We offer a 60-day no-questions-asked money-back guarantee. If you're not satisfied, simply reach out for a full refund.
            </div>
          </details>
          <details>
            <summary style="padding: 20px 24px; color: #fff; font-weight: 600; font-size: 15px; cursor: pointer; list-style: none;">
              Do I need any prior experience?
            </summary>
            <div style="padding: 0 24px 20px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Not at all! This is designed for complete beginners. Our step-by-step approach makes it easy for anyone to get started.
            </div>
          </details>
        </div>
      </div>
    `,
    });
}

/**
 * Custom GrapeJS style manager configuration
 */
export const styleManagerConfig = {
    sectors: [
        {
            name: 'Dimension',
            open: false,
            properties: [
                'width', 'min-width', 'max-width',
                'height', 'min-height', 'max-height',
                'padding', 'margin',
            ],
        },
        {
            name: 'Typography',
            open: false,
            properties: [
                'font-family', 'font-size', 'font-weight', 'letter-spacing',
                'color', 'line-height', 'text-align', 'text-decoration',
                'text-transform',
            ],
        },
        {
            name: 'Background',
            open: false,
            properties: [
                'background-color', 'background-image', 'background-repeat',
                'background-position', 'background-size',
            ],
        },
        {
            name: 'Border',
            open: false,
            properties: [
                'border-radius', 'border', 'box-shadow',
            ],
        },
        {
            name: 'Layout',
            open: false,
            properties: [
                'display', 'flex-direction', 'justify-content', 'align-items',
                'flex-wrap', 'gap', 'position', 'top', 'right', 'bottom', 'left',
                'z-index', 'overflow',
            ],
        },
        {
            name: 'Effects',
            open: false,
            properties: [
                'opacity', 'transition', 'transform', 'filter',
            ],
        },
    ],
};

/**
 * Default canvas styles injected into every page iframe
 */
export const canvasStyles = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #0f0f12;
    color: #e2e8f0;
    -webkit-font-smoothing: antialiased;
  }
  a { color: #6366f1; }
  img { max-width: 100%; height: auto; }
  details summary::-webkit-details-marker { display: none; }
  details summary::marker { display: none; }

  @media (max-width: 768px) {
    h1 { font-size: 32px !important; }
    h2 { font-size: 24px !important; }
    [style*="display: flex"] { flex-direction: column !important; }
  }
`;
