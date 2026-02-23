import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogApi, funnelApi, aiApi } from '../lib/api';
import {
    ArrowLeft, Save, Globe, Eye, Search, Type, AlignLeft, Image, Video,
    MousePointerClick, Quote, List, Minus, LayoutTemplate, Mail, Package,
    ChevronUp, ChevronDown, Trash2, Plus, Sparkles, Loader2, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const BLOCK_TYPES = [
    { type: 'heading', label: 'Heading', icon: Type, html: '<h2>Section Heading</h2>' },
    { type: 'text', label: 'Text', icon: AlignLeft, html: '<p>Write your content here. This paragraph supports <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>' },
    { type: 'image', label: 'Image', icon: Image, html: '<div style="text-align:center;padding:20px;background:#f5f5f5;border-radius:8px;"><img src="" alt="Click to add image" style="max-width:100%;border-radius:8px;"><p style="color:#999;font-size:13px;margin-top:8px;">Click to add an image</p></div>' },
    { type: 'video', label: 'Video', icon: Video, html: '<div style="text-align:center;padding:40px;background:#111;border-radius:8px;color:#fff;"><p>🎬 Video Embed</p><p style="font-size:13px;color:#888;margin-top:8px;">Paste a YouTube or Vimeo URL</p></div>' },
    { type: 'button', label: 'CTA Button', icon: MousePointerClick, html: '<div style="text-align:center;padding:20px;"><a href="#" style="display:inline-block;padding:14px 32px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Get Instant Access →</a></div>' },
    { type: 'quote', label: 'Quote', icon: Quote, html: '<blockquote style="border-left:4px solid #e63946;padding:16px 20px;margin:20px 0;background:#fdf0f0;font-style:italic;border-radius:0 8px 8px 0;">"This product changed my life!" — Happy Customer</blockquote>' },
    { type: 'list', label: 'List', icon: List, html: '<ul style="padding-left:24px;"><li>First key benefit</li><li>Second key benefit</li><li>Third key benefit</li></ul>' },
    { type: 'divider', label: 'Divider', icon: Minus, html: '<hr style="border:none;border-top:2px solid #eee;margin:32px 0;">' },
    { type: 'banner', label: 'Banner', icon: LayoutTemplate, html: '<div style="text-align:center;padding:20px;"><a href="#"><img src="" alt="Affiliate Banner" style="max-width:100%;border-radius:8px;border:1px solid #eee;"></a><p style="color:#999;font-size:11px;margin-top:8px;">Click to set banner image + affiliate link</p></div>' },
    { type: 'optin', label: 'Opt-in Form', icon: Mail, html: '<div style="text-align:center;padding:32px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;color:#fff;"><h3 style="margin-bottom:8px;">Get Our Free Guide</h3><p style="margin-bottom:16px;opacity:0.9;font-size:14px;">Enter your email to receive exclusive tips.</p><div style="max-width:320px;margin:0 auto;"><input type="email" placeholder="Your email" style="width:100%;padding:12px;border:none;border-radius:6px;margin-bottom:8px;font-size:14px;"><button style="width:100%;padding:12px;background:#e63946;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Send Me The Guide</button></div></div>' },
    { type: 'product', label: 'Product Card', icon: Package, html: '<div style="display:flex;gap:20px;padding:20px;border:2px solid #e63946;border-radius:12px;align-items:center;"><img src="" alt="Product" style="width:120px;height:120px;object-fit:cover;border-radius:8px;background:#f5f5f5;"><div><h3 style="margin-bottom:4px;">Product Name</h3><p style="color:#666;font-size:14px;margin-bottom:12px;">Brief description of what this product does for the reader.</p><a href="#" style="display:inline-block;padding:10px 24px;background:#e63946;color:#fff;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;">Learn More →</a></div></div>' },
];

export default function BlogEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [funnels, setFunnels] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [seoTab, setSeoTab] = useState('seo');
    const [dragIdx, setDragIdx] = useState(null);
    const [dropIdx, setDropIdx] = useState(null);

    // SEO fields
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [seoKeyword, setSeoKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [slug, setSlug] = useState('');
    const [funnelId, setFunnelId] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');

    useEffect(() => {
        loadPost();
        loadFunnels();
    }, [id]);

    async function loadPost() {
        try {
            const data = await blogApi.get(id);
            const p = data.post;
            setPost(p);
            setSeoTitle(p.seo_title || '');
            setSeoDesc(p.seo_description || '');
            setSeoKeyword(p.seo_keyword || '');
            setCategory(p.category || '');
            setTags((p.tags || []).join(', '));
            setExcerpt(p.excerpt || '');
            setSlug(p.slug || '');
            setFunnelId(p.funnel_id || '');
            setFeaturedImage(p.featured_image || '');

            // Parse HTML into blocks
            if (p.content_html) {
                parseHtmlToBlocks(p.content_html);
            } else {
                // Default blog post blocks
                setBlocks([
                    { id: genId(), type: 'heading', html: `<h1>${p.title}</h1>` },
                    { id: genId(), type: 'text', html: '<p>Write your introduction here. Hook the reader with a compelling opening that addresses their pain point or curiosity.</p>' },
                    { id: genId(), type: 'image', html: '<div style="text-align:center;padding:20px;background:#f5f5f5;border-radius:8px;"><p style="color:#999;font-size:13px;">Click to add a featured image</p></div>' },
                    { id: genId(), type: 'text', html: '<p>Continue with your main content here...</p>' },
                    { id: genId(), type: 'button', html: '<div style="text-align:center;padding:20px;"><a href="#" style="display:inline-block;padding:14px 32px;background:#e63946;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Check Out This Product →</a></div>' },
                ]);
            }
        } catch (err) { toast.error('Failed to load post'); navigate('/blog'); }
        finally { setLoading(false); }
    }

    async function loadFunnels() {
        try {
            const data = await funnelApi.list();
            setFunnels(data.funnels || []);
        } catch (err) { /* ignore */ }
    }

    function genId() {
        return 'blk_' + Math.random().toString(36).substr(2, 9);
    }

    function parseHtmlToBlocks(html) {
        // Simple parser: split by data-block markers or by top-level tags
        const div = document.createElement('div');
        div.innerHTML = html;
        const parsed = [];
        for (const child of div.children) {
            const type = child.getAttribute('data-block-type') || guessBlockType(child);
            parsed.push({
                id: child.getAttribute('data-block-id') || genId(),
                type,
                html: child.innerHTML || child.outerHTML,
            });
        }
        if (parsed.length > 0) {
            setBlocks(parsed);
        }
    }

    function guessBlockType(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'heading';
        if (tag === 'blockquote') return 'quote';
        if (tag === 'ul' || tag === 'ol') return 'list';
        if (tag === 'hr') return 'divider';
        if (el.querySelector('img')) return 'image';
        if (el.querySelector('a[style*="background"]')) return 'button';
        return 'text';
    }

    function blocksToHtml() {
        return blocks.map(b =>
            `<div data-block-type="${b.type}" data-block-id="${b.id}">${b.html}</div>`
        ).join('\n');
    }

    function addBlock(type, afterIndex = -1) {
        const template = BLOCK_TYPES.find(b => b.type === type);
        if (!template) return;
        const newBlock = { id: genId(), type, html: template.html };
        setBlocks(prev => {
            const next = [...prev];
            if (afterIndex >= 0) {
                next.splice(afterIndex + 1, 0, newBlock);
            } else {
                next.push(newBlock);
            }
            return next;
        });
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

    async function handleSave() {
        setSaving(true);
        try {
            await blogApi.update(id, {
                title: post.title,
                slug,
                funnel_id: funnelId || null,
                excerpt,
                content_html: blocksToHtml(),
                featured_image: featuredImage,
                seo_title: seoTitle,
                seo_description: seoDesc,
                seo_keyword: seoKeyword,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            toast.success('Saved!');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    async function handlePublish() {
        setPublishing(true);
        try {
            // Save first
            await blogApi.update(id, {
                title: post.title,
                slug,
                funnel_id: funnelId || null,
                excerpt,
                content_html: blocksToHtml(),
                featured_image: featuredImage,
                seo_title: seoTitle,
                seo_description: seoDesc,
                seo_keyword: seoKeyword,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            const data = await blogApi.publish(id);
            toast.success('Published!');
            setPost(prev => ({ ...prev, status: 'published', published_url: data.url }));
        } catch (err) { toast.error(err.message); }
        finally { setPublishing(false); }
    }

    async function handleGenerate() {
        if (!seoKeyword && !post.title) {
            toast.error('Add a title or keyword first');
            return;
        }
        setGenerating(true);
        try {
            const result = await aiApi.generatePage({
                style: 'blog_post',
                product_name: post.title,
                traffic_source: 'seo',
                niche: category || 'general',
                keyword: seoKeyword || post.title,
            });
            if (result.html) {
                parseHtmlToBlocks(result.html);
                toast.success('Content generated!');
            }
        } catch (err) { toast.error(err.message); }
        finally { setGenerating(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f1117]">
                <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            </div>
        );
    }

    const seoTitleLen = seoTitle.length;
    const seoDescLen = seoDesc.length;

    return (
        <div className="h-screen flex flex-col bg-[#0f1117]">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1d27] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/blog')} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <input
                        type="text"
                        value={post.title}
                        onChange={e => setPost(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg font-bold text-white bg-transparent border-none outline-none w-96"
                        placeholder="Post title..."
                    />
                    {post.status === 'published' && <span className="badge badge-success text-[10px]">Published</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleGenerate} disabled={generating} className="btn-secondary text-sm flex items-center gap-1.5">
                        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        AI Generate
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handlePublish} disabled={publishing} className="btn-primary text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> {publishing ? 'Publishing...' : 'Publish'}
                    </button>
                    {post.published_url && (
                        <a href={post.published_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-lg" title="View live">
                            <Eye className="w-4 h-4 text-green-400" />
                        </a>
                    )}
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
                    <div className="max-w-3xl mx-auto py-10 px-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: '#333', lineHeight: '1.8' }}>
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
                                {/* Drop indicator line */}
                                {dropIdx === idx && dragIdx !== idx && (
                                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
                                )}

                                {/* Block toolbar */}
                                <div className="absolute -left-10 top-0 flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
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

                                {/* Block content (editable) */}
                                <div
                                    className="outline-none rounded transition-shadow group-hover:ring-2 group-hover:ring-blue-200"
                                    contentEditable
                                    suppressContentEditableWarning
                                    dangerouslySetInnerHTML={{ __html: block.html }}
                                    onBlur={(e) => updateBlockHtml(idx, e.currentTarget.innerHTML)}
                                    style={{ minHeight: block.type === 'divider' ? '10px' : '20px' }}
                                />

                                {/* Insert point between blocks */}
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
                                <p className="text-lg mb-2">Start building your blog post</p>
                                <p className="text-sm">Click a block type from the left panel to add content</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SEO sidebar (right) */}
                <div className="w-72 bg-[#1a1d27] border-l border-white/5 overflow-y-auto flex-shrink-0">
                    {/* SEO Tab Selector */}
                    <div className="flex border-b border-white/5">
                        {['seo', 'settings'].map(t => (
                            <button
                                key={t}
                                onClick={() => setSeoTab(t)}
                                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${seoTab === t ? 'text-brand-400 border-b-2 border-brand-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {t === 'seo' ? 'SEO' : 'Settings'}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-4">
                        {seoTab === 'seo' && (
                            <>
                                {/* Google Preview */}
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Google Preview</p>
                                    <div className="bg-white rounded-lg p-3 text-left">
                                        <p className="text-blue-700 text-sm font-medium truncate">{seoTitle || post.title || 'Page Title'}</p>
                                        <p className="text-green-700 text-xs truncate">dealfindai.com/blog/{slug}</p>
                                        <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">{seoDesc || excerpt || 'Add a meta description...'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Title Tag <span className={`ml-1 ${seoTitleLen >= 50 && seoTitleLen <= 60 ? 'text-green-400' : seoTitleLen > 60 ? 'text-red-400' : 'text-gray-600'}`}>{seoTitleLen}/60</span>
                                    </label>
                                    <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="input-field text-sm" placeholder="SEO-friendly title..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                        Meta Description <span className={`ml-1 ${seoDescLen >= 150 && seoDescLen <= 160 ? 'text-green-400' : seoDescLen > 160 ? 'text-red-400' : 'text-gray-600'}`}>{seoDescLen}/160</span>
                                    </label>
                                    <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="input-field text-sm" rows="3" placeholder="Compelling meta description..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Target Keyword</label>
                                    <input type="text" value={seoKeyword} onChange={e => setSeoKeyword(e.target.value)} className="input-field text-sm" placeholder="e.g. golf swing tips" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Excerpt</label>
                                    <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="input-field text-sm" rows="2" placeholder="Short description for blog index..." />
                                </div>
                            </>
                        )}

                        {seoTab === 'settings' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Slug</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-600">/blog/</span>
                                        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="input-field text-sm flex-1" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm" placeholder="e.g. Weight Loss" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Tags (comma-separated)</label>
                                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="input-field text-sm" placeholder="golf, fitness, tips" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Link to Funnel</label>
                                    <select value={funnelId} onChange={e => setFunnelId(e.target.value)} className="input-field text-sm">
                                        <option value="">— None —</option>
                                        {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Featured Image URL</label>
                                    <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} className="input-field text-sm" placeholder="https://..." />
                                    {featuredImage && (
                                        <img src={featuredImage} alt="Featured" className="mt-2 rounded-lg w-full h-28 object-cover" />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
