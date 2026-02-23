import { useEffect, useState } from 'react';
import { affiliateApi, clickbankApi } from '../lib/api';
import {
    Link2, Plus, Trash2, Copy, ExternalLink, Search, DollarSign,
    FileText, Image, Video, Upload, Eye, BarChart3, MousePointerClick
} from 'lucide-react';
import toast from 'react-hot-toast';

const CONTENT_TYPES = [
    { value: 'email_swipe', label: 'Email Swipes', icon: FileText },
    { value: 'landing_copy', label: 'Landing Copy', icon: FileText },
    { value: 'demographics', label: 'Demographics', icon: BarChart3 },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'document', label: 'Documents', icon: FileText },
];

export default function AffiliateTools() {
    const [tab, setTab] = useState('hoplinks');
    const [hopLinks, setHopLinks] = useState([]);
    const [cloakedLinks, setCloakedLinks] = useState([]);
    const [content, setContent] = useState([]);
    const [sales, setSales] = useState([]);
    const [totalCommission, setTotalCommission] = useState('0.00');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [contentFilter, setContentFilter] = useState('');

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [h, c, ct] = await Promise.all([
                affiliateApi.listHopLinks(),
                affiliateApi.listCloakedLinks(),
                affiliateApi.listContent(),
            ]);
            setHopLinks(h.hopLinks || []);
            setCloakedLinks(c.links || []);
            setContent(ct.content || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function loadSales() {
        try {
            const d = await clickbankApi.getSales();
            setSales(d.sales || []);
            setTotalCommission(d.totalCommission || '0.00');
        } catch (err) { toast.error(err.message); }
    }

    useEffect(() => { if (tab === 'sales') loadSales(); }, [tab]);

    function copyUrl(url) { navigator.clipboard.writeText(url); toast.success('Copied!'); }

    async function handleDeleteHopLink(id) {
        if (!confirm('Delete this HopLink?')) return;
        try { await affiliateApi.deleteHopLink(id); setHopLinks(p => p.filter(h => h.id !== id)); toast.success('Deleted'); }
        catch (err) { toast.error(err.message); }
    }

    async function handleDeleteCloakedLink(id) {
        if (!confirm('Delete this link?')) return;
        try { await affiliateApi.deleteCloakedLink(id); setCloakedLinks(p => p.filter(l => l.id !== id)); toast.success('Deleted'); }
        catch (err) { toast.error(err.message); }
    }

    async function handleDeleteContent(id) {
        if (!confirm('Delete this content?')) return;
        try { await affiliateApi.deleteContent(id); setContent(p => p.filter(c => c.id !== id)); toast.success('Deleted'); }
        catch (err) { toast.error(err.message); }
    }

    const tabs = [
        { id: 'hoplinks', label: 'HopLinks', count: hopLinks.length },
        { id: 'cloaked', label: 'Cloaked Links', count: cloakedLinks.length },
        { id: 'content', label: 'Content Library', count: content.length },
        { id: 'sales', label: 'ClickBank Sales', icon: DollarSign },
    ];

    const filteredContent = contentFilter ? content.filter(c => c.content_type === contentFilter) : content;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Affiliate Tools</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your ClickBank affiliate assets</p>
                </div>
                {tab !== 'sales' && (
                    <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-800 rounded-xl p-1 overflow-x-auto">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        {t.icon && <t.icon className="w-3.5 h-3.5" />}
                        {t.label}
                        {t.count !== undefined && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{t.count}</span>}
                    </button>
                ))}
            </div>

            {loading ? <div className="card animate-pulse h-48" /> : (
                <>
                    {/* ── HopLinks Tab ── */}
                    {tab === 'hoplinks' && (
                        hopLinks.length === 0 ? (
                            <EmptyState icon={Link2} text="No HopLinks yet. Create a ClickBank HopLink to get started." />
                        ) : (
                            <div className="space-y-2">
                                {hopLinks.map(h => (
                                    <div key={h.id} className="card flex items-center justify-between group py-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-white">{h.product_name || h.vendor_id}</h3>
                                                <span className="badge badge-info text-[10px]">{h.vendor_id}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{h.hop_url}</p>
                                            <p className="text-[10px] text-gray-600 mt-1">Affiliate: {h.affiliate_id}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copyUrl(h.hop_url)} className="p-2 hover:bg-white/10 rounded-lg" title="Copy URL">
                                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                            </button>
                                            <a href={h.hop_url} target="_blank" rel="noopener" className="p-2 hover:bg-white/10 rounded-lg" title="Open">
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                            </a>
                                            <button onClick={() => handleDeleteHopLink(h.id)} className="p-2 hover:bg-red-500/10 rounded-lg" title="Delete">
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ── Cloaked Links Tab ── */}
                    {tab === 'cloaked' && (
                        cloakedLinks.length === 0 ? (
                            <EmptyState icon={Link2} text="No cloaked links yet. Create short, branded redirect links." />
                        ) : (
                            <div className="space-y-2">
                                {cloakedLinks.map(l => (
                                    <div key={l.id} className="card flex items-center justify-between group py-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-white">/go/{l.slug}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MousePointerClick className="w-3 h-3" />
                                                    <span>{l.total_clicks || 0} clicks</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 truncate max-w-lg">{l.destination_url}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => copyUrl(`${window.location.origin}/go/${l.slug}`)} className="p-2 hover:bg-white/10 rounded-lg" title="Copy short URL">
                                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                                            </button>
                                            <a href={l.destination_url} target="_blank" rel="noopener" className="p-2 hover:bg-white/10 rounded-lg" title="Open destination">
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                            </a>
                                            <button onClick={() => handleDeleteCloakedLink(l.id)} className="p-2 hover:bg-red-500/10 rounded-lg" title="Delete">
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* ── Content Library Tab ── */}
                    {tab === 'content' && (
                        <div className="space-y-4">
                            {/* Type filter */}
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => setContentFilter('')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!contentFilter ? 'bg-brand-600 text-white' : 'bg-surface-800 text-gray-400 hover:text-white'}`}>
                                    All ({content.length})
                                </button>
                                {CONTENT_TYPES.map(t => {
                                    const count = content.filter(c => c.content_type === t.value).length;
                                    return (
                                        <button key={t.value} onClick={() => setContentFilter(t.value)} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${contentFilter === t.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-gray-400 hover:text-white'}`}>
                                            <t.icon className="w-3 h-3" /> {t.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredContent.length === 0 ? (
                                <EmptyState icon={FileText} text={contentFilter ? `No ${contentFilter} content.` : 'No affiliate content yet. Upload swipes, copy, images, or docs.'} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredContent.map(c => (
                                        <div key={c.id} className="card-hover group">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white truncate">{c.title || 'Untitled'}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{c.product_name}</p>
                                                </div>
                                                <button onClick={() => handleDeleteContent(c.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                </button>
                                            </div>
                                            {c.body && <p className="text-xs text-gray-400 line-clamp-3 mb-2">{c.body}</p>}
                                            {c.file_url && (
                                                <a href={c.file_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                                                    <Eye className="w-3 h-3" /> View file
                                                </a>
                                            )}
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className="badge badge-info text-[10px]">{c.content_type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── ClickBank Sales Tab ── */}
                    {tab === 'sales' && (
                        <div className="space-y-4">
                            {/* Commission summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="stat-card">
                                    <p className="stat-value text-emerald-400">${totalCommission}</p>
                                    <p className="stat-label">Total Commission</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-value">{sales.length}</p>
                                    <p className="stat-label">Transactions</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-value">{sales.filter(s => s.event_type === 'SALE').length}</p>
                                    <p className="stat-label">Sales</p>
                                </div>
                            </div>

                            {sales.length === 0 ? (
                                <EmptyState icon={DollarSign} text="No ClickBank sales recorded yet. Sales appear after your IPN webhook processes them." />
                            ) : (
                                <div className="card p-0 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Transaction</th>
                                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Product</th>
                                                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                                                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Commission</th>
                                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {sales.map(s => (
                                                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-5 py-3 text-sm text-white font-mono">{s.transaction_id?.slice(0, 12)}...</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`badge text-[10px] ${s.event_type === 'SALE' ? 'badge-success' :
                                                            s.event_type === 'RFND' ? 'badge-warning' :
                                                                s.event_type === 'CGBK' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                    'badge-info'
                                                            }`}>
                                                            {s.event_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-sm text-gray-300">{s.product_id || '—'}</td>
                                                    <td className="px-5 py-3 text-sm text-white text-right">${parseFloat(s.amount || 0).toFixed(2)}</td>
                                                    <td className="px-5 py-3 text-sm text-emerald-400 text-right font-medium">${parseFloat(s.commission || 0).toFixed(2)}</td>
                                                    <td className="px-5 py-3 text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreate && (
                <CreateModal tab={tab} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData(); }} />
            )}
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="card text-center py-12">
            <Icon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{text}</p>
        </div>
    );
}

function CreateModal({ tab, onClose, onCreated }) {
    const [mode, setMode] = useState(tab === 'content' ? 'content' : tab === 'cloaked' ? 'cloaked' : 'hoplink');
    const [hopForm, setHopForm] = useState({ affiliate_id: '', vendor_id: '', product_name: '' });
    const [cloakForm, setCloakForm] = useState({ slug: '', destination_url: '' });
    const [contentForm, setContentForm] = useState({ content_type: 'email_swipe', title: '', body: '', product_name: '' });
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (mode === 'hoplink') {
                await affiliateApi.createHopLink(hopForm);
            } else if (mode === 'cloaked') {
                await affiliateApi.createCloakedLink(cloakForm);
            } else {
                await affiliateApi.uploadContent(contentForm);
            }
            toast.success('Created!');
            onCreated();
        } catch (err) { toast.error(err.message); }
        finally { setSubmitting(false); }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="card w-full max-w-md animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-white mb-4">Create Affiliate Asset</h2>

                {/* Mode toggle */}
                <div className="flex gap-1 bg-surface-800 rounded-xl p-1 mb-5">
                    {[
                        { id: 'hoplink', label: 'HopLink' },
                        { id: 'cloaked', label: 'Cloaked Link' },
                        { id: 'content', label: 'Content' },
                    ].map(m => (
                        <button key={m.id} type="button" onClick={() => setMode(m.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === m.id ? 'bg-brand-600 text-white' : 'text-gray-400'}`}>
                            {m.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'hoplink' && (<>
                        <input type="text" value={hopForm.affiliate_id} onChange={e => setHopForm(p => ({ ...p, affiliate_id: e.target.value }))} className="input-field" placeholder="Your Affiliate ID (nickname)" required />
                        <input type="text" value={hopForm.vendor_id} onChange={e => setHopForm(p => ({ ...p, vendor_id: e.target.value }))} className="input-field" placeholder="Vendor ID (from ClickBank)" required />
                        <input type="text" value={hopForm.product_name} onChange={e => setHopForm(p => ({ ...p, product_name: e.target.value }))} className="input-field" placeholder="Product name (optional)" />
                    </>)}

                    {mode === 'cloaked' && (<>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Short Slug</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">/go/</span>
                                <input type="text" value={cloakForm.slug} onChange={e => setCloakForm(p => ({ ...p, slug: e.target.value }))} className="input-field" placeholder="my-offer" required />
                            </div>
                        </div>
                        <input type="url" value={cloakForm.destination_url} onChange={e => setCloakForm(p => ({ ...p, destination_url: e.target.value }))} className="input-field" placeholder="Destination URL (your affiliate link)" required />
                    </>)}

                    {mode === 'content' && (<>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Content Type</label>
                            <select value={contentForm.content_type} onChange={e => setContentForm(p => ({ ...p, content_type: e.target.value }))} className="input-field">
                                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <input type="text" value={contentForm.title} onChange={e => setContentForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Title" required />
                        <input type="text" value={contentForm.product_name} onChange={e => setContentForm(p => ({ ...p, product_name: e.target.value }))} className="input-field" placeholder="Product / Vendor name" />
                        <textarea value={contentForm.body} onChange={e => setContentForm(p => ({ ...p, body: e.target.value }))} className="input-field h-32" placeholder="Content body (email swipe text, landing copy, etc.)" />
                    </>)}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating...' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
