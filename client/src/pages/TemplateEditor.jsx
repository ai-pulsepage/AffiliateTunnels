import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funnelApi, publishApi, aiApi } from '../lib/api';
import { PAGE_TEMPLATES, TEMPLATE_CATEGORIES } from '../lib/pageTemplates';
import MediaPicker from '../components/MediaPicker';
import BlockSettingsPanel from '../components/BlockSettingsPanel';
import {
    ArrowLeft, Save, Globe, Sparkles, ToggleLeft, ToggleRight,
    Link2, X, Copy, ExternalLink, Loader2, Type, AlignLeft, Image, Video,
    MousePointerClick, Quote, List, Minus, LayoutTemplate, Mail, Package,
    ChevronUp, ChevronDown, Trash2, Plus, GripVertical,
    Bold, Italic, Underline, Strikethrough, AlignCenter, AlignRight,
    Palette, Maximize2, Minimize2, Search, Monitor, Tablet, Smartphone
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
    const [templateCat, setTemplateCat] = useState('all');

    // Save as Template state
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [saveTemplateName, setSaveTemplateName] = useState('');
    const [saveTemplateEmoji, setSaveTemplateEmoji] = useState('📄');
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [customTemplates, setCustomTemplates] = useState([]);

    // Link editor state
    const [showLinkEditor, setShowLinkEditor] = useState(false);
    const [linkBlockIdx, setLinkBlockIdx] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');

    // AI state
    const [showAi, setShowAi] = useState(false);
    const [aiTab, setAiTab] = useState('generate');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiForm, setAiForm] = useState({ productName: '', productDescription: '', affiliateLink: '', style: 'review_article', productUrl: '', customDirection: '' });

    // Active block for formatting toolbar
    const [activeBlockIdx, setActiveBlockIdx] = useState(null);
    // Media resize state
    const [resizeTarget, setResizeTarget] = useState(null); // { blockIdx, element: 'img'|'video' }
    const savedRangeRef = useRef(null);

    // Save current selection whenever it changes (so toolbar dropdowns can restore it)
    useEffect(() => {
        function saveSelection() {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                // Only save if selection is inside a contentEditable block
                const container = range.commonAncestorContainer;
                const editableParent = container.nodeType === 3 ? container.parentElement?.closest('[contenteditable]') : container.closest?.('[contenteditable]');
                if (editableParent) {
                    savedRangeRef.current = range.cloneRange();
                }
            }
        }
        document.addEventListener('selectionchange', saveSelection);
        return () => document.removeEventListener('selectionchange', saveSelection);
    }, []);
    const [dragIdx, setDragIdx] = useState(null);
    const [dropIdx, setDropIdx] = useState(null);

    // SEO state
    const [showSeo, setShowSeo] = useState(false);
    const [seoForm, setSeoForm] = useState({ seo_title: '', seo_description: '', og_image_url: '' });
    const [seoGenerating, setSeoGenerating] = useState(false);

    // Viewport preview state
    const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

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
            if (pg) setSeoForm({ seo_title: pg.seo_title || '', seo_description: pg.seo_description || '', og_image_url: pg.og_image_url || '' });

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

        function isWrapper(el) {
            // A wrapper div is a generic container that wraps the whole page
            // (e.g. the AI's <div style="background:#fff; min-height:100vh">)
            // Criteria: it's a div, has multiple child elements, and isn't a media slot / form / CTA
            if (el.tagName !== 'DIV') return false;
            if (el.hasAttribute('data-media-slot')) return false;
            if (el.hasAttribute('data-block-type')) return false;
            if (el.querySelector(':scope > input, :scope > form, :scope > button')) return false;
            // If it has many child elements and looks like a page wrapper, unwrap it
            const kids = el.children.length;
            if (kids >= 3) return true;
            // Single-child wrapper divs
            if (kids === 1 && el.children[0].tagName === 'DIV' && el.children[0].children.length >= 3) return true;
            return false;
        }

        function walk(elements) {
            for (const child of elements) {
                if (child.id === 'at-gate-popup' || child.tagName === 'SCRIPT') {
                    setGateEnabled(true);
                    continue;
                }
                // If it has a data-block-type, use it directly
                if (child.getAttribute('data-block-type')) {
                    const wrapperStyles = extractStylesFromHtml(child.outerHTML);
                    parsed.push({ id: child.getAttribute('data-block-id') || genId(), type: child.getAttribute('data-block-type'), html: child.innerHTML, styles: wrapperStyles });
                    continue;
                }
                // Unwrap container/wrapper divs to pull out individual blocks
                if (isWrapper(child)) {
                    walk(child.children);
                    continue;
                }
                const type = guessBlockType(child);
                parsed.push({ id: genId(), type, html: child.outerHTML, styles: extractStylesFromHtml(child.outerHTML) });
            }
        }

        walk(div.children);
        if (parsed.length > 0) setBlocks(parsed);
    }

    function guessBlockType(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') return 'heading';
        if (tag === 'blockquote') return 'quote';
        if (tag === 'ul' || tag === 'ol') return 'list';
        if (tag === 'hr') return 'divider';
        if (el.hasAttribute('data-media-slot') || el.querySelector('[data-media-slot]')) return 'image';
        if (el.querySelector('input[type="email"]') || el.querySelector('[data-at-form]') || el.querySelector('form[data-at-form]')) return 'optin';
        if (el.querySelector('a[style*="background"]') || (tag === 'div' && el.querySelector('a') && el.textContent.length < 80)) return 'button';
        return 'text';
    }

    function selectTemplate(key) {
        const tpl = PAGE_TEMPLATES[key];
        const newBlocks = tpl.blocks(ctaLink).map(b => ({
            ...b,
            id: genId(),
            styles: b.styles || extractStylesFromHtml(b.html),
        }));
        setBlocks(newBlocks);
        setShowTemplates(false);
    }

    // Auto-extract settings-panel-relevant CSS from a block's root element
    function extractStylesFromHtml(html) {
        const styles = {};
        try {
            const div = document.createElement('div');
            div.innerHTML = html.trim();
            const el = div.firstElementChild;
            if (!el) return styles;
            const cs = el.style;
            if (cs.backgroundColor) styles.backgroundColor = cs.backgroundColor;
            if (cs.background && !cs.background.includes('gradient')) styles.backgroundColor = cs.background;
            if (cs.borderRadius) styles.borderRadius = cs.borderRadius;
            if (cs.paddingTop) styles.paddingTop = cs.paddingTop;
            if (cs.paddingRight) styles.paddingRight = cs.paddingRight;
            if (cs.paddingBottom) styles.paddingBottom = cs.paddingBottom;
            if (cs.paddingLeft) styles.paddingLeft = cs.paddingLeft;
            if (cs.padding) {
                const parts = cs.padding.split(/\s+/);
                if (parts.length === 1) {
                    styles.paddingTop = styles.paddingRight = styles.paddingBottom = styles.paddingLeft = parts[0];
                } else if (parts.length === 2) {
                    styles.paddingTop = styles.paddingBottom = parts[0];
                    styles.paddingLeft = styles.paddingRight = parts[1];
                } else if (parts.length === 4) {
                    [styles.paddingTop, styles.paddingRight, styles.paddingBottom, styles.paddingLeft] = parts;
                }
            }
            if (cs.marginTop) styles.marginTop = cs.marginTop;
            if (cs.marginBottom) styles.marginBottom = cs.marginBottom;
            if (cs.fontSize) styles.fontSize = cs.fontSize;
            if (cs.color) styles.color = cs.color;
            if (cs.textAlign) styles.textAlign = cs.textAlign;
            if (cs.lineHeight) styles.lineHeight = cs.lineHeight;
        } catch (_) { /* ignore parse errors */ }
        return styles;
    }

    function blocksToHtml() {
        let html = blocks.map(b => {
            const s = b.styles || {};
            const styleStr = buildStyleString(s);
            const visClass = s.visibility === 'desktop' ? ' class="hide-on-mobile"' : s.visibility === 'mobile' ? ' class="hide-on-desktop"' : '';
            return `<div data-block-type="${b.type}" data-block-id="${b.id}"${visClass}${styleStr ? ` style="${styleStr}"` : ''}>${b.html}</div>`;
        }).join('\n');
        // Add responsive visibility CSS
        html = `<style>.hide-on-mobile{display:block}@media(max-width:768px){.hide-on-mobile{display:none!important}.hide-on-desktop{display:block!important}}.hide-on-desktop{display:none}</style>\n` + html;
        if (gateEnabled) {
            html += gatePopupHtml(funnelId, pageId);
        }
        return html;
    }

    function buildStyleString(s) {
        const parts = [];
        if (s.backgroundColor) parts.push(`background-color:${s.backgroundColor}`);
        if (s.borderRadius) parts.push(`border-radius:${s.borderRadius}`);
        if (s.borderWidth) parts.push(`border:${s.borderWidth} solid ${s.borderColor || '#e5e7eb'}`);
        if (s.paddingTop) parts.push(`padding-top:${s.paddingTop}`);
        if (s.paddingRight) parts.push(`padding-right:${s.paddingRight}`);
        if (s.paddingBottom) parts.push(`padding-bottom:${s.paddingBottom}`);
        if (s.paddingLeft) parts.push(`padding-left:${s.paddingLeft}`);
        if (s.marginTop) parts.push(`margin-top:${s.marginTop}`);
        if (s.marginBottom) parts.push(`margin-bottom:${s.marginBottom}`);
        if (s.fontSize) parts.push(`font-size:${s.fontSize}`);
        if (s.color) parts.push(`color:${s.color}`);
        if (s.textAlign) parts.push(`text-align:${s.textAlign}`);
        if (s.lineHeight) parts.push(`line-height:${s.lineHeight}`);
        return parts.join(';');
    }

    function addBlock(type, afterIndex = -1) {
        const template = BLOCK_TYPES.find(b => b.type === type);
        if (!template) return;
        const newBlock = { id: genId(), type, html: template.html };
        let insertIdx;
        setBlocks(prev => {
            const next = [...prev];
            if (afterIndex >= 0) {
                next.splice(afterIndex + 1, 0, newBlock);
                insertIdx = afterIndex + 1;
            } else {
                next.push(newBlock);
                insertIdx = next.length - 1;
            }
            return next;
        });

        // Auto-select and scroll to the new block
        setTimeout(() => {
            setActiveBlockIdx(insertIdx);
            const el = document.querySelector(`[data-block-idx="${insertIdx}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);

        // Auto-open media picker for image/video blocks
        if (type === 'image' || type === 'video') {
            setTimeout(() => {
                setMediaBlockIdx(insertIdx);
                setMediaAccept('all');
                setShowMediaPicker(true);
            }, 100);
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

    function updateBlockStyles(idx, styles) {
        setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, styles } : b));
    }

    function duplicateBlock(idx) {
        setBlocks(prev => {
            const block = prev[idx];
            if (!block) return prev;
            const dup = { ...block, id: genId(), styles: block.styles ? { ...block.styles } : {} };
            const next = [...prev];
            next.splice(idx + 1, 0, dup);
            return next;
        });
        setActiveBlockIdx(idx + 1);
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
        // Check both <a> and <button> elements (opt-in forms use buttons)
        const link = tmp.querySelector('a') || tmp.querySelector('button[data-link]');
        setLinkUrl(link?.getAttribute('href') || link?.getAttribute('data-link') || ctaLink);
        setLinkBlockIdx(idx);
        setShowLinkEditor(true);
    }

    function applyLinkEdit() {
        if (linkBlockIdx === null) return;
        const block = blocks[linkBlockIdx];
        const tmp = document.createElement('div');
        tmp.innerHTML = block.html;
        // Update <a> links
        const links = tmp.querySelectorAll('a');
        links.forEach(a => a.setAttribute('href', linkUrl));
        // Also update form action if this is an opt-in block
        const form = tmp.querySelector('form');
        if (form) form.setAttribute('data-redirect', linkUrl);
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
        let mediaTag;
        if (mediaInfo?.mime_type?.startsWith('video/')) {
            mediaTag = `<video src="${url}" controls style="width:100%;border-radius:8px;"></video>`;
        } else {
            mediaTag = `<img src="${url}" style="width:100%;display:block;border-radius:8px;" alt="">`;
        }

        // Try to replace only the data-media-slot element within the block,
        // preserving all surrounding content (important for AI-generated blocks)
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${block.html}</div>`, 'text/html');
        const slot = doc.querySelector('[data-media-slot]');
        if (slot) {
            // Replace just the placeholder slot with the media element
            const wrapper = doc.createElement('div');
            wrapper.innerHTML = mediaTag;
            slot.replaceWith(wrapper.firstChild);
            updateBlockHtml(mediaBlockIdx, doc.body.firstChild.innerHTML);
        } else {
            // No slot found — standalone image/video block, replace entirely
            updateBlockHtml(mediaBlockIdx, mediaTag);
        }
        setShowMediaPicker(false);
        setMediaBlockIdx(null);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await funnelApi.updatePage(funnelId, pageId, {
                html_output: blocksToHtml(),
                seo_title: seoForm.seo_title || null,
                seo_description: seoForm.seo_description || null,
                og_image_url: seoForm.og_image_url || null,
            });
            toast.success('Saved!');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    async function handleSeoGenerate() {
        setSeoGenerating(true);
        try {
            const html = blocksToHtml();
            const result = await aiApi.generateSeo(html);
            setSeoForm(prev => ({
                ...prev,
                seo_title: result.seo_title || prev.seo_title,
                seo_description: result.seo_description || prev.seo_description,
            }));
            toast.success('SEO generated!');
        } catch (err) { toast.error(err.message); }
        finally { setSeoGenerating(false); }
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
        if (aiTab === 'clone' && !aiForm.productUrl) {
            toast.error('Paste the URL to clone');
            return;
        }

        if (aiTab === 'generate' && !aiForm.productName && !aiForm.productUrl) {
            toast.error('Provide a product name or URL to scrape');
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
            let productIntel = null;

            // If URL provided, scrape first to auto-fill product data
            if (aiForm.productUrl && aiTab === 'generate') {
                toast('Analyzing product page with AI...');
                const scraped = await aiApi.scrapeProduct(aiForm.productUrl);
                productName = productName || scraped.productName || 'Product';
                productInfo = productInfo || scraped.description || '';
                productIntel = scraped.productIntel || null;
                setAiForm(f => ({ ...f, productName: productName, productDescription: productInfo, affiliateLink: f.affiliateLink || aiForm.productUrl }));
                if (productIntel) {
                    toast.success(`Extracted ${productIntel.ingredients?.length || 0} ingredients, ${productIntel.testimonials?.length || 0} testimonials`);
                }
            }

            toast('Writing content...');
            const payload = {
                productName: productName || aiForm.productName,
                productDescription: productInfo || aiForm.productDescription,
                affiliateLink: ctaLink || '#',
                style: aiForm.style,
                productIntel,
                customDirection: aiForm.customDirection || '',
            };

            if (aiTab === 'improve') {
                payload.existingContent = blocksToHtml();
            }

            const result = await aiApi.generatePage(payload);
            if (result.html) {
                parseHtmlToBlocks(result.html);
                setShowAi(false);
                toast.success('Content generated!');
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
                        onClick={() => setShowSeo(!showSeo)}
                        className={`btn-secondary text-sm flex items-center gap-1.5 ${showSeo ? 'text-green-400' : ''}`}
                    >
                        <Search className="w-3.5 h-3.5" /> SEO
                    </button>
                    {/* Viewport toggles */}
                    <div className="flex items-center bg-[#0f1117] rounded-lg p-0.5 border border-white/5">
                        {[['desktop', Monitor, 'Desktop'], ['tablet', Tablet, 'Tablet'], ['mobile', Smartphone, 'Mobile']].map(([key, Icon, label]) => (
                            <button
                                key={key}
                                onClick={() => setViewport(key)}
                                title={label}
                                className={`p-1.5 rounded-md transition-colors ${viewport === key ? 'bg-brand-500/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>
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
                    <button
                        onClick={() => { setSaveTemplateName(''); setSaveTemplateEmoji('📄'); setShowSaveTemplate(true); }}
                        disabled={blocks.length === 0}
                        className="btn-secondary text-sm flex items-center gap-1.5"
                        title="Save as reusable template"
                    >
                        <LayoutTemplate className="w-3.5 h-3.5" /> Save Template
                    </button>
                    <button onClick={handlePublish} disabled={publishing} className="btn-primary text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* SEO Panel */}
            {showSeo && (
                <div className="border-b border-white/10 bg-[#1a1d27] px-6 py-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Search className="w-4 h-4 text-green-400" /> Page SEO Settings
                            </h3>
                            <button
                                onClick={handleSeoGenerate}
                                disabled={seoGenerating || blocks.length === 0}
                                className="btn-secondary text-xs flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3 h-3" />
                                {seoGenerating ? 'Generating...' : 'AI Auto-Fill'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">SEO Title <span className={`float-right ${(seoForm.seo_title?.length || 0) > 60 ? 'text-red-400' : 'text-gray-600'}`}>{seoForm.seo_title?.length || 0}/60</span></label>
                                <input
                                    type="text"
                                    value={seoForm.seo_title}
                                    onChange={e => setSeoForm(f => ({ ...f, seo_title: e.target.value }))}
                                    className="input-field text-sm"
                                    placeholder="Page title for search engines"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">OG Image URL</label>
                                <input
                                    type="text"
                                    value={seoForm.og_image_url}
                                    onChange={e => setSeoForm(f => ({ ...f, og_image_url: e.target.value }))}
                                    className="input-field text-sm"
                                    placeholder="https://... (1200x630px recommended)"
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-xs text-gray-400 mb-1">Meta Description <span className={`float-right ${(seoForm.seo_description?.length || 0) > 155 ? 'text-red-400' : 'text-gray-600'}`}>{seoForm.seo_description?.length || 0}/155</span></label>
                            <textarea
                                value={seoForm.seo_description}
                                onChange={e => setSeoForm(f => ({ ...f, seo_description: e.target.value }))}
                                className="input-field text-sm h-16"
                                placeholder="Compelling description for search results"
                            />
                        </div>
                        {/* Google Preview */}
                        {(seoForm.seo_title || seoForm.seo_description) && (
                            <div className="mt-3 p-3 bg-white/5 rounded-lg">
                                <p className="text-[10px] text-gray-500 mb-1">Google Preview</p>
                                <p className="text-sm text-blue-400 font-medium truncate">{seoForm.seo_title || 'Page Title'}</p>
                                <p className="text-xs text-green-500 truncate">dealfindai.com/p/{funnel?.slug}/...</p>
                                <p className="text-xs text-gray-400 line-clamp-2">{seoForm.seo_description || 'Meta description will appear here...'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Block palette (left) */}
                <div className="w-48 bg-[#1a1d27] border-r border-white/5 overflow-y-auto py-3 px-2 flex-shrink-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 mb-2">+ Blocks</p>
                    {BLOCK_TYPES.map(bt => (
                        <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type, activeBlockIdx != null ? activeBlockIdx : -1)}
                            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <bt.icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{bt.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto" style={{ background: viewport === 'desktop' ? '#fff' : '#e5e7eb' }}>
                    <div
                        className={`mx-auto transition-all duration-300 ease-in-out ${viewport === 'desktop' ? 'py-10 px-8 pl-20' : viewport === 'tablet' ? 'py-6 px-4' : 'py-4 px-3'}`}
                        style={{
                            ...fontStyle,
                            maxWidth: viewport === 'desktop' ? undefined : viewport === 'tablet' ? '480px' : '375px',
                            background: '#fff',
                            minHeight: '100%',
                            ...(viewport !== 'desktop' ? { boxShadow: '0 0 40px rgba(0,0,0,0.12)', borderRadius: '8px', marginTop: '16px', marginBottom: '16px', minHeight: 'calc(100% - 32px)' } : {}),
                        }}
                    >
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .at-editor-preview img, .at-editor-preview video { max-width: 100%; height: auto; }
                            ${viewport !== 'desktop' ? `
                            /* ── Responsive preview overrides ── */
                            .at-editor-preview h1 { font-size: ${viewport === 'mobile' ? '22px' : '26px'} !important; line-height: 1.25 !important; }
                            .at-editor-preview h2 { font-size: ${viewport === 'mobile' ? '18px' : '20px'} !important; }
                            .at-editor-preview h3 { font-size: ${viewport === 'mobile' ? '16px' : '17px'} !important; }
                            .at-editor-preview p { font-size: ${viewport === 'mobile' ? '14px' : '15px'} !important; }
                            .at-editor-preview li { font-size: ${viewport === 'mobile' ? '14px' : '15px'} !important; }
                            /* Collapse grids */
                            .at-editor-preview [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
                            /* Collapse flex rows */
                            .at-editor-preview [style*="display:flex"][style*="gap"] { flex-direction: column !important; }
                            .at-editor-preview [style*="display: flex"][style*="gap"] { flex-direction: column !important; }
                            /* Reduce padding */
                            .at-editor-preview [style*="padding:40px"] { padding: ${viewport === 'mobile' ? '16px' : '20px'} !important; }
                            .at-editor-preview [style*="padding:36px"] { padding: ${viewport === 'mobile' ? '16px' : '20px'} !important; }
                            .at-editor-preview [style*="padding:60px"] { padding: ${viewport === 'mobile' ? '16px' : '20px'} !important; }
                            .at-editor-preview [style*="padding:80px"] { padding: 16px !important; }
                            .at-editor-preview [style*="padding:100px"] { padding: 16px !important; }
                            /* Max-widths → full */
                            .at-editor-preview [style*="max-width:500px"],
                            .at-editor-preview [style*="max-width:520px"],
                            .at-editor-preview [style*="max-width:560px"],
                            .at-editor-preview [style*="max-width:600px"],
                            .at-editor-preview [style*="max-width:480px"],
                            .at-editor-preview [style*="max-width:440px"],
                            .at-editor-preview [style*="max-width:420px"],
                            .at-editor-preview [style*="max-width:400px"],
                            .at-editor-preview [style*="max-width:360px"] { max-width: 100% !important; }
                            /* Full-width CTAs */
                            .at-editor-preview a[style*="padding:18px"],
                            .at-editor-preview a[style*="padding:20px"],
                            .at-editor-preview a[style*="padding:22px"] {
                              display: block !important; text-align: center !important;
                              padding-left: 16px !important; padding-right: 16px !important;
                            }
                            /* Large font overrides */
                            .at-editor-preview [style*="font-size:32px"] { font-size: ${viewport === 'mobile' ? '22px' : '26px'} !important; }
                            .at-editor-preview [style*="font-size:34px"] { font-size: ${viewport === 'mobile' ? '22px' : '26px'} !important; }
                            .at-editor-preview [style*="font-size:36px"] { font-size: ${viewport === 'mobile' ? '22px' : '26px'} !important; }
                            .at-editor-preview [style*="font-size:38px"] { font-size: ${viewport === 'mobile' ? '22px' : '26px'} !important; }
                            .at-editor-preview [style*="font-size:40px"] { font-size: ${viewport === 'mobile' ? '20px' : '24px'} !important; }
                            .at-editor-preview [style*="font-size:42px"] { font-size: ${viewport === 'mobile' ? '20px' : '24px'} !important; }
                            .at-editor-preview [style*="font-size:28px"] { font-size: ${viewport === 'mobile' ? '20px' : '22px'} !important; }
                            .at-editor-preview [style*="font-size:26px"] { font-size: ${viewport === 'mobile' ? '18px' : '20px'} !important; }
                            .at-editor-preview [style*="font-size:24px"] { font-size: ${viewport === 'mobile' ? '18px' : '20px'} !important; }
                            .at-editor-preview [style*="font-size:22px"] { font-size: ${viewport === 'mobile' ? '17px' : '19px'} !important; }
                            /* Countdown blocks */
                            .at-editor-preview [style*="min-width:72px"] { min-width: 48px !important; padding: 10px 12px !important; }
                            /* Tables */
                            .at-editor-preview table { font-size: 12px !important; }
                            ` : ''}
                        `}} />
                        <div className="at-editor-preview">
                            {blocks.map((block, idx) => (
                                <div
                                    key={block.id}
                                    data-block-idx={idx}
                                    className={`group relative ${dragIdx === idx ? 'opacity-40' : ''} ${activeBlockIdx === idx ? 'ring-2 ring-brand-500/40 rounded-lg' : ''}`}
                                    style={block.styles ? {
                                        backgroundColor: block.styles.backgroundColor || undefined,
                                        borderRadius: block.styles.borderRadius || undefined,
                                        border: block.styles.borderWidth ? `${block.styles.borderWidth} solid ${block.styles.borderColor || '#e5e7eb'}` : undefined,
                                        paddingTop: block.styles.paddingTop || undefined,
                                        paddingRight: block.styles.paddingRight || undefined,
                                        paddingBottom: block.styles.paddingBottom || undefined,
                                        paddingLeft: block.styles.paddingLeft || undefined,
                                        marginTop: block.styles.marginTop || undefined,
                                        marginBottom: block.styles.marginBottom || undefined,
                                        fontSize: block.styles.fontSize || undefined,
                                        color: block.styles.color || undefined,
                                        textAlign: block.styles.textAlign || undefined,
                                        lineHeight: block.styles.lineHeight || undefined,
                                    } : undefined}
                                    onDragOver={e => handleDragOver(e, idx)}
                                    onDrop={e => handleDrop(e, idx)}
                                    onClick={() => setActiveBlockIdx(idx)}
                                >
                                    {dropIdx === idx && dragIdx !== idx && (
                                        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
                                    )}

                                    {/* Block toolbar — always accessible on hover, right edge */}
                                    <div className="absolute -right-12 top-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-white/90 rounded-lg shadow-md border border-gray-200 p-0.5">
                                        <div
                                            className="p-1 cursor-grab active:cursor-grabbing"
                                            title="Drag to reorder"
                                            draggable
                                            onDragStart={e => handleDragStart(e, idx)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                        <button onClick={() => moveBlock(idx, -1)} className="p-1 hover:bg-gray-100 rounded" title="Move up">
                                            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => moveBlock(idx, 1)} className="p-1 hover:bg-gray-100 rounded" title="Move down">
                                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                        <button onClick={() => duplicateBlock(idx)} className="p-1 hover:bg-blue-50 rounded" title="Duplicate">
                                            <Copy className="w-3.5 h-3.5 text-blue-400" />
                                        </button>
                                        <button onClick={() => deleteBlock(idx)} className="p-1 hover:bg-red-50 rounded" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>

                                    {/* Formatting toolbar — appears when editing this block */}
                                    {activeBlockIdx === idx && ['heading', 'text', 'quote', 'list'].includes(block.type) && (
                                        <div className="absolute -top-10 left-0 z-40 flex items-center gap-0.5 bg-[#1a1d2e] border border-white/10 rounded-lg px-1.5 py-1 shadow-2xl" onMouseDown={e => { if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION' && e.target.tagName !== 'INPUT') e.preventDefault(); }}>
                                            <select
                                                onMouseDown={(e) => { e.stopPropagation(); }}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const editableEl = e.target.closest('[data-block-idx]')?.querySelector('[contenteditable]');
                                                    if (savedRangeRef.current) {
                                                        const sel = window.getSelection();
                                                        sel.removeAllRanges();
                                                        sel.addRange(savedRangeRef.current);
                                                    }
                                                    document.execCommand('fontName', false, val);
                                                    e.target.value = '';
                                                    if (editableEl) { updateBlockHtml(idx, editableEl.innerHTML); editableEl.focus(); }
                                                }}
                                                className="bg-[#2a2d3e] text-white text-xs rounded px-1 py-1 border border-white/20 outline-none cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Font</option>
                                                <option value="Georgia, serif" style={{ background: '#1e2030', color: '#fff' }}>Serif</option>
                                                <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" style={{ background: '#1e2030', color: '#fff' }}>Sans-serif</option>
                                                <option value="'Courier New', monospace" style={{ background: '#1e2030', color: '#fff' }}>Mono</option>
                                                <option value="Impact, sans-serif" style={{ background: '#1e2030', color: '#fff' }}>Impact</option>
                                                <option value="'Comic Sans MS', cursive" style={{ background: '#1e2030', color: '#fff' }}>Casual</option>
                                            </select>
                                            <select
                                                onMouseDown={(e) => { e.stopPropagation(); }}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const editableEl = e.target.closest('[data-block-idx]')?.querySelector('[contenteditable]');
                                                    if (savedRangeRef.current) {
                                                        const sel = window.getSelection();
                                                        sel.removeAllRanges();
                                                        sel.addRange(savedRangeRef.current);
                                                    }
                                                    document.execCommand('fontSize', false, '7');
                                                    const fontElements = document.querySelectorAll('font[size="7"]');
                                                    fontElements.forEach(el => { el.removeAttribute('size'); el.style.fontSize = val; });
                                                    e.target.value = '';
                                                    if (editableEl) { updateBlockHtml(idx, editableEl.innerHTML); editableEl.focus(); }
                                                }}
                                                className="bg-[#2a2d3e] text-white text-xs rounded px-1 py-1 border border-white/20 outline-none cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Size</option>
                                                <option value="12px" style={{ background: '#1e2030', color: '#fff' }}>12</option>
                                                <option value="14px" style={{ background: '#1e2030', color: '#fff' }}>14</option>
                                                <option value="16px" style={{ background: '#1e2030', color: '#fff' }}>16</option>
                                                <option value="18px" style={{ background: '#1e2030', color: '#fff' }}>18</option>
                                                <option value="20px" style={{ background: '#1e2030', color: '#fff' }}>20</option>
                                                <option value="24px" style={{ background: '#1e2030', color: '#fff' }}>24</option>
                                                <option value="28px" style={{ background: '#1e2030', color: '#fff' }}>28</option>
                                                <option value="32px" style={{ background: '#1e2030', color: '#fff' }}>32</option>
                                                <option value="36px" style={{ background: '#1e2030', color: '#fff' }}>36</option>
                                                <option value="42px" style={{ background: '#1e2030', color: '#fff' }}>42</option>
                                                <option value="48px" style={{ background: '#1e2030', color: '#fff' }}>48</option>
                                            </select>
                                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                                            <input
                                                type="color"
                                                onMouseDown={(e) => { e.stopPropagation(); }}
                                                onChange={(e) => {
                                                    const editableEl = e.target.closest('[data-block-idx]')?.querySelector('[contenteditable]');
                                                    if (savedRangeRef.current) {
                                                        const sel = window.getSelection();
                                                        sel.removeAllRanges();
                                                        sel.addRange(savedRangeRef.current);
                                                    }
                                                    document.execCommand('foreColor', false, e.target.value);
                                                    if (editableEl) { updateBlockHtml(idx, editableEl.innerHTML); editableEl.focus(); }
                                                }}
                                                className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0"
                                                title="Font Color"
                                                defaultValue="#000000"
                                            />
                                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                                            <button onClick={() => document.execCommand('bold')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => document.execCommand('italic')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => document.execCommand('underline')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Underline"><Underline className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => document.execCommand('strikethrough')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
                                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                                            <button onClick={() => { const u = prompt('Enter URL:'); if (u) document.execCommand('createLink', false, u); }} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Add Link"><Link2 className="w-3.5 h-3.5" /></button>
                                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                                            <button onClick={() => document.execCommand('justifyLeft')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => document.execCommand('justifyCenter')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => document.execCommand('justifyRight')} className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    {/* Block content */}
                                    {block.type === 'optin' ? (
                                        /* Opt-in blocks: NOT contentEditable — form inputs conflict with contentEditable */
                                        <div
                                            className="outline-none rounded transition-shadow group-hover:ring-2 group-hover:ring-blue-200 relative cursor-pointer"
                                            dangerouslySetInnerHTML={{ __html: block.html }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveBlockIdx(idx);
                                                // Click on button inside form — open link editor
                                                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                                                    handleLinkClick(idx);
                                                    return;
                                                }
                                                // Click on media slot
                                                const slot = e.target.closest('[data-media-slot]');
                                                if (slot) { handleMediaClick(idx); return; }
                                                // Click on image
                                                if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                                                    setResizeTarget({ blockIdx: idx, el: e.target });
                                                    return;
                                                }
                                            }}
                                            style={{ minHeight: '20px', pointerEvents: 'auto' }}
                                        />
                                    ) : (
                                        /* Normal blocks: contentEditable for inline text editing */
                                        <div
                                            className="outline-none rounded transition-shadow group-hover:ring-2 group-hover:ring-blue-200"
                                            contentEditable
                                            suppressContentEditableWarning
                                            dangerouslySetInnerHTML={{ __html: block.html }}
                                            onFocus={() => setActiveBlockIdx(idx)}
                                            onBlur={(e) => {
                                                // Don't trigger blur if focus moves to toolbar or settings panel
                                                const blockWrapper = e.currentTarget.closest('[data-block-idx]');
                                                if (blockWrapper && blockWrapper.contains(e.relatedTarget)) return;
                                                if (e.relatedTarget?.closest?.('[data-settings-panel]')) return;
                                                updateBlockHtml(idx, e.currentTarget.innerHTML);
                                                setTimeout(() => setActiveBlockIdx(prev => prev === idx ? null : prev), 150);
                                            }}
                                            onClick={(e) => {
                                                // Media slot click — open media picker
                                                const slot = e.target.closest('[data-media-slot]');
                                                if (slot) {
                                                    e.preventDefault();
                                                    handleMediaClick(idx);
                                                    return;
                                                }
                                                // Image/video click — show resize controls (but NOT media picker)
                                                if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
                                                    e.preventDefault();
                                                    setResizeTarget({ blockIdx: idx, el: e.target });
                                                    return;
                                                }
                                                // CTA link click — open link editor
                                                const link = e.target.closest('a');
                                                if (link) {
                                                    e.preventDefault();
                                                    handleLinkClick(idx);
                                                    return;
                                                }
                                                // Button click (in non-form contexts) — open link editor
                                                const btn = e.target.closest('button');
                                                if (btn) {
                                                    e.preventDefault();
                                                    handleLinkClick(idx);
                                                    return;
                                                }
                                            }}
                                            style={{ minHeight: block.type === 'divider' ? '10px' : '20px' }}
                                        />
                                    )}

                                    {/* Media resize toolbar — when image/video is clicked */}
                                    {resizeTarget && resizeTarget.blockIdx === idx && (
                                        <div className="absolute -top-10 left-0 z-40 flex items-center gap-1 bg-[#1a1d2e] border border-white/10 rounded-lg px-2 py-1 shadow-2xl" onMouseDown={e => e.preventDefault()}>
                                            <span className="text-[10px] text-gray-400 mr-1">Width:</span>
                                            {['25%', '50%', '75%', '100%'].map(w => (
                                                <button
                                                    key={w}
                                                    onClick={() => {
                                                        // Remove HTML attributes that override CSS
                                                        resizeTarget.el.removeAttribute('width');
                                                        resizeTarget.el.removeAttribute('height');
                                                        // Set proportional sizing via CSS only
                                                        resizeTarget.el.style.width = w;
                                                        resizeTarget.el.style.height = 'auto';
                                                        resizeTarget.el.style.maxWidth = '100%';
                                                        resizeTarget.el.style.objectFit = 'contain';
                                                        resizeTarget.el.style.display = 'block';
                                                        resizeTarget.el.style.margin = w !== '100%' ? '0 auto' : '';
                                                        updateBlockHtml(idx, resizeTarget.el.closest('[contenteditable]').innerHTML);
                                                    }}
                                                    className="px-2 py-0.5 text-[11px] rounded hover:bg-white/10 text-gray-300 hover:text-white"
                                                >{w}</button>
                                            ))}
                                            <div className="w-px h-4 bg-white/10 mx-1" />
                                            <button
                                                onClick={() => {
                                                    const br = resizeTarget.el.style.borderRadius;
                                                    resizeTarget.el.style.borderRadius = br === '50%' ? '8px' : br === '8px' ? '0' : '50%';
                                                    updateBlockHtml(idx, resizeTarget.el.closest('[contenteditable]').innerHTML);
                                                }}
                                                className="px-2 py-0.5 text-[11px] rounded hover:bg-white/10 text-gray-300 hover:text-white"
                                                title="Toggle rounded corners"
                                            >◐ Round</button>
                                            <div className="w-px h-4 bg-white/10 mx-1" />
                                            <button
                                                onClick={() => handleMediaClick(idx)}
                                                className="px-2 py-0.5 text-[11px] rounded hover:bg-white/10 text-gray-300 hover:text-white"
                                                title="Replace this image/video"
                                            >⟳ Replace</button>
                                            <button
                                                onClick={() => {
                                                    // Replace image/video with a media slot placeholder
                                                    const el = resizeTarget.el;
                                                    const container = el.closest('[contenteditable]') || el.closest('[data-block-idx]');
                                                    const slot = document.createElement('div');
                                                    slot.setAttribute('data-media-slot', 'hero');
                                                    slot.setAttribute('style', 'margin:24px 0;border-radius:12px;overflow:hidden;background:#f5f5f5;min-height:180px;display:flex;align-items:center;justify-content:center;cursor:pointer;');
                                                    slot.innerHTML = '<span style="color:#999;font-size:14px;">Click to add image</span>';
                                                    el.replaceWith(slot);
                                                    if (container) updateBlockHtml(idx, container.innerHTML);
                                                    setResizeTarget(null);
                                                }}
                                                className="px-2 py-0.5 text-[11px] rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                                title="Remove this image"
                                            >✕ Remove</button>
                                            <button
                                                onClick={() => setResizeTarget(null)}
                                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white ml-1"
                                                title="Close"
                                            ><X className="w-3 h-3" /></button>
                                        </div>
                                    )}

                                    {/* CTA link indicator */}
                                    {(block.type === 'button' || block.type === 'product' || block.type === 'banner') && (
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link2 className="w-3 h-3" />
                                            <button onClick={() => handleLinkClick(idx)} className="hover:text-blue-500 hover:underline">{ctaLinkLabel}</button>
                                        </div>
                                    )}

                                    {/* Insert between blocks — full block picker */}
                                    <div className="relative flex items-center justify-center h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200" />
                                        <div className="relative group/insert">
                                            <button
                                                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm hover:bg-blue-600 relative z-10"
                                                title="Insert block here"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover/insert:flex bg-[#1a1d2e] border border-white/10 rounded-lg shadow-2xl p-1.5 gap-1 z-50 whitespace-nowrap">
                                                {BLOCK_TYPES.map(bt => (
                                                    <button
                                                        key={bt.type}
                                                        onClick={() => addBlock(bt.type, idx)}
                                                        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
                                                        title={bt.label}
                                                    >
                                                        <bt.icon className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-[9px] text-gray-500">{bt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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
                        </div>{/* end at-editor-preview */}
                    </div>
                </div>

                {/* Block Settings Panel (right) — always rendered to prevent layout bounce */}
                <BlockSettingsPanel
                    block={activeBlockIdx != null ? blocks[activeBlockIdx] : null}
                    blockIdx={activeBlockIdx}
                    onUpdateStyles={updateBlockStyles}
                    onDuplicate={duplicateBlock}
                    onClose={() => setActiveBlockIdx(null)}
                />
            </div>

            {/* Template Picker Modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTemplates(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-3xl border border-white/10 shadow-2xl animate-slide-up max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
                            <h2 className="text-lg font-bold text-white">Choose Template</h2>
                            <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        {/* Category tabs */}
                        <div className="flex gap-1.5 px-6 py-3 border-b border-white/5 flex-shrink-0 overflow-x-auto">
                            <button
                                onClick={() => setTemplateCat('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${templateCat === 'all' ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >All Templates</button>
                            <button
                                onClick={() => { setTemplateCat('custom'); funnelApi.listCustomTemplates().then(d => setCustomTemplates(d.templates || [])).catch(() => { }); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${templateCat === 'custom' ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >⭐ My Templates</button>
                            {TEMPLATE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setTemplateCat(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${templateCat === cat.id ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >{cat.emoji} {cat.label}</button>
                            ))}
                        </div>
                        {/* Template grid */}
                        <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto flex-1">
                            {templateCat === 'custom' ? (
                                /* Custom templates */
                                customTemplates.length === 0 ? (
                                    <div className="col-span-2 text-center py-12">
                                        <p className="text-gray-500 text-sm">No saved templates yet.</p>
                                        <p className="text-gray-600 text-xs mt-1">Design a page and click "Save Template" to save it here.</p>
                                    </div>
                                ) : customTemplates.map(ct => (
                                    <div
                                        key={ct.id}
                                        className="relative text-left p-4 rounded-xl border border-white/5 hover:border-brand-500/50 hover:bg-white/5 transition-all group"
                                    >
                                        <button
                                            onClick={() => {
                                                const loadedBlocks = (typeof ct.blocks === 'string' ? JSON.parse(ct.blocks) : ct.blocks).map(b => ({ ...b, id: genId() }));
                                                setBlocks(loadedBlocks);
                                                setShowTemplates(false);
                                                toast.success(`Template "${ct.name}" loaded`);
                                            }}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className="text-xl">{ct.emoji || '📄'}</span>
                                                <span className="text-sm font-bold text-white">{ct.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{(typeof ct.blocks === 'string' ? JSON.parse(ct.blocks) : ct.blocks).length} blocks</p>
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!confirm(`Delete template "${ct.name}"?`)) return;
                                                await funnelApi.deleteCustomTemplate(ct.id);
                                                setCustomTemplates(prev => prev.filter(t => t.id !== ct.id));
                                                toast.success('Template deleted');
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete template"
                                        >
                                            <X className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                /* Built-in templates */
                                Object.entries(PAGE_TEMPLATES)
                                    .filter(([, tpl]) => templateCat === 'all' || tpl.category === templateCat)
                                    .map(([key, tpl]) => (
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
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Save as Template Modal */}
            {showSaveTemplate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSaveTemplate(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-brand-400" /> Save as Template</h2>
                            <button onClick={() => setShowSaveTemplate(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Template Name</label>
                                <input
                                    type="text"
                                    value={saveTemplateName}
                                    onChange={e => setSaveTemplateName(e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="My Custom Template"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Emoji</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {['📄', '📰', '📝', '📱', '🎁', '✍️', '🎬', '⚖️', '🎯', '📢', '🚀', '💎', '🔥', '⭐', '💰', '🏆'].map(e => (
                                        <button
                                            key={e}
                                            onClick={() => setSaveTemplateEmoji(e)}
                                            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${saveTemplateEmoji === e ? 'bg-brand-500/30 ring-1 ring-brand-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                                        >{e}</button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">{blocks.length} blocks will be saved</p>
                        </div>
                        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-2">
                            <button onClick={() => setShowSaveTemplate(false)} className="btn-secondary text-sm">Cancel</button>
                            <button
                                disabled={!saveTemplateName.trim() || savingTemplate}
                                onClick={async () => {
                                    setSavingTemplate(true);
                                    try {
                                        await funnelApi.saveCustomTemplate({
                                            name: saveTemplateName.trim(),
                                            emoji: saveTemplateEmoji,
                                            blocks: blocks.map(b => ({ type: b.type, html: b.html, styles: b.styles || {} })),
                                        });
                                        toast.success('Template saved!');
                                        setShowSaveTemplate(false);
                                    } catch (err) {
                                        toast.error('Failed to save template');
                                    } finally {
                                        setSavingTemplate(false);
                                    }
                                }}
                                className="btn-primary text-sm flex items-center gap-1.5"
                            >
                                <Save className="w-3.5 h-3.5" /> {savingTemplate ? 'Saving...' : 'Save Template'}
                            </button>
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
                            {[['generate', 'Generate'], ['improve', 'Improve'], ['clone', 'Clone']].map(([k, l]) => (
                                <button key={k} onClick={() => setAiTab(k)} className={`flex-1 py-2.5 text-xs font-medium ${aiTab === k ? 'text-brand-400 border-b-2 border-brand-400' : 'text-gray-500 hover:text-gray-300'}`}>{l}</button>
                            ))}
                        </div>
                        <div className="p-6 space-y-4">
                            {aiTab === 'generate' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product URL <span className="text-gray-600">(optional — scrapes product info)</span></label>
                                        <input type="text" value={aiForm.productUrl} onChange={e => setAiForm(f => ({ ...f, productUrl: e.target.value }))} className="input-field text-sm" placeholder="https://example.com/product-page" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Name</label>
                                        <input type="text" value={aiForm.productName} onChange={e => setAiForm(f => ({ ...f, productName: e.target.value }))} className="input-field text-sm" placeholder="Ted's Woodworking" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Description</label>
                                        <textarea value={aiForm.productDescription} onChange={e => setAiForm(f => ({ ...f, productDescription: e.target.value }))} className="input-field text-sm" rows="2" placeholder="Natural fat-burning supplement..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Creative Direction <span className="text-gray-600">(optional — guide the AI's voice & angle)</span></label>
                                        <textarea value={aiForm.customDirection} onChange={e => setAiForm(f => ({ ...f, customDirection: e.target.value }))} className="input-field text-sm" rows="2" placeholder="e.g. Write as a thank-you page, excited tone, focus on the free download..." />
                                    </div>
                                </>
                            )}
                            {aiTab === 'improve' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Name</label>
                                        <input type="text" value={aiForm.productName} onChange={e => setAiForm(f => ({ ...f, productName: e.target.value }))} className="input-field text-sm" placeholder="Citrus Burn" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Product Description</label>
                                        <textarea value={aiForm.productDescription} onChange={e => setAiForm(f => ({ ...f, productDescription: e.target.value }))} className="input-field text-sm" rows="2" placeholder="Natural fat-burning supplement..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Creative Direction <span className="text-gray-600">(optional)</span></label>
                                        <textarea value={aiForm.customDirection} onChange={e => setAiForm(f => ({ ...f, customDirection: e.target.value }))} className="input-field text-sm" rows="2" placeholder="e.g. Make it more urgent, add scarcity, change tone to casual..." />
                                    </div>
                                </>
                            )}
                            {aiTab !== 'clone' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Page Style</label>
                                    <select value={aiForm.style} onChange={e => setAiForm(f => ({ ...f, style: e.target.value }))} className="input-field text-sm">
                                        <optgroup label="Bridge / Review">
                                            <option value="review_clean">📰 Clean Editorial Review</option>
                                            <option value="review_authority">🏅 Authority Expert Review</option>
                                            <option value="review_urgent">🔥 Urgent/Scarcity Review</option>
                                        </optgroup>
                                        <optgroup label="Listicle">
                                            <option value="listicle_numbered">📝 Numbered Benefits</option>
                                            <option value="listicle_comparison">📊 Comparison Chart</option>
                                        </optgroup>
                                        <optgroup label="Social Bridge">
                                            <option value="social_tiktok">📱 TikTok Viral</option>
                                            <option value="social_instagram">📸 Instagram Clean</option>
                                        </optgroup>
                                        <optgroup label="Lead Magnet">
                                            <option value="lead_minimal">🎁 Minimal Opt-in</option>
                                            <option value="lead_webinar">🎓 Webinar Registration</option>
                                        </optgroup>
                                        <optgroup label="Blog Post">
                                            <option value="blog_editorial">✍️ Editorial Long-form</option>
                                            <option value="blog_pinterest">📌 Pinterest Optimized</option>
                                        </optgroup>
                                        <optgroup label="Video / VSL">
                                            <option value="vsl_classic">🎬 Video Sales Letter</option>
                                        </optgroup>
                                        <optgroup label="Comparison">
                                            <option value="comparison_showdown">⚔️ Product Showdown</option>
                                        </optgroup>
                                        <optgroup label="Squeeze Page">
                                            <option value="squeeze_quick">⚡ Quick Capture</option>
                                            <option value="squeeze_countdown">⏰ Countdown Squeeze</option>
                                        </optgroup>
                                        <optgroup label="Ad Creative">
                                            <option value="ad_side_by_side">📢 Side-by-Side (Image + Bullets)</option>
                                        </optgroup>
                                    </select>
                                </div>
                            )}
                            {aiTab === 'clone' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Page URL to Clone</label>
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
                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><Link2 className="w-4 h-4 text-brand-400" /> Edit Button / Link Destination</h3>
                            <button onClick={() => setShowLinkEditor(false)} className="p-1 hover:bg-white/5 rounded"><X className="w-4 h-4 text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-300">💡 <strong>What is this?</strong> This is where CTA buttons and links in this block will send visitors when clicked. Usually this is your <strong>affiliate hop link</strong> (e.g. from ClickBank).</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Where should this link go?</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    className="input-field text-sm"
                                    placeholder="https://yoursite.hop.clickbank.net"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && applyLinkEdit()}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Paste your affiliate/hop link here. All buttons and links in this block will point to this URL.</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">🔗 Your Funnel's Affiliate Link</p>
                                <p className="text-xs text-brand-400 break-all">{ctaLink !== '#' ? ctaLink : 'Not set — go to Funnel Settings to add one'}</p>
                                {ctaLink !== '#' && (
                                    <button onClick={() => setLinkUrl(ctaLink)} className="text-[10px] bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 px-2 py-1 rounded mt-2">← Use my affiliate link</button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLinkEditor(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={applyLinkEdit} className="btn-primary flex-1">Apply Link</button>
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
