import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funnelApi, publishApi, aiApi } from '../lib/api';
import MediaPicker from '../components/MediaPicker';
import {
    ArrowLeft, Save, Globe, Sparkles, ToggleLeft, ToggleRight,
    Link2, X, Copy, ExternalLink, Loader2, Type, AlignLeft, Image, Video,
    MousePointerClick, Quote, List, Minus, LayoutTemplate, Mail, Package,
    ChevronUp, ChevronDown, Trash2, Plus, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── BLOCK DEFINITIONS ────────────────────────
const BLOCK_TYPES = [
    { type: 'heading', label: 'Heading', icon: Type, html: '<h2 style="font-size:28px;font-weight:700;color:#111;margin:0 0 12px;">Section Heading</h2>' },
    { type: 'text', label: 'Text', icon: AlignLeft, html: '<p style="font-size:17px;color:#444;line-height:1.7;margin:0 0 16px;">Write your content here. This paragraph supports <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>' },
    { type: 'image', label: 'Image', icon: Image, html: '<div data-media-slot="img" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:8px;margin:16px 0;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add image</span></div>' },
    { type: 'video', label: 'Video', icon: Video, html: '<div data-media-slot="video" style="text-align:center;padding:40px;background:#000;border-radius:8px;margin:16px 0;min-height:300px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>' },
    { type: 'button', label: 'CTA Button', icon: MousePointerClick, html: '<div style="text-align:center;padding:20px;"><a href="#" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#e63946,#d62828);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:18px;">Get Instant Access →</a></div>' },
    { type: 'quote', label: 'Quote', icon: Quote, html: '<blockquote style="border-left:4px solid #e63946;padding:16px 20px;margin:20px 0;background:#fdf0f0;font-style:italic;border-radius:0 8px 8px 0;"><p style="margin:0;font-size:16px;color:#555;">"This product changed my life! I cannot believe the results."</p><p style="margin:8px 0 0;font-size:13px;color:#888;">— Happy Customer</p></blockquote>' },
    { type: 'list', label: 'List', icon: List, html: '<ul style="padding-left:24px;font-size:17px;color:#444;line-height:1.7;"><li style="margin-bottom:8px;">First key benefit</li><li style="margin-bottom:8px;">Second key benefit</li><li style="margin-bottom:8px;">Third key benefit</li></ul>' },
    { type: 'divider', label: 'Divider', icon: Minus, html: '<hr style="border:none;border-top:2px solid #eee;margin:32px 0;">' },
    { type: 'banner', label: 'Banner', icon: LayoutTemplate, html: '<div style="text-align:center;padding:20px;"><a href="#"><img src="" alt="Affiliate Banner" style="max-width:100%;border-radius:8px;border:1px solid #eee;"></a><p style="color:#999;font-size:11px;margin-top:8px;">Click to set banner image + affiliate link</p></div>' },
    { type: 'optin', label: 'Opt-in Form', icon: Mail, html: '<div style="text-align:center;padding:32px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;color:#fff;margin:24px 0;"><h3 style="margin-bottom:8px;">Get Our Free Guide</h3><p style="margin-bottom:16px;opacity:0.9;font-size:14px;">Enter your email to receive exclusive tips.</p><div style="max-width:320px;margin:0 auto;"><input type="email" placeholder="Your email" style="width:100%;padding:12px;border:none;border-radius:6px;margin-bottom:8px;font-size:14px;"><button style="width:100%;padding:12px;background:#e63946;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Send Me The Guide</button></div></div>' },
    { type: 'product', label: 'Product Card', icon: Package, html: '<div style="display:flex;gap:20px;padding:20px;border:2px solid #e63946;border-radius:12px;align-items:center;margin:24px 0;"><img src="" alt="Product" style="width:120px;height:120px;object-fit:cover;border-radius:8px;background:#f5f5f5;"><div><h3 style="margin-bottom:4px;">Product Name</h3><p style="color:#666;font-size:14px;margin-bottom:12px;">Brief description of what this product does.</p><a href="#" style="display:inline-block;padding:10px 24px;background:#e63946;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Learn More →</a></div></div>' },
];

// ─── PAGE TEMPLATES (pre-built block arrangements) ────────────
const PAGE_TEMPLATES = {
    advertorial: {
        name: 'Advertorial',
        desc: 'News article — byline, expert quotes, body text, CTA',
        emoji: '📰',
        traffic: ['native'],
        blocks: (hoplink) => [
            { type: 'text', html: '<div style="background:#f0f0f0;padding:8px;text-align:center;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Advertisement</div>' },
            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#111;margin:0 0 8px;">Breakthrough Discovery Shocks Health Experts</h1>' },
            { type: 'text', html: `<p style="font-size:14px;color:#888;">By Health Desk · Updated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>` },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:8px;margin:16px 0;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add hero image</span></div>' },
            { type: 'text', html: '<p style="font-size:18px;color:#444;line-height:1.8;">Scientists have uncovered a remarkable natural compound that is changing the way millions of people approach their daily health routine. The results have been nothing short of extraordinary.</p>' },
            { type: 'quote', html: '<blockquote style="border-left:4px solid #e63946;padding:16px 20px;margin:28px 0;background:#fdf0f0;font-style:italic;border-radius:0 8px 8px 0;"><p style="margin:0;font-size:16px;color:#555;">"The results we are seeing are truly remarkable. This could change everything."</p><p style="margin:8px 0 0;font-size:13px;color:#888;">— Dr. Sarah Mitchell, Research Director</p></blockquote>' },
            { type: 'text', html: '<div style="font-size:17px;color:#444;line-height:1.8;"><p>For years, researchers have been searching for a natural solution that could support overall wellness without harsh side effects.</p><p style="margin-top:16px;">Now, a small team of scientists has developed a formula that combines ancient botanical wisdom with modern scientific research.</p><h2 style="font-size:22px;color:#222;margin:32px 0 16px;">How Does It Work?</h2><p>The formula works by targeting the root cause rather than just masking symptoms, producing more sustainable results.</p></div>' },
            { type: 'image', html: '<div data-media-slot="mid" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:8px;margin:16px 0;min-height:150px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add image</span></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#e63946,#d62828);border-radius:12px;padding:32px;text-align:center;margin:32px 0;"><p style="font-size:20px;color:#fff;font-weight:700;margin:0 0 8px;">Ready to Experience the Difference?</p><p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 20px;">Join thousands who have already transformed their health.</p><a href="${hoplink}" style="display:inline-block;padding:16px 48px;background:#fff;color:#d62828;font-size:18px;font-weight:700;border-radius:8px;text-decoration:none;">Learn More →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#bbb;text-align:center;margin-top:40px;border-top:1px solid #eee;padding-top:16px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },
    video_presell: {
        name: 'Video Presell',
        desc: 'Hero video with headline, body text, and CTA',
        emoji: '🎬',
        traffic: ['facebook', 'youtube'],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:28px;font-weight:800;text-align:center;line-height:1.3;color:#111;margin:0 0 8px;">Watch: The 30-Second Morning Ritual That Changed Everything</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:16px;color:#666;margin:0 0 24px;">Over 2 million people have already seen this video. Here\'s why it matters.</p>' },
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:40px;background:#000;border-radius:12px;min-height:380px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.7;color:#444;"><p>This short video reveals a surprisingly simple technique that leading health researchers say could be the key to unlocking your body\'s natural potential.</p><p style="margin-top:16px;"><strong>Here\'s what people are saying:</strong></p><ul style="padding-left:20px;"><li style="margin-bottom:8px;">"I noticed a difference within the first week" — Maria T.</li><li style="margin-bottom:8px;">"My energy levels are through the roof" — James K.</li><li style="margin-bottom:8px;">"I wish I had found this sooner" — Linda S.</li></ul></div>' },
            { type: 'button', html: `<div style="background:#111;border-radius:12px;padding:36px;text-align:center;margin:32px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 12px;">Get Instant Access Now</p><p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0 0 20px;">Limited time offer. 60-day money-back guarantee.</p><a href="${hoplink}" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:20px;font-weight:700;border-radius:10px;text-decoration:none;">Yes, I Want This! →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#bbb;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },
    listicle: {
        name: 'Listicle',
        desc: '"7 Reasons Why..." numbered article with CTA',
        emoji: '📝',
        traffic: ['native', 'seo'],
        blocks: (hoplink) => [
            { type: 'text', html: '<p style="font-size:13px;font-weight:600;color:#e63946;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">HEALTH & WELLNESS</p>' },
            { type: 'heading', html: '<h1 style="font-size:30px;font-weight:800;line-height:1.25;color:#111;margin:0 0 16px;">7 Reasons Why Thousands Are Switching to This Natural Solution</h1>' },
            { type: 'text', html: '<p style="font-size:17px;color:#666;margin:0 0 28px;line-height:1.6;">Experts say this little-known natural compound could be the most significant discovery in years.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:20px;background:#f5f5f5;border-radius:10px;margin:0 0 28px;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add hero image</span></div>' },
            { type: 'text', html: '<div style="font-size:17px;line-height:1.7;color:#444;"><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">1. It\'s Backed by Clinical Research</h2><p>Multiple peer-reviewed studies have confirmed the effectiveness of the key ingredients.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">2. No Harsh Side Effects</h2><p>Users report virtually zero negative side effects.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">3. Results in as Little as 2 Weeks</h2><p>Participants reported noticeable improvements within the first 14 days.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">4. 100% Natural Ingredients</h2><p>Every ingredient is sourced from nature and tested for purity.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">5. Easy to Use</h2><p>Just take it once a day — no complicated routines needed.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">6. Affordable</h2><p>Costs a fraction of the price of alternatives with better results.</p><h2 style="font-size:20px;color:#111;margin:28px 0 12px;">7. 60-Day Money-Back Guarantee</h2><p>Try it risk-free. If not satisfied, get a full refund.</p></div>' },
            { type: 'button', html: `<div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:12px;padding:36px;text-align:center;margin:36px 0;"><p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 10px;">Ready to Try It Risk-Free?</p><p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0 0 20px;">Click below to see today's exclusive pricing.</p><a href="${hoplink}" style="display:inline-block;padding:16px 52px;background:#fff;color:#6d28d9;font-size:18px;font-weight:700;border-radius:8px;text-decoration:none;">See Special Pricing →</a></div>` },
            { type: 'text', html: '<p style="font-size:12px;color:#bbb;text-align:center;margin-top:32px;">This is an advertisement. Individual results may vary.</p>' },
        ],
    },
    social_bridge: {
        name: 'Social Bridge',
        desc: 'Short punchy presell for Facebook/TikTok/Instagram traffic',
        emoji: '📱',
        traffic: ['facebook', 'tiktok', 'instagram'],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:32px;font-weight:800;text-align:center;color:#111;line-height:1.2;margin:0 0 16px;">🔥 This Changed EVERYTHING For Me</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:18px;color:#555;margin:0 0 24px;">I was skeptical too. Then I tried it for myself...</p>' },
            { type: 'video', html: '<div data-media-slot="hero" style="text-align:center;padding:60px;background:#000;border-radius:16px;min-height:380px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#666;font-size:16px;">▶ Click to add video</span></div>' },
            { type: 'list', html: '<ul style="padding:24px;font-size:18px;line-height:2;list-style:none;"><li>✅ Works in as little as 7 days</li><li>✅ 100% natural — no side effects</li><li>✅ Over 50,000 happy customers</li><li>✅ 60-day money-back guarantee</li></ul>' },
            { type: 'text', html: '<p style="text-align:center;font-size:17px;color:#444;margin:0 0 8px;"><strong>Don\'t just take my word for it.</strong> See the results for yourself 👇</p>' },
            { type: 'button', html: `<div style="text-align:center;padding:24px;"><a href="${hoplink}" style="display:inline-block;padding:20px 60px;background:linear-gradient(135deg,#e63946,#d62828);color:#fff;font-size:22px;font-weight:800;border-radius:12px;text-decoration:none;box-shadow:0 4px 20px rgba(230,57,70,0.3);">👉 YES, Show Me! →</a></div>` },
            { type: 'text', html: '<p style="text-align:center;font-size:12px;color:#bbb;">Results may vary. This is an advertisement.</p>' },
        ],
    },
    lead_magnet: {
        name: 'Lead Magnet',
        desc: 'Email capture page with value prop and opt-in form',
        emoji: '🎁',
        traffic: ['tiktok', 'instagram', 'facebook'],
        blocks: (hoplink) => [
            { type: 'heading', html: '<h1 style="font-size:30px;font-weight:800;text-align:center;color:#111;line-height:1.3;margin:0 0 12px;">FREE: The Ultimate Guide to [Your Niche]</h1>' },
            { type: 'text', html: '<p style="text-align:center;font-size:17px;color:#666;max-width:540px;margin:0 auto 24px;">Download our step-by-step guide and discover the secrets that experts don\'t want you to know.</p>' },
            { type: 'image', html: '<div data-media-slot="hero" style="text-align:center;padding:30px;background:#f5f5f5;border-radius:12px;margin:0 0 24px;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span style="color:#999;font-size:14px;">Click to add lead magnet cover image</span></div>' },
            { type: 'list', html: '<ul style="padding-left:24px;font-size:16px;line-height:1.8;max-width:480px;margin:0 auto 24px;color:#444;"><li style="margin-bottom:8px;">The #1 mistake 90% of people make</li><li style="margin-bottom:8px;">3 proven strategies that actually work</li><li style="margin-bottom:8px;">Expert tips from industry leaders</li><li style="margin-bottom:8px;">Action plan you can start today</li></ul>' },
            { type: 'optin', html: '<div style="text-align:center;padding:36px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;color:#fff;margin:24px 0;"><h3 style="font-size:22px;margin-bottom:8px;">Get Your Free Copy Now</h3><p style="margin-bottom:20px;opacity:0.9;font-size:15px;">Enter your email and we\'ll send it right over.</p><div style="max-width:360px;margin:0 auto;"><input type="text" placeholder="Your name" style="width:100%;padding:14px;border:none;border-radius:8px;margin-bottom:10px;font-size:15px;"><input type="email" placeholder="Your email address" style="width:100%;padding:14px;border:none;border-radius:8px;margin-bottom:10px;font-size:15px;"><button style="width:100%;padding:16px;background:#e63946;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;">Send Me The Guide →</button></div><p style="font-size:11px;margin-top:12px;opacity:0.7;">We respect your privacy. Unsubscribe anytime.</p></div>' },
        ],
    },
};

// ─── GATE POPUP HTML ──────────────────────────
function gatePopupHtml(funnelId, pageId) {
    return `
<!-- Gate Popup -->
<div id="at-gate-popup" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="background:#fff;border-radius:16px;padding:40px;max-width:440px;width:90%;text-align:center;position:relative;">
    <h2 style="font-size:24px;font-weight:700;color:#111;margin:0 0 8px;">Get the Full Report Free</h2>
    <p style="font-size:15px;color:#666;margin:0 0 24px;">Enter your email below and we'll send you exclusive content and updates.</p>
    <form id="at-gate-form">
      <input type="text" name="name" placeholder="Your name" style="width:100%;padding:14px 16px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px;font-size:15px;box-sizing:border-box;" />
      <input type="email" name="email" placeholder="Your email address" required style="width:100%;padding:14px 16px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;font-size:15px;box-sizing:border-box;" />
      <label style="display:flex;align-items:flex-start;gap:8px;text-align:left;margin-bottom:10px;cursor:pointer;">
        <input type="checkbox" name="consent_offer" checked required style="margin-top:3px;" />
        <span style="font-size:13px;color:#555;">Yes, send me updates about this product</span>
      </label>
      <label style="display:flex;align-items:flex-start;gap:8px;text-align:left;margin-bottom:20px;cursor:pointer;">
        <input type="checkbox" name="consent_marketing" style="margin-top:3px;" />
        <span style="font-size:13px;color:#555;">I'd also like to receive occasional deals and offers</span>
      </label>
      <button type="submit" style="width:100%;padding:16px;background:linear-gradient(135deg,#e63946,#d62828);color:#fff;font-size:16px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">Get Free Access →</button>
    </form>
    <p style="font-size:11px;color:#bbb;margin:16px 0 0;">We never sell your data. Unsubscribe anytime.</p>
    <button id="at-gate-close" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;color:#ccc;cursor:pointer;">✕</button>
  </div>
</div>
<script>
(function(){
  var popup = document.getElementById('at-gate-popup');
  if (!popup) return;
  popup.style.display = 'flex';
  document.getElementById('at-gate-close').onclick = function() { popup.style.display = 'none'; };
  document.getElementById('at-gate-form').onsubmit = function(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var data = { funnel_id: '${funnelId}', page_id: '${pageId}', email: fd.get('email'), name: fd.get('name') || '',
      consent_offer: !!e.target.consent_offer.checked, consent_marketing: !!e.target.consent_marketing.checked };
    fetch('/api/tracking/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function() { popup.style.display = 'none'; })
      .catch(function() { popup.style.display = 'none'; });
  };
})();
</script>`;
}

// ─── EDITOR COMPONENT ─────────────────────────
export default function TemplateEditor() {
    const { funnelId, pageId } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [page, setPage] = useState(null);
    const [funnelPages, setFunnelPages] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [gateEnabled, setGateEnabled] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaBlockIdx, setMediaBlockIdx] = useState(null);
    const [mediaAccept, setMediaAccept] = useState('all');
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTemplates, setShowTemplates] = useState(false);

    // Link editor state
    const [showLinkEditor, setShowLinkEditor] = useState(false);
    const [linkBlockIdx, setLinkBlockIdx] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');

    // AI state
    const [showAi, setShowAi] = useState(false);
    const [aiTab, setAiTab] = useState('generate');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiForm, setAiForm] = useState({ productName: '', productDescription: '', affiliateLink: '', style: 'advertorial', productUrl: '' });

    // Drag state
    const [dragIdx, setDragIdx] = useState(null);
    const [dropIdx, setDropIdx] = useState(null);

    useEffect(() => { loadPage(); }, [funnelId, pageId]);

    function genId() {
        return 'blk_' + Math.random().toString(36).substr(2, 9);
    }

    async function loadPage() {
        try {
            const fData = await funnelApi.get(funnelId);
            setFunnel(fData.funnel);
            const pages = (fData.pages || fData.funnel?.pages || []).sort((a, b) => a.step_order - b.step_order);
            setFunnelPages(pages);
            const pg = pages.find(p => p.id === pageId);
            setPage(pg);

            if (pg?.html_output) {
                parseHtmlToBlocks(pg.html_output);
            } else {
                setShowTemplates(true);
            }
            setAiForm(f => ({ ...f, affiliateLink: fData.funnel.affiliate_link || '' }));
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    // ─── SMART CTA LINK RESOLUTION ────────────
    // Non-final pages link to the next page. Final/offer pages link to the hoplink.
    const ctaLink = useMemo(() => {
        if (!page || !funnelPages.length || !funnel) return '#';
        const sorted = [...funnelPages].sort((a, b) => a.step_order - b.step_order);
        const currentIdx = sorted.findIndex(p => p.id === pageId);
        const isLastPage = currentIdx >= sorted.length - 1;
        const isOfferPage = page.page_type === 'offer';

        if (isLastPage || isOfferPage) {
            return funnel.affiliate_link || '#';
        }
        // Link to next page in funnel
        const nextPage = sorted[currentIdx + 1];
        return `/p/${funnel.slug}/${nextPage.slug}`;
    }, [page, funnelPages, funnel, pageId]);

    const ctaLinkLabel = useMemo(() => {
        if (!ctaLink || ctaLink === '#') return 'Not set';
        if (ctaLink.startsWith('/p/')) {
            const slug = ctaLink.split('/').pop();
            const nextPg = funnelPages.find(p => p.slug === slug);
            return `→ Next: ${nextPg?.name || slug}`;
        }
        return '→ Affiliate link';
    }, [ctaLink, funnelPages]);

    function parseHtmlToBlocks(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const parsed = [];
        for (const child of div.children) {
            if (child.id === 'at-gate-popup' || child.tagName === 'SCRIPT') {
                setGateEnabled(true);
                continue;
            }
            const type = child.getAttribute('data-block-type') || guessBlockType(child);
            parsed.push({
                id: child.getAttribute('data-block-id') || genId(),
                type,
                html: child.getAttribute('data-block-type') ? child.innerHTML : child.outerHTML,
            });
        }
        if (parsed.length > 0) setBlocks(parsed);
    }

    function guessBlockType(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'heading';
        if (tag === 'blockquote') return 'quote';
        if (tag === 'ul' || tag === 'ol') return 'list';
        if (tag === 'hr') return 'divider';
        if (el.querySelector('[data-media-slot]')) return 'image';
        if (el.querySelector('a[style*="background"]')) return 'button';
        if (el.querySelector('input[type="email"]')) return 'optin';
        return 'text';
    }

    function selectTemplate(key) {
        const tpl = PAGE_TEMPLATES[key];
        const newBlocks = tpl.blocks(ctaLink).map(b => ({ ...b, id: genId() }));
        setBlocks(newBlocks);
        setShowTemplates(false);
    }

    function blocksToHtml() {
        let html = blocks.map(b =>
            `<div data-block-type="${b.type}" data-block-id="${b.id}">${b.html}</div>`
        ).join('\n');
        if (gateEnabled) {
            html += gatePopupHtml(funnelId, pageId);
        }
        return html;
    }

    function addBlock(type, afterIndex = -1) {
        const template = BLOCK_TYPES.find(b => b.type === type);
        if (!template) return;
        const newBlock = { id: genId(), type, html: template.html };
        let newIdx;
        setBlocks(prev => {
            const next = [...prev];
            if (afterIndex >= 0) {
                next.splice(afterIndex + 1, 0, newBlock);
                newIdx = afterIndex + 1;
            } else {
                next.push(newBlock);
                newIdx = next.length - 1;
            }
            return next;
        });

        // Auto-open media picker for image/video blocks
        if (type === 'image' || type === 'video') {
            setTimeout(() => {
                const idx = afterIndex >= 0 ? afterIndex + 1 : blocks.length;
                setMediaBlockIdx(idx);
                setMediaAccept('all');
                setShowMediaPicker(true);
            }, 50);
        }
    }

    function moveBlock(idx, dir) {
        setBlocks(prev => {
            const next = [...prev];
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= next.length) return prev;
            [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
            return next;
        });
    }

    function deleteBlock(idx) {
        setBlocks(prev => prev.filter((_, i) => i !== idx));
    }

    function updateBlockHtml(idx, html) {
        setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, html } : b));
    }

    // Drag handlers
    function handleDragStart(e, idx) {
        setDragIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idx.toString());
    }
    function handleDragOver(e, idx) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropIdx(idx);
    }
    function handleDragEnd() {
        setDragIdx(null);
        setDropIdx(null);
    }
    function handleDrop(e, targetIdx) {
        e.preventDefault();
        const fromIdx = dragIdx;
        if (fromIdx === null || fromIdx === targetIdx) { handleDragEnd(); return; }
        setBlocks(prev => {
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(targetIdx > fromIdx ? targetIdx - 1 : targetIdx, 0, moved);
            return next;
        });
        handleDragEnd();
    }

    // Link editor for CTA blocks
    function handleLinkClick(idx) {
        const block = blocks[idx];
        const tmp = document.createElement('div');
        tmp.innerHTML = block.html;
        const link = tmp.querySelector('a');
        setLinkUrl(link?.getAttribute('href') || ctaLink);
        setLinkBlockIdx(idx);
        setShowLinkEditor(true);
    }

    function applyLinkEdit() {
        if (linkBlockIdx === null) return;
        const block = blocks[linkBlockIdx];
        const tmp = document.createElement('div');
        tmp.innerHTML = block.html;
        const links = tmp.querySelectorAll('a');
        links.forEach(a => a.setAttribute('href', linkUrl));
        updateBlockHtml(linkBlockIdx, tmp.innerHTML);
        setShowLinkEditor(false);
        setLinkBlockIdx(null);
    }

    function handleMediaClick(idx) {
        setMediaBlockIdx(idx);
        setMediaAccept('all');
        setShowMediaPicker(true);
    }

    function insertMedia(url, mediaInfo) {
        if (mediaBlockIdx === null) return;
        const block = blocks[mediaBlockIdx];
        let newHtml;
        if (mediaInfo?.mime_type?.startsWith('video/')) {
            newHtml = `<video src="${url}" controls style="width:100%;border-radius:8px;"></video>`;
        } else {
            newHtml = `<img src="${url}" style="width:100%;display:block;border-radius:8px;" alt="">`;
        }
        updateBlockHtml(mediaBlockIdx, newHtml);
        setShowMediaPicker(false);
        setMediaBlockIdx(null);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await funnelApi.updatePage(funnelId, pageId, { html_output: blocksToHtml() });
            toast.success('Saved!');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    async function handlePublish() {
        await handleSave();
        setPublishing(true);
        try {
            const result = await publishApi.publishPage(funnelId, pageId);
            toast.success(`Published! ${result.url || ''}`);
        } catch (err) { toast.error(err.message); }
        finally { setPublishing(false); }
    }

    // ─── AI HANDLERS ──────────────────────────
    async function handleAiGenerate() {
        if (aiTab === 'generate' && (!aiForm.productName || !aiForm.productDescription)) {
            toast.error('Product name and description required');
            return;
        }
        if ((aiTab === 'fromlink' || aiTab === 'clone') && !aiForm.productUrl) {
            toast.error('Paste the URL');
            return;
        }

        setAiGenerating(true);
        try {
            if (aiTab === 'clone') {
                toast('Cloning page and downloading images...');
                const result = await aiApi.clonePage({ url: aiForm.productUrl, hopLink: aiForm.affiliateLink || funnel?.affiliate_link || '' });
                if (result.html) {
                    parseHtmlToBlocks(result.html);
                    setShowAi(false);
                    toast.success(`Page cloned! ${result.stats?.imagesCloned || 0} images downloaded.`);
                }
                return;
            }

            let productInfo = aiForm.productDescription;
            let productName = aiForm.productName;

            if (aiTab === 'fromlink') {
                toast('Scraping product page...');
                const scraped = await aiApi.scrapeProduct(aiForm.productUrl);
                productName = scraped.productName || 'Product';
                productInfo = scraped.description || '';
                setAiForm(f => ({ ...f, productName, productDescription: productInfo, affiliateLink: f.affiliateLink || aiForm.productUrl }));
            }

            const payload = {
                productName: productName || aiForm.productName,
                productDescription: productInfo || aiForm.productDescription,
                affiliateLink: ctaLink || '#',
                style: aiForm.style,
            };

            if (aiTab === 'improve') {
                payload.existingContent = blocksToHtml();
            }

            const result = await aiApi.generatePage(payload);
            if (result.html) {
                parseHtmlToBlocks(result.html);
                setShowAi(false);
                toast.success('AI content generated!');
            }
        } catch (err) { toast.error(err.message); }
        finally { setAiGenerating(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f1117]">
                <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            </div>
        );
    }

    // Font family based on page type
    const isSerif = page?.page_type === 'landing' || page?.page_type === 'bridge';
    const fontStyle = isSerif
        ? { fontFamily: "Georgia, 'Times New Roman', serif", color: '#333', lineHeight: '1.8' }
        : { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#333', lineHeight: '1.7' };

    return (
        <div className="h-screen flex flex-col bg-[#0f1117]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1d27] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/funnels/${funnelId}`)} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <p className="text-sm font-bold text-white">{page?.name || 'Page'}</p>
                        <p className="text-[10px] text-gray-500">{funnel?.name} · {page?.page_type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowTemplates(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                        <LayoutTemplate className="w-3.5 h-3.5" /> Templates
                    </button>
                    <button onClick={() => setShowAi(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Generate
                    </button>
                    <button
                        onClick={() => setGateEnabled(!gateEnabled)}
                        className={`btn-secondary text-sm flex items-center gap-1.5 ${gateEnabled ? 'text-green-400' : ''}`}
                    >
                        {gateEnabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        Gate
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handlePublish} disabled={publishing} className="btn-primary text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Block palette (left) */}
                <div className="w-48 bg-[#1a1d27] border-r border-white/5 overflow-y-auto py-3 px-2 flex-shrink-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">+ Blocks</p>
                    {BLOCK_TYPES.map(bt => (
                        <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type)}
                            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <bt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{bt.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content preview (center) */}
                <div className="flex-1 overflow-y-auto bg-white">
                    <div className="max-w-3xl mx-auto py-10 px-8 pl-20" style={fontStyle}>
                        {blocks.map((block, idx) => (
                            <div
                                key={block.id}
                                className={`group relative ${dragIdx === idx ? 'opacity-40' : ''}`}
                                draggable
                                onDragStart={e => handleDragStart(e, idx)}
                                onDragOver={e => handleDragOver(e, idx)}
                                onDragEnd={handleDragEnd}
                                onDrop={e => handleDrop(e, idx)}
                            >
                                {dropIdx === idx && dragIdx !== idx && (
                                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
                                )}

                                {/* Block toolbar — inside the group area */}
                                <div className="absolute -left-12 top-0 flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex z-10">
                                    <div className="p-1 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                                        <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                    <button onClick={() => moveBlock(idx, -1)} className="p-1 hover:bg-gray-200 rounded" title="Move up">
                                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button onClick={() => moveBlock(idx, 1)} className="p-1 hover:bg-gray-200 rounded" title="Move down">
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button onClick={() => deleteBlock(idx)} className="p-1 hover:bg-red-100 rounded" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>

                                {/* Block content */}
                                <div
                                    className="outline-none rounded transition-shadow group-hover:ring-2 group-hover:ring-blue-200"
                                    contentEditable
                                    suppressContentEditableWarning
                                    dangerouslySetInnerHTML={{ __html: block.html }}
                                    onBlur={(e) => updateBlockHtml(idx, e.currentTarget.innerHTML)}
                                    onClick={(e) => {
                                        // Media slot click
                                        const slot = e.target.closest('[data-media-slot]');
                                        if (slot || e.target.tagName === 'IMG') {
                                            e.preventDefault();
                                            handleMediaClick(idx);
                                            return;
                                        }
                                        // CTA link click — open link editor
                                        const link = e.target.closest('a');
                                        if (link) {
                                            e.preventDefault();
                                            handleLinkClick(idx);
                                            return;
                                        }
                                    }}
                                    style={{ minHeight: block.type === 'divider' ? '10px' : '20px' }}
                                />

                                {/* CTA link indicator */}
                                {(block.type === 'button' || block.type === 'product' || block.type === 'banner') && (
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link2 className="w-3 h-3" />
                                        <button onClick={() => handleLinkClick(idx)} className="hover:text-blue-500 hover:underline">{ctaLinkLabel}</button>
                                    </div>
                                )}

                                {/* Insert between blocks */}
                                <div className="flex items-center justify-center h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => addBlock('text', idx)}
                                        className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm hover:bg-blue-600"
                                        title="Insert block below"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {blocks.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-lg mb-2">Choose a template to get started</p>
                                <p className="text-sm mb-6">Or add blocks manually from the left panel</p>
                                <button onClick={() => setShowTemplates(true)} className="btn-primary">
                                    <LayoutTemplate className="w-4 h-4 mr-2 inline" /> Choose Template
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Template Picker Modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTemplates(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">Choose Template</h2>
                            <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {Object.entries(PAGE_TEMPLATES).map(([key, tpl]) => (
                                <button
                                    key={key}
                                    onClick={() => selectTemplate(key)}
                                    className="text-left p-4 rounded-xl border border-white/5 hover:border-brand-500/50 hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <span className="text-xl">{tpl.emoji}</span>
                                        <span className="text-sm font-bold text-white">{tpl.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{tpl.desc}</p>
                                    <div className="flex gap-1 flex-wrap">
                                        {tpl.traffic.map(t => (
                                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{t}</span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Modal */}
            {showAi && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAi(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-400" /> AI Content Generator</h2>
                            <button onClick={() => setShowAi(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        {/* Tabs */}
                        <div className="flex border-b border-white/5">
                            {[['generate', 'Generate'], ['fromlink', 'From Link'], ['improve', 'Improve'], ['clone', 'Clone']].map(([k, l]) => (
                                <button key={k} onClick={() => setAiTab(k)} className={`flex-1 py-2.5 text-xs font-medium ${aiTab === k ? 'text-brand-400 border-b-2 border-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>{l}</button>
                            ))}
                        </div>
                        <div className="p-6 space-y-4">
                            {(aiTab === 'generate' || aiTab === 'improve') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Name</label>
                                        <input type="text" value={aiForm.productName} onChange={e => setAiForm(f => ({ ...f, productName: e.target.value }))} className="input-field text-sm" placeholder="Citrus Burn" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Description</label>
                                        <textarea value={aiForm.productDescription} onChange={e => setAiForm(f => ({ ...f, productDescription: e.target.value }))} className="input-field text-sm" rows="3" placeholder="Natural fat-burning supplement..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Style</label>
                                        <select value={aiForm.style} onChange={e => setAiForm(f => ({ ...f, style: e.target.value }))} className="input-field text-sm">
                                            <option value="advertorial">📰 Advertorial</option>
                                            <option value="health_review">🏥 Health Review</option>
                                            <option value="listicle">📝 Listicle</option>
                                            <option value="social_bridge">📱 Social Bridge</option>
                                            <option value="blog_post">✍️ Blog Post (SEO)</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            {(aiTab === 'fromlink' || aiTab === 'clone') && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">{aiTab === 'clone' ? 'Page URL to Clone' : 'Product Page URL'}</label>
                                    <input type="text" value={aiForm.productUrl} onChange={e => setAiForm(f => ({ ...f, productUrl: e.target.value }))} className="input-field text-sm" placeholder="https://..." />
                                </div>
                            )}
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">CTA Button Links To</p>
                                <p className="text-sm text-white flex items-center gap-1.5">
                                    <Link2 className="w-3.5 h-3.5 text-brand-400" />
                                    {ctaLinkLabel}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-1">Set in Funnel Settings. You can override per-block in the editor.</p>
                            </div>
                            <button onClick={handleAiGenerate} disabled={aiGenerating} className="btn-primary w-full flex items-center justify-center gap-2">
                                {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {aiGenerating ? 'Generating...' : aiTab === 'clone' ? 'Clone Page' : aiTab === 'improve' ? 'Improve Content' : 'Generate Content'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Link Editor Popup */}
            {showLinkEditor && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowLinkEditor(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Link2 className="w-4 h-4 text-brand-400" /> Edit CTA Link</h3>
                            <button onClick={() => setShowLinkEditor(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Link URL</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="https://..."
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && applyLinkEdit()}
                                />
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Auto-Resolved Link</p>
                                <p className="text-xs text-gray-400">{ctaLinkLabel}</p>
                                <button onClick={() => setLinkUrl(ctaLink)} className="text-[10px] text-brand-400 hover:text-brand-300 mt-1">← Use auto-resolved link</button>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLinkEditor(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={applyLinkEdit} className="btn-primary flex-1">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker */}
            <MediaPicker
                isOpen={showMediaPicker}
                funnelId={funnelId}
                accept={mediaAccept}
                onSelect={(url, info) => insertMedia(url, info)}
                onClose={() => { setShowMediaPicker(false); setMediaBlockIdx(null); }}
            />
        </div>
    );
}
