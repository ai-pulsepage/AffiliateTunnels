import { useEffect, useState } from 'react';
import { affiliateApi, clickbankApi, storefrontApi } from '../lib/api';
import {
    Link2, Plus, Trash2, Copy, ExternalLink, Search, DollarSign,
    FileText, Image, Video, Upload, Eye, BarChart3, MousePointerClick,
    Store, Settings, FolderPlus, Package, EyeOff, Palette, Tag, GripVertical, Edit2, Check, X as XIcon
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
    const [tab, setTab] = useState('storefront');
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
        { id: 'storefront', label: 'Storefront', icon: Store },
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
                    <p className="text-sm text-gray-500 mt-1">Manage your storefront, links, and affiliate assets</p>
                </div>
                {tab !== 'sales' && tab !== 'storefront' && (
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

            {loading && tab !== 'storefront' ? <div className="card animate-pulse h-48" /> : (
                <>
                    {/* ── Storefront Tab ── */}
                    {tab === 'storefront' && <StorefrontManager />}

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

// ═══════════════════════════════════════════════════════════
// Storefront Manager — Full admin panel for the public showcase
// ═══════════════════════════════════════════════════════════

function StorefrontManager() {
    const [subTab, setSubTab] = useState('products');
    const [settings, setSettings] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showcaseItems, setShowcaseItems] = useState([]);
    const [publishedPages, setPublishedPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showAddProduct, setShowAddProduct] = useState(false);

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        setLoading(true);
        try {
            const [s, c, items, pages] = await Promise.all([
                storefrontApi.getSettings(),
                storefrontApi.listCategories(),
                storefrontApi.listShowcase(),
                storefrontApi.listPublishedPages(),
            ]);
            setSettings(s.settings || {});
            setCategories(c.categories || []);
            setShowcaseItems(items.items || []);
            setPublishedPages(pages.pages || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    // ─── Settings ───
    async function saveSettings() {
        setSaving(true);
        try {
            const res = await storefrontApi.updateSettings(settings);
            setSettings(res.settings);
            toast.success('Storefront settings saved!');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    // ─── Categories ───
    async function addCategory() {
        if (!newCategoryName.trim()) return;
        try {
            const res = await storefrontApi.createCategory(newCategoryName.trim());
            setCategories(p => [...p, res.category]);
            setNewCategoryName('');
            toast.success('Category added!');
        } catch (err) { toast.error(err.message); }
    }

    async function deleteCategory(id) {
        if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
        try {
            await storefrontApi.deleteCategory(id);
            setCategories(p => p.filter(c => c.id !== id));
            toast.success('Category deleted');
        } catch (err) { toast.error(err.message); }
    }

    // ─── Showcase Items ───
    async function addToShowcase(page, categoryId) {
        try {
            const res = await storefrontApi.addToShowcase({
                page_id: page.id,
                category_id: categoryId || null,
                display_title: page.seo_title || page.name,
                display_desc: '',
                card_image_url: page.og_image_url || '',
            });
            setShowcaseItems(p => [...p, { ...res.item, page_name: page.name, funnel_name: page.funnel_name }]);
            toast.success('Added to storefront!');
        } catch (err) { toast.error(err.message); }
    }

    async function updateShowcaseItem(id, data) {
        try {
            const res = await storefrontApi.updateShowcase(id, data);
            setShowcaseItems(p => p.map(i => i.id === id ? { ...i, ...res.item } : i));
        } catch (err) { toast.error(err.message); }
    }

    async function removeFromShowcase(id) {
        if (!confirm('Remove from storefront?')) return;
        try {
            await storefrontApi.removeFromShowcase(id);
            setShowcaseItems(p => p.filter(i => i.id !== id));
            toast.success('Removed from storefront');
        } catch (err) { toast.error(err.message); }
    }

    if (loading) return <div className="card animate-pulse h-64" />;

    const subTabs = [
        { id: 'products', label: 'Showcase Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'settings', label: 'Branding', icon: Palette },
    ];

    // Pages not yet in showcase
    const availablePages = publishedPages.filter(p => !p.showcase_id);

    return (
        <div className="space-y-5">
            {/* Storefront preview link */}
            <div className="card bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Store className="w-4 h-4 text-indigo-400" />
                            Public Storefront
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            This is what distributors and visitors see at <span className="text-white font-medium">dealfindai.com</span>
                        </p>
                    </div>
                    <a href="/?mode=storefront" target="_blank" rel="noopener" className="btn-secondary flex items-center gap-2 text-sm">
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </a>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2">
                {subTabs.map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${subTab === t.id
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                            : 'bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700'}`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ── Products Sub-Tab ── */}
            {subTab === 'products' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            {showcaseItems.length} product{showcaseItems.length !== 1 ? 's' : ''} on storefront
                        </p>
                        <button onClick={() => setShowAddProduct(true)} className="btn-primary flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>

                    {showcaseItems.length === 0 ? (
                        <EmptyState icon={Package} text="No products on your storefront yet. Add published landing pages to display them publicly." />
                    ) : (
                        <div className="space-y-3">
                            {showcaseItems.map(item => (
                                <ShowcaseItemCard
                                    key={item.id}
                                    item={item}
                                    categories={categories}
                                    onUpdate={updateShowcaseItem}
                                    onRemove={removeFromShowcase}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Product Modal */}
                    {showAddProduct && (
                        <AddProductModal
                            pages={availablePages}
                            categories={categories}
                            onAdd={addToShowcase}
                            onClose={() => setShowAddProduct(false)}
                        />
                    )}
                </div>
            )}

            {/* ── Categories Sub-Tab ── */}
            {subTab === 'categories' && (
                <div className="space-y-4">
                    {/* Add category */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addCategory()}
                            className="input-field flex-1"
                            placeholder="New category name (e.g. Saunas & Spas)"
                        />
                        <button onClick={addCategory} className="btn-primary flex items-center gap-2">
                            <FolderPlus className="w-4 h-4" /> Add
                        </button>
                    </div>

                    <p className="text-xs text-gray-500">
                        Categories only appear on the storefront when they contain visible products.
                    </p>

                    {categories.length === 0 ? (
                        <EmptyState icon={Tag} text="No categories yet. Create categories to organize your storefront products." />
                    ) : (
                        <div className="space-y-2">
                            {categories.map(cat => {
                                const itemCount = showcaseItems.filter(i => i.category_id === cat.id).length;
                                return (
                                    <div key={cat.id} className="card flex items-center justify-between py-3 group">
                                        <div className="flex items-center gap-3">
                                            <Tag className="w-4 h-4 text-brand-400" />
                                            <div>
                                                <p className="font-medium text-white">{cat.name}</p>
                                                <p className="text-xs text-gray-500">{itemCount} product{itemCount !== 1 ? 's' : ''} · /{cat.slug}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {itemCount > 0 && (
                                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    Visible
                                                </span>
                                            )}
                                            {itemCount === 0 && (
                                                <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full border border-gray-500/20">
                                                    Hidden (empty)
                                                </span>
                                            )}
                                            <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Settings Sub-Tab ── */}
            {subTab === 'settings' && settings && (
                <div className="card space-y-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Palette className="w-5 h-5 text-brand-400" />
                        Storefront Branding
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Brand Name</label>
                            <input type="text" value={settings.brand_name || ''} onChange={e => setSettings(p => ({ ...p, brand_name: e.target.value }))} className="input-field" placeholder="DealFindAI" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Accent Color</label>
                            <div className="flex gap-2">
                                <input type="color" value={settings.accent_color || '#6366f1'} onChange={e => setSettings(p => ({ ...p, accent_color: e.target.value }))} className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer" />
                                <input type="text" value={settings.accent_color || '#6366f1'} onChange={e => setSettings(p => ({ ...p, accent_color: e.target.value }))} className="input-field flex-1" placeholder="#6366f1" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Hero Headline</label>
                        <input type="text" value={settings.hero_headline || ''} onChange={e => setSettings(p => ({ ...p, hero_headline: e.target.value }))} className="input-field" placeholder="Premium Products, Curated For You" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Hero Subtitle</label>
                        <textarea value={settings.hero_subtitle || ''} onChange={e => setSettings(p => ({ ...p, hero_subtitle: e.target.value }))} className="input-field h-20" placeholder="We empower the future of AI and product marketing..." />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Logo URL</label>
                        <input type="url" value={settings.logo_url || ''} onChange={e => setSettings(p => ({ ...p, logo_url: e.target.value }))} className="input-field" placeholder="https://..." />
                        <p className="text-xs text-gray-600 mt-1">Upload your logo to Media Library first, then paste the URL here.</p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Footer Text</label>
                        <input type="text" value={settings.footer_text || ''} onChange={e => setSettings(p => ({ ...p, footer_text: e.target.value }))} className="input-field" placeholder="© DealFindAI. All rights reserved." />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button onClick={saveSettings} disabled={saving} className="btn-primary">
                            {saving ? 'Saving...' : 'Save Branding'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Showcase Item Card — inline editing for title, desc, category, visibility
// ═══════════════════════════════════════════════════════════

function ShowcaseItemCard({ item, categories, onUpdate, onRemove }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        display_title: item.display_title || '',
        display_desc: item.display_desc || '',
        category_id: item.category_id || '',
        price_label: item.price_label || '',
        card_image_url: item.card_image_url || '',
    });

    function save() {
        onUpdate(item.id, form);
        setEditing(false);
        toast.success('Updated');
    }

    return (
        <div className="card group">
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg bg-surface-800 overflow-hidden flex-shrink-0">
                    {(item.card_image_url || item.og_image_url) ? (
                        <img src={item.card_image_url || item.og_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Image className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="space-y-2">
                            <input type="text" value={form.display_title} onChange={e => setForm(p => ({ ...p, display_title: e.target.value }))} className="input-field text-sm" placeholder="Display title" />
                            <input type="text" value={form.display_desc} onChange={e => setForm(p => ({ ...p, display_desc: e.target.value }))} className="input-field text-sm" placeholder="Short description" />
                            <div className="flex gap-2">
                                <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="input-field text-sm flex-1">
                                    <option value="">No category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <input type="text" value={form.price_label} onChange={e => setForm(p => ({ ...p, price_label: e.target.value }))} className="input-field text-sm w-32" placeholder="Price label" />
                            </div>
                            <input type="url" value={form.card_image_url} onChange={e => setForm(p => ({ ...p, card_image_url: e.target.value }))} className="input-field text-sm" placeholder="Card image URL" />
                            <div className="flex gap-2">
                                <button onClick={save} className="btn-primary text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                                <button onClick={() => setEditing(false)} className="btn-secondary text-xs">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-white truncate">{item.display_title || item.page_name}</h3>
                                {item.category_name && (
                                    <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
                                        {item.category_name}
                                    </span>
                                )}
                                {item.price_label && (
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                                        {item.price_label}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{item.display_desc || `From: ${item.funnel_name}`}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.is_published
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {item.is_published !== false ? 'Published' : 'Page Unpublished'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                {!editing && (
                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onUpdate(item.id, { is_visible: !item.is_visible })} className="p-2 hover:bg-white/10 rounded-lg" title={item.is_visible ? 'Hide' : 'Show'}>
                            {item.is_visible !== false ? <Eye className="w-3.5 h-3.5 text-gray-400" /> : <EyeOff className="w-3.5 h-3.5 text-yellow-400" />}
                        </button>
                        <button onClick={() => setEditing(true)} className="p-2 hover:bg-white/10 rounded-lg" title="Edit">
                            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => onRemove(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg" title="Remove">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Add Product Modal — pick from published pages
// ═══════════════════════════════════════════════════════════

function AddProductModal({ pages, categories, onAdd, onClose }) {
    const [selectedCategory, setSelectedCategory] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="card w-full max-w-lg max-h-[80vh] flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Add to Storefront</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg">
                        <XIcon className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {categories.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-sm text-gray-300 mb-1">Assign to Category</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field">
                            <option value="">No category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2">
                    {pages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No published pages available. Publish a landing page first.</p>
                        </div>
                    ) : (
                        pages.map(page => (
                            <div key={page.id} className="flex items-center justify-between py-3 px-4 bg-surface-800 rounded-xl hover:bg-surface-700 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white text-sm truncate">{page.seo_title || page.name}</p>
                                    <p className="text-xs text-gray-500">{page.funnel_name}</p>
                                </div>
                                <button
                                    onClick={() => { onAdd(page, selectedCategory); onClose(); }}
                                    className="btn-primary text-xs flex items-center gap-1 ml-3"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
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
