import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funnelApi, publishApi, aiApi } from '../lib/api';
import MediaPicker from '../components/MediaPicker';
import { ArrowLeft, Save, Globe, Wand2, ToggleLeft, ToggleRight, Sparkles, Link2, PenLine, X, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── TEMPLATES ────────────────────────────────
const TEMPLATES = {
    advertorial: {
        name: 'Advertorial',
        desc: 'News article style — byline, expert quotes, body text, CTA',
        emoji: '📰',
        html: (data) => `
<div style="max-width:720px;margin:0 auto;padding:40px 24px;font-family:Georgia,'Times New Roman',serif;color:#333;line-height:1.8;background:#fff;">
  <div style="border-bottom:3px solid #222;padding-bottom:12px;margin-bottom:24px;">
    <h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#111;margin:0 0 8px 0;" data-editable="headline">${data.headline || 'Breakthrough Discovery Shocks Health Experts'}</h1>
    <p style="font-size:14px;color:#888;margin:0;">By <span data-editable="author">${data.author || 'Health Desk'}</span> · Updated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>
  <div data-media-slot="hero" style="margin-bottom:24px;border-radius:8px;overflow:hidden;background:#f0f0f0;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
    <span style="color:#999;font-size:14px;">Click to add hero image or video</span>
  </div>
  <p style="font-size:18px;color:#444;" data-editable="intro">${data.intro || 'Scientists have uncovered a remarkable natural compound that is changing the way millions of people approach their daily health routine. The results have been nothing short of extraordinary.'}</p>
  <blockquote style="border-left:4px solid #e63946;padding:16px 20px;margin:28px 0;background:#fdf0f0;font-style:italic;border-radius:0 8px 8px 0;">
    <p style="margin:0;font-size:16px;color:#555;" data-editable="quote">"${data.quote || 'The results we are seeing are truly remarkable. This could change everything we know about natural health solutions.'}"</p>
    <p style="margin:8px 0 0;font-size:13px;color:#888;" data-editable="quoteAuthor">— ${data.quoteAuthor || 'Dr. Sarah Mitchell, Research Director'}</p>
  </blockquote>
  <div data-editable="body" style="font-size:17px;color:#444;">
    ${data.body || `<p>For years, researchers have been searching for a natural solution that could support overall wellness without the harsh side effects of traditional approaches.</p>
    <p>Now, a small team of scientists has developed a formula that combines ancient botanical wisdom with modern scientific research. The preliminary results have caught the attention of health professionals worldwide.</p>
    <p>In a recent study, participants who incorporated this solution into their daily routine reported significant improvements within just the first few weeks.</p>
    <h2 style="font-size:22px;color:#222;margin:32px 0 16px;">How Does It Work?</h2>
    <p>The formula works by targeting the root cause rather than just masking symptoms. By addressing the underlying mechanisms, users experience more sustainable and lasting results.</p>
    <p>Unlike other solutions on the market, this approach uses only natural, clinically-studied ingredients that work in harmony with your body's own processes.</p>`}
  </div>
  <div data-media-slot="mid" style="margin:28px 0;border-radius:8px;overflow:hidden;background:#f0f0f0;min-height:150px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
    <span style="color:#999;font-size:14px;">Click to add image or video</span>
  </div>
  <div style="background:linear-gradient(135deg,#e63946,#d62828);border-radius:12px;padding:32px;text-align:center;margin:32px 0;">
    <p style="font-size:20px;color:#fff;font-weight:700;margin:0 0 8px;" data-editable="ctaHeadline">${data.ctaHeadline || 'Ready to Experience the Difference?'}</p>
    <p style="font-size:15px;color:rgba(255,255,255,0.85);margin:0 0 20px;" data-editable="ctaSubtext">${data.ctaSubtext || 'Join thousands who have already transformed their health naturally.'}</p>
    <a href="${data.hoplink || '#'}" data-editable-link="cta" style="display:inline-block;padding:16px 48px;background:#fff;color:#d62828;font-size:18px;font-weight:700;border-radius:8px;text-decoration:none;">
      <span data-editable="ctaButton">${data.ctaButton || 'Learn More →'}</span>
    </a>
  </div>
  <p style="font-size:12px;color:#bbb;text-align:center;margin-top:40px;border-top:1px solid #eee;padding-top:16px;" data-editable="disclaimer">${data.disclaimer || 'This is an advertisement. Individual results may vary. This product is not intended to diagnose, treat, cure, or prevent any disease.'}</p>
</div>`
    },
    video_presell: {
        name: 'Video Presell',
        desc: 'Hero video with headline, body text, and prominent CTA',
        emoji: '🎬',
        html: (data) => `
<div style="max-width:680px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;background:#fff;">
  <h1 style="font-size:28px;font-weight:800;text-align:center;line-height:1.3;color:#111;margin:0 0 8px;" data-editable="headline">${data.headline || 'Watch: The 30-Second Morning Ritual That Changed Everything'}</h1>
  <p style="text-align:center;font-size:16px;color:#666;margin:0 0 24px;" data-editable="subheadline">${data.subheadline || 'Over 2 million people have already seen this video. Here\'s why it matters.'}</p>
  <div data-media-slot="hero" style="margin-bottom:28px;border-radius:12px;overflow:hidden;background:#000;min-height:380px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
    <span style="color:#666;font-size:16px;">▶ Click to add video</span>
  </div>
  <div data-editable="body" style="font-size:17px;line-height:1.7;color:#444;">
    ${data.body || `<p>This short video reveals a surprisingly simple technique that leading health researchers say could be the key to unlocking your body's natural potential.</p>
    <p>What makes this different from everything else you've tried? It works with your body's own biology — not against it.</p>
    <p><strong>Here's what people are saying:</strong></p>
    <ul style="padding-left:20px;">
      <li style="margin-bottom:8px;">"I noticed a difference within the first week" — Maria T.</li>
      <li style="margin-bottom:8px;">"My energy levels are through the roof" — James K.</li>
      <li style="margin-bottom:8px;">"I wish I had found this sooner" — Linda S.</li>
    </ul>`}
  </div>
  <div style="background:#111;border-radius:12px;padding:36px;text-align:center;margin:32px 0;">
    <p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 12px;" data-editable="ctaHeadline">${data.ctaHeadline || 'Get Instant Access Now'}</p>
    <p style="font-size:14px;color:rgba(255,255,255,0.6);margin:0 0 20px;" data-editable="ctaSubtext">${data.ctaSubtext || 'Limited time offer. 60-day money-back guarantee.'}</p>
    <a href="${data.hoplink || '#'}" data-editable-link="cta" style="display:inline-block;padding:18px 56px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-size:20px;font-weight:700;border-radius:10px;text-decoration:none;">
      <span data-editable="ctaButton">${data.ctaButton || 'Yes, I Want This! →'}</span>
    </a>
  </div>
  <p style="font-size:12px;color:#bbb;text-align:center;margin-top:32px;" data-editable="disclaimer">${data.disclaimer || 'This is an advertisement. Individual results may vary.'}</p>
</div>`
    },
    listicle: {
        name: 'Listicle',
        desc: '"7 Reasons Why..." numbered article with CTA at the end',
        emoji: '📝',
        html: (data) => `
<div style="max-width:700px;margin:0 auto;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#333;background:#fff;">
  <p style="font-size:13px;font-weight:600;color:#e63946;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;" data-editable="category">${data.category || 'HEALTH & WELLNESS'}</p>
  <h1 style="font-size:30px;font-weight:800;line-height:1.25;color:#111;margin:0 0 16px;" data-editable="headline">${data.headline || '7 Reasons Why Thousands Are Switching to This Natural Solution'}</h1>
  <p style="font-size:17px;color:#666;margin:0 0 28px;line-height:1.6;" data-editable="intro">${data.intro || 'Experts say this little-known natural compound could be the most significant discovery in years. Here\'s what you need to know.'}</p>
  <div data-media-slot="hero" style="margin-bottom:28px;border-radius:10px;overflow:hidden;background:#f0f0f0;min-height:200px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
    <span style="color:#999;font-size:14px;">Click to add hero image</span>
  </div>
  <div data-editable="body" style="font-size:17px;line-height:1.7;color:#444;">
    ${data.body || `<h2 style="font-size:20px;color:#111;margin:28px 0 12px;">1. It's Backed by Clinical Research</h2>
    <p>Multiple peer-reviewed studies have confirmed the effectiveness of the key ingredients used in this formula.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">2. No Harsh Side Effects</h2>
    <p>Unlike pharmaceutical alternatives, users report virtually zero negative side effects.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">3. Results in as Little as 2 Weeks</h2>
    <p>Clinical trial participants reported noticeable improvements within the first 14 days of use.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">4. 100% Natural Ingredients</h2>
    <p>Every ingredient is sourced from nature and tested for purity and potency.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">5. Easy to Use</h2>
    <p>Just take it once a day — no complicated routines or special equipment needed.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">6. Affordable</h2>
    <p>Compared to alternatives, this solution costs a fraction of the price with better results.</p>
    <h2 style="font-size:20px;color:#111;margin:28px 0 12px;">7. 60-Day Money-Back Guarantee</h2>
    <p>Try it completely risk-free. If you're not satisfied, get a full refund — no questions asked.</p>`}
  </div>
  <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:12px;padding:36px;text-align:center;margin:36px 0;">
    <p style="font-size:22px;color:#fff;font-weight:700;margin:0 0 10px;" data-editable="ctaHeadline">${data.ctaHeadline || 'Ready to Try It Risk-Free?'}</p>
    <p style="font-size:15px;color:rgba(255,255,255,0.8);margin:0 0 20px;" data-editable="ctaSubtext">${data.ctaSubtext || 'Click below to see today\'s exclusive pricing.'}</p>
    <a href="${data.hoplink || '#'}" data-editable-link="cta" style="display:inline-block;padding:16px 52px;background:#fff;color:#6d28d9;font-size:18px;font-weight:700;border-radius:8px;text-decoration:none;">
      <span data-editable="ctaButton">${data.ctaButton || 'See Special Pricing →'}</span>
    </a>
  </div>
  <p style="font-size:12px;color:#bbb;text-align:center;margin-top:32px;" data-editable="disclaimer">${data.disclaimer || 'This is an advertisement. Individual results may vary.'}</p>
</div>`
    }
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

// Editable text selectors — any of these elements are click-to-edit
const EDITABLE_TAGS = 'h1,h2,h3,h4,h5,h6,p,span,li,blockquote,td,th,label,figcaption,small,strong,em,b,i';

// ─── EDITOR COMPONENT ─────────────────────────
export default function TemplateEditor() {
    const { funnelId, pageId } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [page, setPage] = useState(null);
    const [funnelPages, setFunnelPages] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [htmlContent, setHtmlContent] = useState('');
    const [gateEnabled, setGateEnabled] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [activeMediaTarget, setActiveMediaTarget] = useState(null); // { type: 'slot'|'img', element }
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Link editor state
    const [showLinkEditor, setShowLinkEditor] = useState(false);
    const [linkEditorUrl, setLinkEditorUrl] = useState('');
    const [linkEditorTarget, setLinkEditorTarget] = useState(null);
    const [linkEditorPos, setLinkEditorPos] = useState({ top: 0, left: 0 });

    // AI state
    const [showAi, setShowAi] = useState(false);
    const [aiTab, setAiTab] = useState('generate');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiForm, setAiForm] = useState({ productName: '', productDescription: '', affiliateLink: '', style: 'advertorial', productUrl: '', existingContent: '' });

    const previewRef = useRef(null);

    useEffect(() => { loadPage(); }, [funnelId, pageId]);

    async function loadPage() {
        try {
            const fData = await funnelApi.get(funnelId);
            setFunnel(fData.funnel);
            const pages = fData.pages || fData.funnel?.pages || [];
            setFunnelPages(pages);
            const pg = pages.find(p => p.id === pageId);
            setPage(pg);

            if (pg?.html_output) {
                setHtmlContent(pg.html_output);
                setSelectedTemplate('custom');
            }
            setAiForm(f => ({ ...f, affiliateLink: fData.funnel.affiliate_link || '' }));
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    function selectTemplate(key) {
        const tpl = TEMPLATES[key];
        const hoplink = funnel?.affiliate_link || '#';
        const html = tpl.html({ hoplink });
        setSelectedTemplate(key);
        setHtmlContent(html);
    }

    // Handle clicks inside the preview iframe — universal editing
    const handlePreviewClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        // 1. Media slot (data-media-slot)
        const slot = e.target.closest('[data-media-slot]');
        if (slot) {
            setActiveMediaTarget({ type: 'slot', slotName: slot.getAttribute('data-media-slot') });
            setShowMediaPicker(true);
            return;
        }

        // 2. Image click — swap via MediaPicker
        if (e.target.tagName === 'IMG') {
            setActiveMediaTarget({ type: 'img', element: e.target });
            setShowMediaPicker(true);
            return;
        }

        // 3. Link / CTA button click — open link editor
        const link = e.target.closest('a');
        if (link && !e.target.closest('[data-editable]')) {
            const rect = link.getBoundingClientRect();
            const iframeRect = previewRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
            setLinkEditorUrl(link.getAttribute('href') || '');
            setLinkEditorTarget(link);
            setLinkEditorPos({
                top: iframeRect.top + rect.top + rect.height + 4,
                left: Math.min(iframeRect.left + rect.left, window.innerWidth - 380),
            });
            setShowLinkEditor(true);
            return;
        }

        // 4. Text elements — make contentEditable
        const textEl = e.target.closest(EDITABLE_TAGS) || e.target.closest('[data-editable]');
        if (textEl && textEl.tagName !== 'A') {
            textEl.contentEditable = 'true';
            textEl.focus();
            textEl.style.outline = '2px solid #6366f1';
            textEl.style.outlineOffset = '2px';
            textEl.style.borderRadius = '4px';
            const blur = () => {
                textEl.contentEditable = 'false';
                textEl.style.outline = '';
                textEl.style.outlineOffset = '';
                syncFromPreview();
                textEl.removeEventListener('blur', blur);
            };
            textEl.addEventListener('blur', blur);
        }
    }, []);

    function syncFromPreview() {
        if (previewRef.current) {
            const doc = previewRef.current.contentDocument;
            if (doc?.body) {
                setHtmlContent(doc.body.innerHTML);
            }
        }
    }

    function applyLinkEdit() {
        if (linkEditorTarget && previewRef.current) {
            linkEditorTarget.setAttribute('href', linkEditorUrl);
            syncFromPreview();
        }
        setShowLinkEditor(false);
        setLinkEditorTarget(null);
    }

    function insertMedia(url, mediaInfo) {
        if (!previewRef.current || !activeMediaTarget) return;
        const doc = previewRef.current.contentDocument;

        if (activeMediaTarget.type === 'slot') {
            const slot = doc.querySelector(`[data-media-slot="${activeMediaTarget.slotName}"]`);
            if (!slot) return;
            if (mediaInfo?.mime_type?.startsWith('video/')) {
                slot.innerHTML = `<video src="${url}" controls style="width:100%;border-radius:8px;" />`;
            } else {
                slot.innerHTML = `<img src="${url}" style="width:100%;display:block;" alt="" />`;
            }
            slot.style.minHeight = '';
            slot.style.background = '';
        } else if (activeMediaTarget.type === 'img') {
            // Find the same img in the iframe doc
            const imgs = doc.querySelectorAll('img');
            for (const img of imgs) {
                if (img === activeMediaTarget.element || img.src === activeMediaTarget.element.src) {
                    img.src = url;
                    break;
                }
            }
        }

        syncFromPreview();
        setActiveMediaTarget(null);
    }

    async function handleSave() {
        setSaving(true);
        try {
            let finalHtml = htmlContent;
            if (gateEnabled) {
                finalHtml += gatePopupHtml(funnelId, pageId);
            }
            await funnelApi.updatePage(funnelId, pageId, { html_output: finalHtml });
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
        if (aiTab === 'fromlink' && !aiForm.productUrl) {
            toast.error('Paste the product page URL');
            return;
        }
        if (aiTab === 'clone' && !aiForm.productUrl) {
            toast.error('Paste the page URL to clone');
            return;
        }

        setAiGenerating(true);
        try {
            // Clone mode — full page clone with images
            if (aiTab === 'clone') {
                toast('Cloning page and downloading images...');
                const result = await aiApi.clonePage({
                    url: aiForm.productUrl,
                    hopLink: aiForm.affiliateLink || funnel?.affiliate_link || '',
                });
                if (result.html) {
                    setHtmlContent(result.html);
                    setSelectedTemplate('custom');
                    setShowAi(false);
                    toast.success(`Page cloned! ${result.stats?.imagesCloned || 0} images downloaded.`);
                }
                return;
            }

            let productInfo = aiForm.productDescription;
            let productName = aiForm.productName;

            // If "From Link" mode, scrape first
            if (aiTab === 'fromlink') {
                toast('Scraping product page...');
                const scraped = await aiApi.scrapeProduct(aiForm.productUrl);
                productName = scraped.productName || 'Product';
                productInfo = scraped.description || '';
                setAiForm(f => ({ ...f, productName: productName, productDescription: productInfo, affiliateLink: f.affiliateLink || aiForm.productUrl }));
            }

            // If "Improve" mode, send existing content
            const payload = {
                productName: productName || aiForm.productName,
                productDescription: productInfo || aiForm.productDescription,
                affiliateLink: aiForm.affiliateLink || funnel?.affiliate_link || '#',
                style: aiForm.style,
            };

            if (aiTab === 'improve') {
                payload.existingContent = htmlContent;
            }

            const result = await aiApi.generatePage(payload);
            if (result.html) {
                setHtmlContent(result.html);
                setSelectedTemplate('custom');
                setShowAi(false);
                toast.success('AI content generated!');
            }
        } catch (err) { toast.error(err.message); }
        finally { setAiGenerating(false); }
    }

    // Update preview iframe when content changes
    useEffect(() => {
        if (previewRef.current && htmlContent) {
            const doc = previewRef.current.contentDocument;
            doc.open();
            doc.write(`<!DOCTYPE html><html><head><style>
                * { box-sizing: border-box; }
                body { margin: 0; background: #f5f5f5; }
                [data-media-slot]:hover { outline: 2px dashed #6366f1; outline-offset: -2px; cursor: pointer; }
                img:hover { outline: 2px dashed #22c55e; outline-offset: -2px; cursor: pointer; }
                a:hover { outline: 2px dashed #f59e0b !important; outline-offset: 2px; cursor: pointer; }
                ${EDITABLE_TAGS.split(',').map(t => `${t}:hover`).join(',\n')} { outline: 1px dashed #a855f7; outline-offset: 2px; cursor: text; }
            </style></head><body>${htmlContent}</body></html>`);
            doc.close();
            doc.body.addEventListener('click', handlePreviewClick);
        }
    }, [htmlContent, handlePreviewClick]);

    // ─── LOADING ──────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ─── AI MODAL ──────
    const aiModal = showAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => !aiGenerating && setShowAi(false)}>
            <div className="bg-[#1a1d27] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Wand2 className="w-5 h-5 text-purple-400" /> AI Writer</h3>
                    <button onClick={() => setShowAi(false)} className="p-1.5 hover:bg-white/5 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5">
                    {[
                        { key: 'generate', label: 'Generate', icon: Sparkles },
                        { key: 'improve', label: 'Improve', icon: PenLine },
                        { key: 'fromlink', label: 'From Link', icon: Link2 },
                        { key: 'clone', label: 'Clone Page', icon: Copy },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setAiTab(key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors ${aiTab === key ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="p-5 space-y-3">
                    {aiTab === 'generate' && (
                        <>
                            <input value={aiForm.productName} onChange={e => setAiForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product name (e.g. Citrus Burn)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <textarea value={aiForm.productDescription} onChange={e => setAiForm(f => ({ ...f, productDescription: e.target.value }))} placeholder="What does the product do? Who is it for?" rows={4} className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <input value={aiForm.affiliateLink} onChange={e => setAiForm(f => ({ ...f, affiliateLink: e.target.value }))} placeholder="Your hop link (or leave blank to set later)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <select value={aiForm.style} onChange={e => setAiForm(f => ({ ...f, style: e.target.value }))} className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm">
                                <option value="advertorial">Advertorial (news article)</option>
                                <option value="listicle">Listicle (numbered reasons)</option>
                                <option value="health_review">Health Review</option>
                            </select>
                        </>
                    )}

                    {aiTab === 'improve' && (
                        <>
                            <div className="bg-[#13151d] border border-white/10 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-2">AI will read your current page and rewrite it to be more persuasive and professional.</p>
                                {htmlContent ? (
                                    <p className="text-xs text-green-400">✓ Current page content loaded ({Math.round(htmlContent.length / 100) / 10}KB)</p>
                                ) : (
                                    <p className="text-xs text-yellow-400">⚠ No content on page yet. Choose a template first or use Generate.</p>
                                )}
                            </div>
                            <input value={aiForm.affiliateLink} onChange={e => setAiForm(f => ({ ...f, affiliateLink: e.target.value }))} placeholder="Your hop link (for CTA buttons)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                        </>
                    )}

                    {aiTab === 'fromlink' && (
                        <>
                            <input value={aiForm.productUrl} onChange={e => setAiForm(f => ({ ...f, productUrl: e.target.value }))} placeholder="Product page URL (e.g. https://www.clickbank.com/...)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <p className="text-xs text-gray-500">AI will visit this URL, learn about the product, and write an original article for you.</p>
                            <input value={aiForm.affiliateLink} onChange={e => setAiForm(f => ({ ...f, affiliateLink: e.target.value }))} placeholder="Your affiliate hop link" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <select value={aiForm.style} onChange={e => setAiForm(f => ({ ...f, style: e.target.value }))} className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm">
                                <option value="advertorial">Advertorial (news article)</option>
                                <option value="listicle">Listicle (numbered reasons)</option>
                                <option value="health_review">Health Review</option>
                            </select>
                        </>
                    )}

                    {aiTab === 'clone' && (
                        <>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                <p className="text-xs text-amber-400 font-medium mb-1">🔗 Full Page Clone</p>
                                <p className="text-xs text-amber-300/80">Downloads the entire page including all images. Perfect for offer pages where you just need a copy with your links.</p>
                            </div>
                            <input value={aiForm.productUrl} onChange={e => setAiForm(f => ({ ...f, productUrl: e.target.value }))} placeholder="Page URL to clone (e.g. the offer page)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <input value={aiForm.affiliateLink} onChange={e => setAiForm(f => ({ ...f, affiliateLink: e.target.value }))} placeholder="Your hop link (all links will be rewritten to this)" className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                            <p className="text-xs text-gray-600">Images will be downloaded and hosted on your storage. All page links will be swapped to your hop link.</p>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={() => setShowAi(false)} disabled={aiGenerating} className="flex-1 px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">Cancel</button>
                    <button
                        onClick={handleAiGenerate}
                        disabled={aiGenerating || (aiTab === 'improve' && !htmlContent)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:from-purple-500 hover:to-indigo-500"
                    >
                        {aiGenerating ? 'Working...' : aiTab === 'improve' ? 'Improve My Page' : aiTab === 'fromlink' ? 'Scrape & Write' : aiTab === 'clone' ? 'Clone Page' : 'Generate Article'}
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── LINK EDITOR POPOVER ──────
    const linkEditor = showLinkEditor && (
        <div className="fixed z-[60] bg-[#1a1d27] border border-white/10 rounded-xl shadow-2xl p-4 w-[360px]" style={{ top: linkEditorPos.top, left: linkEditorPos.left }}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-amber-400" /> Edit Link</h4>
                <button onClick={() => setShowLinkEditor(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
            <input
                type="text"
                value={linkEditorUrl}
                onChange={e => setLinkEditorUrl(e.target.value)}
                placeholder="https://... or your hop link"
                className="w-full bg-[#13151d] border border-white/10 text-white rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
            />
            {/* Quick pick: other funnel pages */}
            {funnelPages.filter(p => p.id !== pageId).length > 0 && (
                <div className="mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Or link to a funnel page:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {funnelPages.filter(p => p.id !== pageId).map(p => (
                            <button
                                key={p.id}
                                onClick={() => setLinkEditorUrl(`/p/${funnel?.slug}/${p.slug || p.id}`)}
                                className="w-full text-left px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2"
                            >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{p.name}</span>
                                <span className="ml-auto text-[10px] text-gray-600">{p.page_type}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <button onClick={() => setShowLinkEditor(false)} className="flex-1 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10">Cancel</button>
                <button onClick={applyLinkEdit} className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-500">Apply</button>
            </div>
        </div>
    );

    // ─── TEMPLATE SELECTION SCREEN ──────────
    if (!selectedTemplate) {
        return (
            <div className="min-h-screen bg-[#0f1117] text-white">
                <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Choose a Template</h1>
                            <p className="text-sm text-gray-500">{funnel?.name || 'Funnel'} — {page?.name || 'Page'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {Object.entries(TEMPLATES).map(([key, tpl]) => (
                            <button
                                key={key}
                                onClick={() => selectTemplate(key)}
                                className="group bg-[#1a1d27] border border-white/5 rounded-xl p-6 text-left hover:border-purple-500/40 hover:ring-1 hover:ring-purple-500/20 transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-purple-600/15 flex items-center justify-center mb-4 group-hover:bg-purple-600/25 transition-colors">
                                    <span className="text-3xl">{tpl.emoji}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{tpl.name}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{tpl.desc}</p>
                                <p className="text-xs text-purple-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Click to start editing →</p>
                            </button>
                        ))}
                    </div>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-600 mb-3">Or skip templates entirely:</p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <button
                                onClick={() => setShowAi(true)}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Wand2 className="w-5 h-5" /> Let AI Write Your Page
                            </button>
                            <button
                                onClick={() => { setAiTab('clone'); setShowAi(true); }}
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
                            >
                                <Copy className="w-5 h-5" /> Clone a Page
                            </button>
                        </div>
                    </div>
                </div>
                {aiModal}
            </div>
        );
    }

    // ─── EDITOR SCREEN ──────────
    return (
        <div className="flex flex-col h-screen bg-[#0f1117]">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-[#1a1d27] border-b border-white/5 px-4 py-2.5 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-sm font-medium text-white">{page?.name || 'Page Editor'}</span>
                    <span className="text-xs text-gray-500">— {funnel?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setGateEnabled(!gateEnabled)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${gateEnabled ? 'bg-green-600/20 text-green-400' : 'bg-white/5 text-gray-400'}`}
                        title="Email gate popup — captures leads"
                    >
                        {gateEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        Gate
                    </button>

                    <button onClick={() => { setAiTab(htmlContent ? 'improve' : 'generate'); setShowAi(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-600/30">
                        <Wand2 className="w-3.5 h-3.5" /> AI
                    </button>

                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white text-xs font-medium rounded-lg hover:bg-white/10 disabled:opacity-50">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                    </button>

                    <button onClick={handlePublish} disabled={publishing} className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-50">
                        <Globe className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Hint bar */}
            <div className="bg-[#1a1d27]/50 border-b border-white/5 px-4 py-2 flex items-center gap-4 text-xs text-gray-500 shrink-0">
                <span>📝 Click any text to edit</span>
                <span>🖼️ Click any image to swap</span>
                <span>🔗 Click CTA/buttons to change link</span>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-hidden">
                <iframe
                    ref={previewRef}
                    title="Page Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts"
                />
            </div>

            <MediaPicker isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)} onSelect={insertMedia} funnelId={funnelId} />
            {aiModal}
            {linkEditor}
        </div>
    );
}
