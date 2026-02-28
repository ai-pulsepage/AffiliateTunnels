import { useEffect, useState } from 'react';
import { emailApi, funnelApi, mediaApi } from '../lib/api';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Mail, Pencil, Copy, Eye, X, Code2, FileText, Wand2, Send, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['affiliate', 'welcome', 'followup', 'promo', 'newsletter'];
const MERGE_TAGS = [
    { tag: '{{name}}', label: 'First Name' },
    { tag: '{{email}}', label: 'Email' },
    { tag: '{{funnel_name}}', label: 'Funnel Name' },
    { tag: '{{unsubscribe_url}}', label: 'Unsubscribe Link' },
    { tag: '{{date}}', label: 'Current Date' },
];

export default function EmailBuilder() {
    const [templates, setTemplates] = useState([]);
    const [funnels, setFunnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [preview, setPreview] = useState(null);
    const [filter, setFilter] = useState('');
    const [funnelFilter, setFunnelFilter] = useState('');
    const [mode, setMode] = useState('quick'); // 'quick' or 'advanced'
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaLoading, setMediaLoading] = useState(false);

    // Quick Create fields
    const [quickFromName, setQuickFromName] = useState('');
    const [quickBody, setQuickBody] = useState('');
    const [quickCtaText, setQuickCtaText] = useState('');
    const [quickCtaLink, setQuickCtaLink] = useState('');
    const [quickFunnel, setQuickFunnel] = useState('');

    useEffect(() => { loadTemplates(); loadFunnels(); }, []);

    async function loadTemplates() {
        try { const d = await emailApi.listTemplates(); setTemplates(d.templates || []); }
        catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function loadFunnels() {
        try { const d = await funnelApi.list(); setFunnels(d.funnels || []); }
        catch (err) { console.error(err); }
    }

    function startCreate() {
        setMode('quick');
        setQuickFromName('');
        setQuickBody('');
        setQuickCtaText('Click Here →');
        setQuickCtaLink('');
        setQuickFunnel('');
        setEditing({ name: '', subject: '', html_content: '', text_content: '', category: 'affiliate', funnel_id: null });
    }

    function startEdit(template) {
        setMode('advanced');
        setEditing({ ...template });
    }

    function convertQuickToHtml() {
        const linkUrl = quickCtaLink || '#';
        const paragraphs = quickBody.split('\n').filter(l => l.trim()).map(line => {
            const trimmed = line.trim();
            // Lines starting with >> or » become inline text links
            if (trimmed.startsWith('>>') || trimmed.startsWith('»')) {
                const text = trimmed.replace(/^(>>|»)\s*/, '');
                return `<p style="color:#475569; font-size:16px; line-height:1.6; margin:16px 0;"><a href="${linkUrl}" style="color:#d97706; font-weight:700; text-decoration:underline;">${text}</a></p>`;
            }
            // Lines starting with From: auto-set the from name field
            if (trimmed.toLowerCase().startsWith('from:')) return '';
            // Lines starting with Subject: — skip (handled separately)
            if (trimmed.toLowerCase().startsWith('subject:')) return '';
            // Lines starting with ✅ or • or - become list items
            if (trimmed.startsWith('✅') || trimmed.startsWith('•') || trimmed.startsWith('-')) {
                return `<p style="color:#475569; font-size:16px; line-height:1.6; padding-left:8px;">${trimmed}</p>`;
            }
            // Lines starting with ⇒ or => become CTA links (inline)
            if (trimmed.startsWith('⇒') || trimmed.startsWith('=>')) {
                const text = trimmed.replace(/^(⇒|=>)\s*/, '');
                return `<p style="color:#475569; font-size:16px; line-height:1.6; margin:16px 0;"><a href="${linkUrl}" style="color:#d97706; font-weight:700; text-decoration:underline;">${text}</a></p>`;
            }
            return `<p style="color:#475569; font-size:16px; line-height:1.6;">${trimmed}</p>`;
        }).filter(Boolean).join('\n    ');

        const ctaHtml = quickCtaText && quickCtaLink ? `
<div style="margin:32px 0; text-align:center;">
  <a href="${quickCtaLink}" style="display:inline-block; padding:16px 40px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-weight:800; font-size:18px; border-radius:12px; text-decoration:none; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
    ${quickCtaText}
  </a>
</div>` : '';

        return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:Georgia, 'Times New Roman', serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 24px;">
${paragraphs}
${ctaHtml}
<p style="color:#94a3b8; font-size:12px; margin-top:40px; text-align:center; border-top:1px solid #e2e8f0; padding-top:20px;">
  <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a>
</p>
  </div>
</body>
</html>`;
    }

    async function handleSave() {
        if (!editing.name || !editing.subject) {
            toast.error('Name and subject are required');
            return;
        }

        let finalData = { ...editing };

        if (mode === 'quick') {
            const html = convertQuickToHtml();
            finalData.html_content = html;
            finalData.text_content = `${quickBody}\n\n${quickCtaText}: ${quickCtaLink}`;
        }

        if (!finalData.html_content) {
            toast.error('Email content is required');
            return;
        }

        try {
            if (finalData.id) {
                const d = await emailApi.updateTemplate(finalData.id, finalData);
                setTemplates(prev => prev.map(t => t.id === finalData.id ? d.template : t));
                toast.success('Template updated');
            } else {
                const d = await emailApi.createTemplate(finalData);
                setTemplates(prev => [d.template, ...prev]);
                toast.success('Template created');
            }
            setEditing(null);
        } catch (err) { toast.error(err.message); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this template?')) return;
        try {
            await emailApi.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success('Deleted');
        } catch (err) { toast.error(err.message); }
    }

    function handleDuplicate(template) {
        setMode('advanced');
        setEditing({
            name: template.name + ' (Copy)',
            subject: template.subject,
            html_content: template.html_content,
            text_content: template.text_content || '',
            category: template.category || '',
        });
    }

    function insertMergeTag(tag) {
        if (!editing) return;
        if (mode === 'quick') {
            setQuickBody(prev => prev + tag);
        } else {
            setEditing(prev => ({ ...prev, html_content: prev.html_content + tag }));
        }
    }

    async function openMediaPicker() {
        setShowMediaPicker(true);
        setMediaLoading(true);
        try {
            const d = await mediaApi.list({ page: 1 });
            const images = (d.files || []).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.filename));
            setMediaFiles(images);
        } catch (err) { toast.error('Failed to load media'); }
        finally { setMediaLoading(false); }
    }

    function insertImage(file) {
        const imgTag = `<img src="${file.url}" alt="${file.filename}" />`;
        if (mode === 'quick') {
            setQuickBody(prev => prev + '\n' + imgTag + '\n');
        } else {
            setEditing(prev => ({ ...prev, html_content: prev.html_content + '\n' + imgTag + '\n' }));
        }
        setShowMediaPicker(false);
        toast.success('Image inserted');
    }

    let filtered = filter ? templates.filter(t => t.category === filter) : templates;
    if (funnelFilter) filtered = filtered.filter(t => t.funnel_id === funnelFilter);

    // ── List view ──
    if (!editing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Emails</h1>
                        <p className="text-sm text-gray-500 mt-1">{templates.length} templates</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {funnels.length > 0 && (
                            <select value={funnelFilter} onChange={e => setFunnelFilter(e.target.value)} className="input-field w-auto text-sm">
                                <option value="">All Funnels</option>
                                {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        )}
                        <button onClick={startCreate} className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Quick Create
                        </button>
                    </div>
                </div>

                {/* Drip Campaigns section */}
                {funnels.length > 0 && (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3">
                            <Send className="w-4 h-4 text-brand-400" />
                            <h2 className="text-sm font-semibold text-white">Drip Campaigns</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Set up automated email sequences for your funnels. Each funnel can have its own drip campaign.</p>
                        <div className="flex flex-wrap gap-2">
                            {funnels.map(f => (
                                <Link key={f.id} to={`/drip/${f.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-700 text-gray-300 text-xs font-medium rounded-lg hover:bg-brand-600/20 hover:text-brand-400 transition-colors">
                                    <Mail className="w-3 h-3" /> {f.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category filter */}
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filter ? 'bg-brand-600 text-white' : 'bg-surface-800 text-gray-400 hover:text-white'}`}>
                        All
                    </button>
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filter === c ? 'bg-brand-600 text-white' : 'bg-surface-800 text-gray-400 hover:text-white'}`}>
                            {c}
                        </button>
                    ))}
                </div>

                {loading ? <div className="card animate-pulse h-48" /> : filtered.length === 0 ? (
                    <div className="card text-center py-12">
                        <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">{filter ? `No ${filter} templates.` : 'No email templates yet.'}</p>
                        <p className="text-sm text-gray-600 mt-2">Click "Quick Create" to paste your email copy</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(t => (
                            <div key={t.id} className="card-hover group">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{t.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">{t.subject}</p>
                                    </div>
                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <button onClick={() => setPreview(t)} className="p-1.5 hover:bg-white/5 rounded-lg" title="Preview">
                                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                        <button onClick={() => startEdit(t)} className="p-1.5 hover:bg-white/5 rounded-lg" title="Edit">
                                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                        <button onClick={() => handleDuplicate(t)} className="p-1.5 hover:bg-white/5 rounded-lg" title="Duplicate">
                                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    {t.category && <span className="badge badge-info text-[10px]">{t.category}</span>}
                                    <span className="text-[10px] text-gray-600">{new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Preview Modal */}
                {preview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreview(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-b">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{preview.name}</p>
                                    <p className="text-xs text-gray-500">Subject: {preview.subject}</p>
                                </div>
                                <button onClick={() => setPreview(null)} className="p-1"><X className="w-4 h-4 text-gray-500" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[70vh]"
                                dangerouslySetInnerHTML={{ __html: preview.html_content }} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Editor view ──
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setEditing(null)} className="btn-secondary text-sm">← Back</button>
                    <h1 className="text-xl font-bold text-white">{editing.id ? 'Edit Template' : 'New Template'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mode Toggle */}
                    <div className="flex bg-surface-800 rounded-lg p-0.5">
                        <button
                            onClick={() => setMode('quick')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'quick' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileText className="w-3.5 h-3.5" /> Quick Create
                        </button>
                        <button
                            onClick={() => {
                                if (mode === 'quick' && quickBody) {
                                    setEditing(prev => ({ ...prev, html_content: convertQuickToHtml() }));
                                }
                                setMode('advanced');
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'advanced' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Code2 className="w-3.5 h-3.5" /> Advanced HTML
                        </button>
                    </div>
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Save Template
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Fields */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Template Name</label>
                                <input type="text" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Spanish Orange Trick" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Category</label>
                                <select value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} className="input-field">
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                                </select>
                            </div>
                        </div>
                        {mode === 'quick' && (
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">From Name</label>
                                <input type="text" value={quickFromName} onChange={e => setQuickFromName(e.target.value)} className="input-field" placeholder="e.g. Spanish Orange Trick" />
                                <p className="text-xs text-gray-600 mt-1">The sender name shown in the inbox</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Subject Line</label>
                            <input type="text" value={editing.subject} onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} className="input-field" placeholder="e.g. Soak this orange peel in hot water to melt belly fat" />
                        </div>
                    </div>

                    {mode === 'quick' ? (
                        /* ── QUICK CREATE MODE ── */
                        <>
                            <div className="card">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Email Body
                                        <span className="text-[10px] text-gray-500 font-normal">— just paste your copy</span>
                                    </label>
                                    <div className="flex gap-1">
                                        <button onClick={openMediaPicker} className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Image
                                        </button>
                                        {MERGE_TAGS.slice(0, 2).map(m => (
                                            <button key={m.tag} onClick={() => insertMergeTag(m.tag)} className="text-[10px] px-2 py-1 bg-brand-500/10 text-brand-400 rounded-md hover:bg-brand-500/20 transition-colors" title={m.label}>
                                                {m.tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={quickBody}
                                    onChange={e => setQuickBody(e.target.value)}
                                    className="input-field leading-relaxed"
                                    style={{ minHeight: 300 }}
                                    placeholder={`Paste your manufacturer email swipe here...

Supported formatting:
  >> link text   →  becomes a clickable link
  ✅ or • or -   →  formatted as a list item
  From: name     →  auto-sets sender name
  Subject: line  →  auto-sets subject line

Example:
From: Spanish Orange Trick
Subject: Soak this orange peel to melt belly fat

Doctors are SHOCKED. A clinical nutritionist just discovered...

>> Click here to discover the orange peel trick`}
                                />
                            </div>

                            <div className="card space-y-4">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-brand-400" /> Call-to-Action & Links
                                </h3>
                                {/* Funnel selector for auto-fill */}
                                {funnels.length > 0 && (
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Link to Funnel (auto-fills URL)</label>
                                        <select
                                            value={quickFunnel}
                                            onChange={e => {
                                                setQuickFunnel(e.target.value);
                                                const f = funnels.find(f => f.id === e.target.value);
                                                if (f) {
                                                    setQuickCtaLink(`https://dealfindai.com/p/${f.slug}`);
                                                    setEditing(prev => ({ ...prev, funnel_id: f.id }));
                                                } else {
                                                    setEditing(prev => ({ ...prev, funnel_id: null }));
                                                }
                                            }}
                                            className="input-field text-sm"
                                        >
                                            <option value="">Select a funnel...</option>
                                            {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                                        <input type="text" value={quickCtaText} onChange={e => setQuickCtaText(e.target.value)} className="input-field" placeholder="e.g. Try the Spanish Orange Trick →" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Hop Link / Landing Page URL</label>
                                        <input type="text" value={quickCtaLink} onChange={e => setQuickCtaLink(e.target.value)} className="input-field" placeholder="https://xxxxx.hop.clickbank.net" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600">This URL is used for the CTA button AND all <code className="text-brand-400">&gt;&gt;</code> inline links in your email.</p>
                            </div>
                        </>
                    ) : (
                        /* ── ADVANCED HTML MODE ── */
                        <>
                            <div className="card">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Code2 className="w-4 h-4" /> HTML Content
                                    </label>
                                    <div className="flex gap-1">
                                        <button onClick={openMediaPicker} className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Image
                                        </button>
                                        {MERGE_TAGS.slice(0, 3).map(m => (
                                            <button key={m.tag} onClick={() => insertMergeTag(m.tag)} className="text-[10px] px-2 py-1 bg-brand-500/10 text-brand-400 rounded-md hover:bg-brand-500/20 transition-colors" title={m.label}>
                                                {m.tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={editing.html_content}
                                    onChange={e => setEditing(p => ({ ...p, html_content: e.target.value }))}
                                    className="input-field font-mono text-xs leading-relaxed"
                                    style={{ minHeight: 400 }}
                                    placeholder="<html>...</html>"
                                />
                            </div>

                            <div className="card">
                                <label className="block text-sm text-gray-300 mb-1">Plain Text Version (optional)</label>
                                <textarea
                                    value={editing.text_content || ''}
                                    onChange={e => setEditing(p => ({ ...p, text_content: e.target.value }))}
                                    className="input-field h-32 font-mono text-xs"
                                    placeholder="Plain text fallback..."
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Merge tags + preview */}
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-semibold text-white mb-3">Merge Tags</h3>
                        <div className="space-y-2">
                            {MERGE_TAGS.map(m => (
                                <button key={m.tag} onClick={() => insertMergeTag(m.tag)} className="w-full flex items-center justify-between px-3 py-2 bg-surface-800 rounded-lg hover:bg-surface-700 transition-colors text-left">
                                    <span className="text-sm text-gray-300">{m.label}</span>
                                    <code className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">{m.tag}</code>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-white mb-3">Live Preview</h3>
                        {(mode === 'quick' ? quickBody : editing.html_content) ? (
                            <div className="bg-white rounded-xl p-4 max-h-96 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{
                                    __html: mode === 'quick'
                                        ? convertQuickToHtml().replace(/\{\{name\}\}/gi, 'Sarah').replace(/\{\{email\}\}/gi, 'sarah@example.com')
                                        : editing.html_content.replace(/\{\{name\}\}/gi, 'Sarah').replace(/\{\{email\}\}/gi, 'sarah@example.com')
                                }} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">
                                {mode === 'quick' ? 'Paste your email copy to see a live preview' : 'Enter HTML to see preview'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMediaPicker(false)}>
                    <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                            <h2 className="font-semibold text-white flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-emerald-400" /> Insert Image from Media
                            </h2>
                            <button onClick={() => setShowMediaPicker(false)} className="p-1 hover:bg-white/5 rounded-lg">
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[65vh]">
                            {mediaLoading ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-surface-800 animate-pulse rounded-lg" />)}
                                </div>
                            ) : mediaFiles.length === 0 ? (
                                <div className="text-center py-12">
                                    <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No images in your media library.</p>
                                    <p className="text-sm text-gray-600 mt-1">Go to Media to upload images first.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {mediaFiles.map(file => (
                                        <button
                                            key={file.id}
                                            onClick={() => insertImage(file)}
                                            className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all"
                                        >
                                            <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 px-3 py-1.5 rounded-lg">Insert</span>
                                            </div>
                                            <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-gray-300 px-2 py-1 truncate">{file.filename}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
