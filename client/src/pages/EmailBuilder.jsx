import { useEffect, useState } from 'react';
import { emailApi } from '../lib/api';
import { Plus, Trash2, Mail, Pencil, Copy, Eye, X, ChevronDown, Code2 } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null = list, object = editor
    const [preview, setPreview] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => { loadTemplates(); }, []);

    async function loadTemplates() {
        try { const d = await emailApi.listTemplates(); setTemplates(d.templates || []); }
        catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    function startCreate() {
        setEditing({ name: '', subject: '', html_content: getDefaultTemplate(), text_content: '', category: 'affiliate' });
    }

    function startEdit(template) {
        setEditing({ ...template });
    }

    async function handleSave() {
        if (!editing.name || !editing.subject || !editing.html_content) {
            toast.error('Name, subject, and content are required');
            return;
        }
        try {
            if (editing.id) {
                const d = await emailApi.updateTemplate(editing.id, editing);
                setTemplates(prev => prev.map(t => t.id === editing.id ? d.template : t));
                toast.success('Template updated');
            } else {
                const d = await emailApi.createTemplate(editing);
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
        setEditing(prev => ({ ...prev, html_content: prev.html_content + tag }));
    }

    const filtered = filter ? templates.filter(t => t.category === filter) : templates;

    // ── List view ──
    if (!editing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Email Templates</h1>
                        <p className="text-sm text-gray-500 mt-1">{templates.length} templates</p>
                    </div>
                    <button onClick={startCreate} className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Template
                    </button>
                </div>

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
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Save Template
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Fields */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Template Name</label>
                            <input type="text" value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Welcome Email" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Subject Line</label>
                            <input type="text" value={editing.subject} onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} className="input-field" placeholder="e.g. Welcome to {{funnel_name}}, {{name}}!" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Category</label>
                            <select value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} className="input-field">
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Code2 className="w-4 h-4" /> HTML Content
                            </label>
                            <div className="flex gap-1">
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
                        <h3 className="font-semibold text-white mb-3">Preview</h3>
                        {editing.html_content ? (
                            <div className="bg-white rounded-xl p-4 max-h-80 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: editing.html_content }} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">Enter HTML to see preview</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getDefaultTemplate() {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:system-ui, -apple-system, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 24px;">
    <h1 style="color:#1e293b; font-size:24px; margin-bottom:16px;">Hey {{name}},</h1>
    <p style="color:#475569; font-size:16px; line-height:1.6;">
      Your email content goes here. Use merge tags like {{name}} to personalize.
    </p>
    <div style="margin:32px 0; text-align:center;">
      <a href="#" style="display:inline-block; padding:14px 32px; background:#6366f1; color:#fff; font-weight:700; border-radius:10px; text-decoration:none;">
        Click Here →
      </a>
    </div>
    <p style="color:#94a3b8; font-size:12px; margin-top:32px; text-align:center;">
      <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}
