import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Settings, Package, Mail, ExternalLink, ChevronDown, ChevronUp, Users, FileText, Loader2, Link2, Pencil, Save, X, Store, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

const DEFAULT_FORM = { subdomain: '', site_title: '', site_subtitle: '', accent_color: '#6366f1' };
const COLOR_PRESETS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#1e293b'];
const SOCIAL_FIELDS = [['instagram', '📷 Instagram'], ['twitter', '𝕏 Twitter / X'], ['tiktok', '🎵 TikTok'], ['youtube', '▶️ YouTube'], ['facebook', '📘 Facebook'], ['linkedin', '💼 LinkedIn']];

function FooterSocialsEditor({ ms, onSaved }) {
    const parseSocials = (s) => { try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); } catch { return {}; } };
    const [companyName, setCompanyName] = useState(ms.footer_company_name || '');
    const [website, setWebsite] = useState(ms.footer_website || '');
    const [socials, setSocials] = useState(parseSocials(ms.footer_socials));
    const [saving, setSaving] = useState(false);

    async function saveFooter() {
        setSaving(true);
        try {
            await api(`/storefront/microsites/${ms.id}`, {
                method: 'PUT',
                body: { footer_company_name: companyName, footer_website: website, footer_socials: socials }
            });
            toast.success('Footer & socials saved!');
            if (onSaved) onSaved();
        } catch (err) { toast.error(err.message || 'Failed to save'); }
        setSaving(false);
    }

    return (
        <div className="bg-surface-700 rounded-xl p-4">
            <h5 className="text-white text-sm font-semibold flex items-center gap-2 mb-3"><Globe className="w-4 h-4 text-cyan-400" /> Footer & Socials</h5>
            <p className="text-gray-400 text-xs mb-3">These appear in the footer across all pages. Leave blank to hide.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company Name" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website URL (https://...)" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
            </div>
            <p className="text-gray-400 text-xs mt-3 mb-2">Social links (paste full URLs)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SOCIAL_FIELDS.map(([key, label]) => (
                    <input key={key} value={socials[key] || ''} onChange={e => setSocials({ ...socials, [key]: e.target.value })}
                        placeholder={label} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm placeholder:text-gray-500" />
                ))}
            </div>
            <div className="flex justify-end mt-3">
                <button onClick={saveFooter} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                    {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : '💾 Save Footer & Socials'}
                </button>
            </div>
        </div>
    );
}

export default function Microsites() {
    const [microsites, setMicrosites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [products, setProducts] = useState({});
    const [form, setForm] = useState({ ...DEFAULT_FORM });
    const [addingProduct, setAddingProduct] = useState(null); // microsite id
    const [productForm, setProductForm] = useState({ source_url: '', affiliate_url: '' });
    const [generating, setGenerating] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // product id being edited
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [stores, setStores] = useState([]);
    const [pushingProductId, setPushingProductId] = useState(null);

    useEffect(() => { 
        loadMicrosites(); 
        loadStores();
    }, []);

    async function loadStores() {
        try {
            const data = await api('/stores');
            setStores(data.stores?.filter(s => s.is_active) || []);
        } catch (err) { console.error('Failed to load stores', err); }
    }

    async function loadMicrosites() {
        try {
            const data = await api('/storefront/microsites');
            setMicrosites(data.microsites || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    async function createMicrosite(e) {
        e.preventDefault();
        try {
            await api('/storefront/microsites', { body: form });
            toast.success('Microsite created!');
            setShowCreate(false);
            setForm({ ...DEFAULT_FORM });
            loadMicrosites();
        } catch (err) {
            toast.error(err.message || 'Failed');
        }
    }

    async function deleteMicrosite(id) {
        if (!confirm('Delete this microsite and all its products?')) return;
        await api(`/storefront/microsites/${id}`, { method: 'DELETE' });
        loadMicrosites();
    }

    async function toggleOptin(ms) {
        await api(`/storefront/microsites/${ms.id}`, { body: { optin_enabled: !ms.optin_enabled }, method: 'PUT' });
        loadMicrosites();
    }

    async function updateOptinText(id, field, value) {
        await api(`/storefront/microsites/${id}`, { body: { [field]: value }, method: 'PUT' });
    }

    async function loadProducts(msId) {
        try {
            const data = await api(`/storefront/microsites/${msId}/products`);
            setProducts(prev => ({ ...prev, [msId]: data.products || [] }));
        } catch (err) { console.error(err); }
    }

    async function generateProduct(msId) {
        if (!productForm.source_url || !productForm.affiliate_url) {
            toast.error('Both source URL and affiliate URL are required');
            return;
        }
        setGenerating(true);
        try {
            await api(`/storefront/microsites/${msId}/generate-product`, {
                body: { source_url: productForm.source_url, affiliate_url: productForm.affiliate_url }
            });
            toast.success('Product generated! AI scraped and built the page.');
            setAddingProduct(null);
            setProductForm({ source_url: '', affiliate_url: '' });
            loadProducts(msId);
        } catch (err) {
            toast.error(err.message || 'Failed to generate product');
        }
        setGenerating(false);
    }

    async function deleteProduct(msId, prodId) {
        if (!confirm('Remove this product?')) return;
        try {
            await api(`/storefront/microsites/${msId}/products/${prodId}`, { method: 'DELETE' });
            toast.success('Product removed');
            loadProducts(msId);
        } catch (err) { toast.error(err.message || 'Failed to remove product'); }
    }

    function startEditProduct(product) {
        setEditingProduct(product.id);
        setEditForm({
            affiliate_url: product.affiliate_url || '',
            product_name: product.product_name || '',
            product_desc: product.product_desc || '',
            price_label: product.price_label || '',
            card_image_url: product.card_image_url || '',
            price: product.price || '',
            compare_at_price: product.compare_at_price || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            weight: product.weight || '',
            weight_unit: product.weight_unit || 'kg',
            tags: product.tags || '',
            vendor_name: product.vendor_name || ''
        });
    }

    async function updateProduct(msId, prodId) {
        setSavingEdit(true);
        try {
            await api(`/storefront/microsites/${msId}/products/${prodId}`, {
                method: 'PUT',
                body: editForm
            });
            toast.success('Product updated!');
            setEditingProduct(null);
            setEditForm({});
            loadProducts(msId);
        } catch (err) { toast.error(err.message || 'Failed to update product'); }
        setSavingEdit(false);
    }

    async function pushProductToStore(storeId, prodId, product) {
        setPushingProductId(prodId);
        try {
            const data = await api(`/stores/push`, {
                method: 'POST',
                body: { store_id: storeId, product_id: prodId, product_data: product }
            });
            toast.success(`Product pushed to store!`);
            window.open(data.syncData.external_url, '_blank');
        } catch (err) {
            toast.error(err.message || 'Failed to push product');
        }
        setPushingProductId(null);
    }

    async function deleteMicrosite(msId, subdomain) {
        if (!confirm(`Delete ${subdomain}.dealfindai.com and ALL its products? This cannot be undone.`)) return;
        try {
            await api(`/storefront/microsites/${msId}`, { method: 'DELETE' });
            toast.success('Microsite deleted');
            loadMicrosites();
        } catch (err) { toast.error(err.message || 'Failed to delete microsite'); }
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
                        <Globe className="w-7 h-7 text-brand-400" /> Content Network
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage brand properties, subdomains, and monitor content staleness</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Brand Property
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
                            <div className="flex items-center gap-2 flex-wrap">
                                {COLOR_PRESETS.map(c => (
                                    <button key={c} type="button" onClick={() => setForm({ ...form, accent_color: c })} className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: form.accent_color === c ? '#fff' : 'transparent' }} />
                                ))}
                                <div className="relative" style={{ zIndex: 100 }}>
                                    <input type="color" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0" style={{ WebkitAppearance: 'none', border: 'none' }} title="Custom color" />
                                </div>
                                <input value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })} className="w-24 px-2 py-1.5 bg-surface-700 border border-white/10 rounded-lg text-white text-xs font-mono" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Target Store URL (optional)</label>
                            <input value={form.target_store_url || ''} onChange={e => setForm({ ...form, target_store_url: e.target.value })} placeholder="https://my-shopify-store.com" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Target Store Name (optional)</label>
                            <input value={form.target_store_name || ''} onChange={e => setForm({ ...form, target_store_name: e.target.value })} placeholder="My Store" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setShowCreate(false); setForm({ ...DEFAULT_FORM }); }} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium">Create Brand Property</button>
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
                    {microsites.map(ms => {
                        let stalenessColor = 'text-green-400 bg-green-400/10';
                        let stalenessText = 'Fresh';
                        if (ms.staleness_level === 'no_content') { stalenessColor = 'text-gray-400 bg-gray-400/10'; stalenessText = 'No Content'; }
                        else if (ms.staleness_level === 'critical') { stalenessColor = 'text-red-400 bg-red-400/10'; stalenessText = `Critical (${ms.days_since_content}d)`; }
                        else if (ms.staleness_level === 'overdue') { stalenessColor = 'text-orange-400 bg-orange-400/10'; stalenessText = `Overdue (${ms.days_since_content}d)`; }
                        else if (ms.days_since_content !== null) { stalenessText = `Fresh (${ms.days_since_content}d)`; }

                        return (
                        <div key={ms.id} className="bg-surface-800 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(ms.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ms.accent_color}20` }}>
                                        <Globe className="w-5 h-5" style={{ color: ms.accent_color }} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm flex items-center gap-2">
                                            {ms.site_title || 'Untitled Brand'}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${stalenessColor}`}>{stalenessText}</span>
                                        </h4>
                                        <p className="text-gray-500 text-xs">{ms.subdomain}.dealfindai.com · {ms.product_count || 0} products {ms.target_store_name ? `· Target: ${ms.target_store_name}` : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`https://${ms.subdomain}.dealfindai.com`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-brand-400">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button onClick={e => { e.stopPropagation(); deleteMicrosite(ms.id, ms.subdomain); }} className="p-2 text-gray-600 hover:text-red-400 transition-colors" title="Delete microsite">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {expanded === ms.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </div>
                            </div>

                            {expanded === ms.id && (
                                <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                    {/* Store Target Settings */}
                                    <div className="bg-surface-700 rounded-xl p-4">
                                        <h5 className="text-white text-sm font-semibold flex items-center gap-2 mb-3"><Link2 className="w-4 h-4 text-brand-400" /> Target Store & Staleness</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Target Store URL</label>
                                                <input defaultValue={ms.target_store_url || ''} onBlur={e => api(`/storefront/microsites/${ms.id}`, { method: 'PUT', body: { target_store_url: e.target.value } })} placeholder="https://store.com" className="w-full px-3 py-2 bg-surface-600 border border-white/10 rounded-lg text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Target Store Name</label>
                                                <input defaultValue={ms.target_store_name || ''} onBlur={e => api(`/storefront/microsites/${ms.id}`, { method: 'PUT', body: { target_store_name: e.target.value } })} placeholder="Store Name" className="w-full px-3 py-2 bg-surface-600 border border-white/10 rounded-lg text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Staleness Threshold (Days)</label>
                                                <input type="number" defaultValue={ms.staleness_days || 7} onBlur={e => api(`/storefront/microsites/${ms.id}`, { method: 'PUT', body: { staleness_days: parseInt(e.target.value) || 7 } }).then(loadMicrosites)} className="w-full px-3 py-2 bg-surface-600 border border-white/10 rounded-lg text-white text-sm" />
                                            </div>
                                        </div>
                                    </div>

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

                                    {/* Footer & Socials Settings */}
                                    <FooterSocialsEditor ms={ms} onSaved={loadMicrosites} />

                                    {/* Products */}
                                    <div className="bg-surface-700 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="text-white text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-amber-400" /> Products ({(products[ms.id] || []).length})</h5>
                                            <button onClick={() => setAddingProduct(addingProduct === ms.id ? null : ms.id)} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add Product
                                            </button>
                                        </div>

                                        {/* Add Product Form */}
                                        {addingProduct === ms.id && (
                                            <div className="bg-surface-600 rounded-xl p-4 mb-3 space-y-3">
                                                {/* Mode Toggle */}
                                                <div className="flex gap-1 bg-surface-700 rounded-lg p-1">
                                                    <button onClick={() => setProductForm({ ...productForm, mode: 'scrape' })} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${(productForm.mode || 'scrape') === 'scrape' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>🔗 Scrape URL</button>
                                                    <button onClick={() => setProductForm({ ...productForm, mode: 'manual' })} className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${productForm.mode === 'manual' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}>✏️ Manual Entry</button>
                                                </div>

                                                {(productForm.mode || 'scrape') === 'scrape' ? (
                                                    /* Scrape Mode */
                                                    <div className="space-y-2">
                                                        <p className="text-gray-400 text-xs">Paste the manufacturer page URL (source to scrape) and your affiliate/landing page URL.</p>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block mb-1">Source URL — product page to scrape</label>
                                                            <input value={productForm.source_url || ''} onChange={e => setProductForm({ ...productForm, source_url: e.target.value })} placeholder="https://manufacturer.com/product-page" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block mb-1">Affiliate URL — your landing page or affiliate link</label>
                                                            <input value={productForm.affiliate_url || ''} onChange={e => setProductForm({ ...productForm, affiliate_url: e.target.value })} placeholder="https://manufacturer.com/product?ref=yourcode" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => generateProduct(ms.id)} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                                                {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Package className="w-3.5 h-3.5" /> Generate Product Page</>}
                                                            </button>
                                                            <button onClick={() => { setAddingProduct(null); setProductForm({ source_url: '', affiliate_url: '' }); }} className="px-3 py-2 text-gray-400 text-sm">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Manual Entry Mode */
                                                    <div className="space-y-2">
                                                        <p className="text-gray-400 text-xs">For SaaS, digital products, or sites the scraper can't reach. Enter details manually.</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 block mb-1">Product / Software Name *</label>
                                                                <input value={productForm.product_name || ''} onChange={e => setProductForm({ ...productForm, product_name: e.target.value })} placeholder="BizLeadFinders" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500 block mb-1">Price (displayed)</label>
                                                                <input value={productForm.price || ''} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="$49/mo or Free trial" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block mb-1">Description (2-3 sentences that sell it)</label>
                                                            <textarea value={productForm.description || ''} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="South Florida's premier lead generation and automation software. Find qualified leads, automate outreach, and grow your business with AI-powered tools." rows={2} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm resize-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block mb-1">Key Features (one per line)</label>
                                                            <textarea value={productForm.features || ''} onChange={e => setProductForm({ ...productForm, features: e.target.value })} placeholder={"AI-powered lead search\nAutomated email drips\nReal-time analytics\nCRM integration"} rows={3} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm resize-none" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block mb-1">Selling Points / Badges (one per line)</label>
                                                            <textarea value={productForm.selling_points || ''} onChange={e => setProductForm({ ...productForm, selling_points: e.target.value })} placeholder={"2-Week Free Trial\n24/7 Support\nNo Credit Card Required\nCancel Anytime"} rows={2} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm resize-none" />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-xs text-gray-500 block mb-1">CTA / Signup URL *</label>
                                                                <input value={productForm.cta_url || ''} onChange={e => setProductForm({ ...productForm, cta_url: e.target.value })} placeholder="https://bizleadfinders.com/signup" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500 block mb-1">Product Screenshot / Image URL</label>
                                                                <input value={productForm.image_url || ''} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://example.com/screenshot.png" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={async () => {
                                                                if (!productForm.product_name || !productForm.cta_url) { toast.error('Product name and CTA URL are required'); return; }
                                                                setGenerating(true);
                                                                try {
                                                                    await api(`/storefront/microsites/${ms.id}/manual-product`, {
                                                                        body: {
                                                                            product_name: productForm.product_name, description: productForm.description,
                                                                            features: productForm.features, price: productForm.price, cta_url: productForm.cta_url,
                                                                            image_url: productForm.image_url, selling_points: productForm.selling_points
                                                                        }
                                                                    });
                                                                    toast.success('Product added!');
                                                                    setAddingProduct(null); setProductForm({ source_url: '', affiliate_url: '' });
                                                                    loadProducts(ms.id);
                                                                } catch (err) { toast.error(err.message || 'Failed to add product'); }
                                                                setGenerating(false);
                                                            }} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                                                {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Plus className="w-3.5 h-3.5" /> Add Product</>}
                                                            </button>
                                                            <button onClick={() => { setAddingProduct(null); setProductForm({ source_url: '', affiliate_url: '' }); }} className="px-3 py-2 text-gray-400 text-sm">Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(products[ms.id] || []).length > 0 ? (
                                            <div className="space-y-2">
                                                {products[ms.id].map(p => (
                                                    <div key={p.id} className="bg-surface-600 rounded-lg overflow-hidden">
                                                        <div className="flex items-center justify-between px-3 py-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {p.card_image_url && <img src={p.card_image_url} className="w-8 h-8 rounded object-cover" />}
                                                                {!p.card_image_url && p.images && (() => { try { const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; return imgs[0] ? <img src={imgs[0]} className="w-8 h-8 rounded object-cover" /> : null; } catch { return null; } })()}
                                                                <div className="min-w-0">
                                                                    <span className="text-white text-sm truncate block">{p.product_name}</span>
                                                                    {p.affiliate_url && <span className="text-gray-500 text-[10px] truncate block max-w-[300px]" title={p.affiliate_url}>🔗 {p.affiliate_url.substring(0, 50)}{p.affiliate_url.length > 50 ? '…' : ''}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button onClick={() => editingProduct === p.id ? setEditingProduct(null) : startEditProduct(p)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${editingProduct === p.id ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}>
                                                                    <Pencil className="w-3 h-3" /> Edit
                                                                </button>
                                                                <a href={`https://${ms.subdomain}.dealfindai.com/${p.slug}`} target="_blank" rel="noopener" className="text-xs text-brand-400 hover:text-brand-300">View</a>
                                                                <button onClick={() => deleteProduct(ms.id, p.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                                                {stores.length > 0 && (
                                                                    <div className="relative group/push inline-block ml-1">
                                                                        <button className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded transition-colors hover:bg-blue-500/20">
                                                                            {pushingProductId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Store className="w-3 h-3" />} Push
                                                                        </button>
                                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover/push:opacity-100 group-hover/push:visible transition-all z-10 flex flex-col p-1">
                                                                            {stores.map(store => (
                                                                                <button key={store.id} onClick={() => pushProductToStore(store.id, p.id, p)} className="text-left px-3 py-2 text-xs text-white hover:bg-white/10 rounded font-medium flex items-center gap-2">
                                                                                    <ShoppingBag className="w-3 h-3" /> {store.store_name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Inline Edit Panel */}
                                                        {editingProduct === p.id && (
                                                            <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
                                                                <div>
                                                                    <label className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block mb-0.5">Affiliate / CTA URL</label>
                                                                    <input value={editForm.affiliate_url || ''} onChange={e => setEditForm({ ...editForm, affiliate_url: e.target.value })} placeholder="https://your-affiliate-link.com" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-amber-500/30 rounded-lg text-sm focus:border-amber-500 focus:outline-none" />
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    <div>
                                                                        <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Product Name</label>
                                                                        <input value={editForm.product_name || ''} onChange={e => setEditForm({ ...editForm, product_name: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Price Label</label>
                                                                        <input value={editForm.price_label || ''} onChange={e => setEditForm({ ...editForm, price_label: e.target.value })} placeholder="$4,999" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Description</label>
                                                                    <textarea value={editForm.product_desc || ''} onChange={e => setEditForm({ ...editForm, product_desc: e.target.value })} rows={2} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm resize-none" />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Card Image URL</label>
                                                                    <input value={editForm.card_image_url || ''} onChange={e => setEditForm({ ...editForm, card_image_url: e.target.value })} placeholder="https://example.com/image.jpg" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
                                                                </div>

                                                                <div className="border-t border-white/10 mt-3 pt-3">
                                                                    <p className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-1"><Store className="w-3 h-3" /> E-commerce Sync Fields</p>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Numeric Price</label>
                                                                            <input value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="499.99" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Compare At Price</label>
                                                                            <input value={editForm.compare_at_price || ''} onChange={e => setEditForm({ ...editForm, compare_at_price: e.target.value })} placeholder="699.99" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">SKU</label>
                                                                            <input value={editForm.sku || ''} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Barcode</label>
                                                                            <input value={editForm.barcode || ''} onChange={e => setEditForm({ ...editForm, barcode: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Weight</label>
                                                                            <input value={editForm.weight || ''} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Unit (kg/lb)</label>
                                                                            <input value={editForm.weight_unit || ''} onChange={e => setEditForm({ ...editForm, weight_unit: e.target.value })} placeholder="kg" style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Vendor Name</label>
                                                                            <input value={editForm.vendor_name || ''} onChange={e => setEditForm({ ...editForm, vendor_name: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Tags (comma-separated)</label>
                                                                            <input value={editForm.tags || ''} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} style={{ background: '#1a1a2e', color: '#fff' }} className="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs" />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2 pt-1">
                                                                    <button onClick={() => updateProduct(ms.id, p.id)} disabled={savingEdit} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors">
                                                                        {savingEdit ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <><Save className="w-3 h-3" /> Save Changes</>}
                                                                    </button>
                                                                    <button onClick={() => { setEditingProduct(null); setEditForm({}); }} className="px-3 py-2 text-gray-400 hover:text-white text-xs transition-colors">Cancel</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No products yet. Click "Add Product" above.</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => deleteMicrosite(ms.id, ms.subdomain)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Delete Brand Property
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
