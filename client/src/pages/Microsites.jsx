import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Settings, Package, Mail, ExternalLink, ChevronDown, ChevronUp, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function Microsites() {
    const [microsites, setMicrosites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [products, setProducts] = useState({});
    const [form, setForm] = useState({ subdomain: '', site_title: '', site_subtitle: '', accent_color: '#6366f1' });

    useEffect(() => { loadMicrosites(); }, []);

    async function loadMicrosites() {
        try {
            const res = await fetch(`${API}/api/storefront/microsites`, { credentials: 'include' });
            const data = await res.json();
            setMicrosites(data.microsites || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    async function createMicrosite(e) {
        e.preventDefault();
        const res = await fetch(`${API}/api/storefront/microsites`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            toast.success('Microsite created!');
            setShowCreate(false);
            setForm({ subdomain: '', site_title: '', site_subtitle: '', accent_color: '#6366f1' });
            loadMicrosites();
        } else {
            const err = await res.json();
            toast.error(err.error || 'Failed');
        }
    }

    async function deleteMicrosite(id) {
        if (!confirm('Delete this microsite and all its products?')) return;
        await fetch(`${API}/api/storefront/microsites/${id}`, { method: 'DELETE', credentials: 'include' });
        loadMicrosites();
    }

    async function toggleOptin(ms) {
        await fetch(`${API}/api/storefront/microsites/${ms.id}`, {
            method: 'PUT', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optin_enabled: !ms.optin_enabled }),
        });
        loadMicrosites();
    }

    async function updateOptinText(id, field, value) {
        await fetch(`${API}/api/storefront/microsites/${id}`, {
            method: 'PUT', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value }),
        });
    }

    async function loadProducts(msId) {
        const res = await fetch(`${API}/api/storefront/microsites/${msId}/products`, { credentials: 'include' });
        const data = await res.json();
        setProducts(prev => ({ ...prev, [msId]: data.products || [] }));
    }

    function toggleExpand(id) {
        if (expanded === id) {
            setExpanded(null);
        } else {
            setExpanded(id);
            if (!products[id]) loadProducts(id);
        }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Globe className="w-7 h-7 text-brand-400" /> Microsites
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your subdomain sites, products, and opt-in settings</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Microsite
                </button>
            </div>

            {showCreate && (
                <form onSubmit={createMicrosite} className="bg-surface-800 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="text-white font-semibold">Create Microsite</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Subdomain</label>
                            <div className="flex items-center">
                                <input value={form.subdomain} onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="outdoorliving" className="flex-1 px-3 py-2.5 bg-surface-700 border border-white/10 rounded-l-lg text-white text-sm" required />
                                <span className="px-3 py-2.5 bg-surface-600 border border-white/10 border-l-0 rounded-r-lg text-gray-400 text-sm">.dealfindai.com</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Site Title</label>
                            <input value={form.site_title} onChange={e => setForm({ ...form, site_title: e.target.value })} placeholder="Outdoor Living Essentials" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Subtitle</label>
                            <input value={form.site_subtitle} onChange={e => setForm({ ...form, site_subtitle: e.target.value })} placeholder="Your guide to the best outdoor products" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Accent Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" />
                                <input value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="flex-1 px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm font-mono" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium">Create Microsite</button>
                    </div>
                </form>
            )}

            {microsites.length === 0 ? (
                <div className="text-center py-16">
                    <Globe className="w-14 h-14 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">No Microsites Yet</h3>
                    <p className="text-gray-400 text-sm">Create your first microsite to launch a subdomain site</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {microsites.map(ms => (
                        <div key={ms.id} className="bg-surface-800 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(ms.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ms.accent_color}20` }}>
                                        <Globe className="w-5 h-5" style={{ color: ms.accent_color }} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">{ms.subdomain}.dealfindai.com</h4>
                                        <p className="text-gray-500 text-xs">{ms.site_title || 'Untitled'} · {ms.product_count || 0} products</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={`https://${ms.subdomain}.dealfindai.com`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-brand-400">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    {expanded === ms.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </div>
                            </div>

                            {expanded === ms.id && (
                                <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                    {/* Opt-in Settings */}
                                    <div className="bg-surface-700 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="text-white text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-purple-400" /> Email Opt-in</h5>
                                            <button onClick={() => toggleOptin(ms)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${ms.optin_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {ms.optin_enabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                        {ms.optin_enabled && (
                                            <div className="space-y-2">
                                                <input defaultValue={ms.optin_headline || ''} onBlur={e => updateOptinText(ms.id, 'optin_headline', e.target.value)} placeholder="Headline: Join now to get 10% off!" className="w-full px-3 py-2 bg-surface-600 border border-white/10 rounded-lg text-white text-sm" />
                                                <input defaultValue={ms.optin_incentive || ''} onBlur={e => updateOptinText(ms.id, 'optin_incentive', e.target.value)} placeholder="Incentive: Get exclusive deals and new blog alerts" className="w-full px-3 py-2 bg-surface-600 border border-white/10 rounded-lg text-white text-sm" />
                                                <p className="text-gray-600 text-xs">Category tag: <span className="text-brand-400 font-mono">{ms.subdomain}</span> — subscribers auto-enrolled in matching drip campaign</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Products */}
                                    <div className="bg-surface-700 rounded-xl p-4">
                                        <h5 className="text-white text-sm font-semibold flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-amber-400" /> Products ({(products[ms.id] || []).length})</h5>
                                        {(products[ms.id] || []).length > 0 ? (
                                            <div className="space-y-2">
                                                {products[ms.id].map(p => (
                                                    <div key={p.id} className="flex items-center justify-between bg-surface-600 rounded-lg px-3 py-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {p.images?.[0] && <img src={typeof p.images === 'string' ? JSON.parse(p.images)[0] : p.images[0]} className="w-8 h-8 rounded object-cover" />}
                                                            <span className="text-white text-sm truncate">{p.product_name}</span>
                                                        </div>
                                                        <a href={`https://${ms.subdomain}.dealfindai.com/${p.slug}`} target="_blank" rel="noopener" className="text-xs text-brand-400 hover:text-brand-300">View</a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No products yet. Add products from the microsite product manager.</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => deleteMicrosite(ms.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete Microsite
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
