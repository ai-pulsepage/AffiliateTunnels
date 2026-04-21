import { useState, useEffect } from 'react';
import { Search, LineChart, TrendingUp, Briefcase, ChevronRight, Save, MessageSquare, Loader2, RefreshCw, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function SupplierSearch() {
    const [activeTab, setActiveTab] = useState('discover');
    
    // Discover State
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [discovered, setDiscovered] = useState([]);
    const [trends, setTrends] = useState(null);
    const [savingId, setSavingId] = useState(null);

    // CRM State
    const [crmItems, setCrmItems] = useState([]);
    const [loadingCrm, setLoadingCrm] = useState(false);
    const [expandedCrmId, setExpandedCrmId] = useState(null);
    const [generatingPitchId, setGeneratingPitchId] = useState(null);
    const [microsites, setMicrosites] = useState([]);

    useEffect(() => {
        if (activeTab === 'crm') {
            loadCrm();
            loadMicrosites();
        }
    }, [activeTab]);

    async function loadMicrosites() {
        try {
            const data = await api('/storefront/microsites');
            setMicrosites(data.microsites || []);
        } catch (err) {
            console.error('Failed to load microsites', err);
        }
    }

    // ─── DISCOVER TAB ────────────────────────────────────────────────────────

    async function handleSearch(e) {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setDiscovered([]);
        setTrends(null);

        try {
            // Load manufacturers
            const data = await api(`/suppliers/search?niche=${encodeURIComponent(searchQuery)}`);
            setDiscovered(data.manufacturers || []);
            
            // Try to load trends (don't block on it)
            try {
                const trendData = await api(`/suppliers/trends?keyword=${encodeURIComponent(searchQuery)}`);
                setTrends(trendData);
            } catch (trendErr) {
                console.error("Trends not available", trendErr);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to search');
        }
        setSearching(false);
    }

    async function saveToCrm(manufacturer) {
        setSavingId(manufacturer.id);
        try {
            await api('/suppliers/crm', {
                method: 'POST',
                body: { manufacturer_id: manufacturer.id }
            });
            toast.success('Saved to My Manufacturers!');
        } catch (err) {
            toast.error(err.message || 'Failed to save');
        }
        setSavingId(null);
    }

    // ─── CRM TAB ─────────────────────────────────────────────────────────────

    async function loadCrm() {
        setLoadingCrm(true);
        try {
            const data = await api('/suppliers/crm');
            setCrmItems(data.saved || []);
        } catch (err) {
            console.error(err);
        }
        setLoadingCrm(false);
    }

    async function updateCrmNotes(id, notes, status) {
        try {
            await api(`/suppliers/crm/${id}`, {
                method: 'PUT',
                body: { custom_notes: notes, status }
            });
            toast.success('Notes saved');
            loadCrm(); // Reload to get fresh data
        } catch (err) {
            toast.error('Failed to save notes');
        }
    }

    async function updateLinkedMicrosite(id, linked_microsite_id) {
        try {
            await api(`/suppliers/crm/${id}`, {
                method: 'PUT',
                body: { linked_microsite_id: linked_microsite_id || null }
            });
            toast.success('Storefront linked successfully!');
            loadCrm();
        } catch (err) {
            toast.error('Failed to link storefront');
        }
    }

    async function updateEcommerceUrl(id, url) {
        try {
            await api(`/suppliers/crm/${id}`, {
                method: 'PUT',
                body: { ecommerce_store_url: url || null }
            });
            toast.success('E-commerce URL saved!');
            loadCrm();
        } catch (err) {
            toast.error('Failed to save e-commerce URL');
        }
    }

    async function generatePitch(id) {
        setGeneratingPitchId(id);
        try {
            const data = await api(`/suppliers/crm/${id}/generate-pitch`, {
                method: 'POST'
            });
            toast.success('Pitch generated!');
            loadCrm();
        } catch (err) {
            toast.error(err.message || 'Failed to generate pitch');
        }
        setGeneratingPitchId(null);
    }

    async function removeFromCrm(id) {
        if (!confirm('Remove this manufacturer from your CRM?')) return;
        try {
            await api(`/suppliers/crm/${id}`, { method: 'DELETE' });
            loadCrm();
        } catch (err) {
            toast.error('Failed to remove');
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-indigo-400" /> Supplier Intelligence
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Discover high-ticket manufacturers and manage your B2B outreach.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === 'discover' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Search className="w-4 h-4" /> Discover Companies
                </button>
                <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === 'crm' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Briefcase className="w-4 h-4" /> My Manufacturers
                </button>
            </div>

            {/* TAB: DISCOVER */}
            {activeTab === 'discover' && (
                <div className="space-y-6">
                    <form onSubmit={handleSearch} className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter a product niche (e.g. Premium Saunas, Commercial Espresso Machines)..."
                            className="w-full bg-[#131320] border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={searching || !searchQuery.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </button>
                    </form>

                    {searching && (
                        <div className="py-20 text-center animate-pulse">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Our AI agents are sourcing the best manufacturers for your niche...</p>
                        </div>
                    )}

                    {!searching && discovered.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {/* Trend Mini-Widget */}
                            <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-indigo-300 font-bold flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-5 h-5" /> Market Demand Verified
                                    </h3>
                                    <p className="text-gray-300 text-sm">We've found {discovered.length} premium suppliers for "{searchQuery}".</p>
                                </div>
                                {trends && <div className="text-xs text-gray-500">Google Trends active</div>}
                            </div>

                            {/* Results */}
                            {discovered.map((m, i) => (
                                <div key={i} className="bg-surface-700/50 border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 transition-all group flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1 leading-tight">{m.name}</h3>
                                            <a href={m.website_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm hover:underline flex items-center gap-1">
                                                {m.website_url} <ChevronRight className="w-3 h-3" />
                                            </a>
                                        </div>
                                        {m.website_url && (
                                            <img 
                                                src={`https://logo.clearbit.com/${m.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}`} 
                                                alt={`${m.name} logo`}
                                                className="w-10 h-10 object-contain rounded bg-white p-1"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 flex-1">{m.description}</p>
                                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 font-medium">
                                        <span className="px-2 py-1 bg-[#1a1a2e] rounded-md">{m.estimated_size || 'Unknown Size'}</span>
                                        <span className="px-2 py-1 bg-[#1a1a2e] rounded-md">{m.country || 'Global'}</span>
                                    </div>
                                    <button 
                                        onClick={() => saveToCrm(m)}
                                        disabled={savingId === m.id}
                                        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10 hover:border-white/20"
                                    >
                                        {savingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save to CRM
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: CRM */}
            {activeTab === 'crm' && (
                <div className="space-y-4">
                    {loadingCrm ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>
                    ) : crmItems.length === 0 ? (
                        <div className="text-center py-20 bg-surface-700/30 rounded-2xl border border-white/5 border-dashed">
                            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Your CRM is empty</h3>
                            <p className="text-gray-400">Discover companies and save them here to track your outreach.</p>
                            <button onClick={() => setActiveTab('discover')} className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-lg font-medium">Go to Discover</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                            {/* Left List */}
                            <div className="lg:col-span-1 space-y-2">
                                {crmItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setExpandedCrmId(expandedCrmId === item.id ? null : item.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${expandedCrmId === item.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-surface-700/50 border-white/5 hover:bg-surface-700'}`}
                                    >
                                        <div className="font-bold text-white truncate">{item.name}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                item.status === 'Discovered' ? 'bg-blue-500/20 text-blue-400' :
                                                item.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                                                item.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                            <span className="text-xs text-gray-500">{new Date(item.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Right Detail Pane */}
                            <div className="lg:col-span-3">
                                {expandedCrmId ? (() => {
                                    const activeItem = crmItems.find(i => i.id === expandedCrmId);
                                    if (!activeItem) return null;
                                    return (
                                        <div className="bg-surface-700 rounded-2xl border border-white/10 p-8 shadow-xl">
                                            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                                                <div>
                                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                                        {activeItem.name}
                                                    </h2>
                                                    <a href={activeItem.website_url} target="_blank" className="text-indigo-400 hover:underline mt-1 inline-block">{activeItem.website_url}</a>
                                                </div>
                                                <select 
                                                    value={activeItem.status}
                                                    onChange={(e) => updateCrmNotes(activeItem.id, activeItem.custom_notes, e.target.value)}
                                                    className="bg-[#131320] text-white border border-white/10 rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-indigo-500/50"
                                                >
                                                    <option value="Discovered">Discovered</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="Negotiating">Negotiating</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 mb-8">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Private Notes</label>
                                                    <textarea 
                                                        defaultValue={activeItem.custom_notes || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== activeItem.custom_notes) {
                                                                updateCrmNotes(activeItem.id, e.target.value, activeItem.status);
                                                            }
                                                        }}
                                                        placeholder="Add tracking links, contacts, or internal notes here..."
                                                        className="w-full h-32 bg-[#131320] border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Outreach Pitch</label>
                                                    {activeItem.generated_pitch ? (
                                                        <div className="h-32 bg-[#1a1a2e] border border-indigo-500/30 rounded-xl p-3 text-gray-300 text-sm overflow-y-auto font-mono whitespace-pre-wrap">
                                                            {activeItem.generated_pitch}
                                                        </div>
                                                    ) : (
                                                        <div className="h-32 bg-[#131320] border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center">
                                                            <MessageSquare className="w-6 h-6 text-gray-500 mb-2" />
                                                            <p className="text-gray-500 text-xs mb-3">No pitch generated yet.</p>
                                                            <button 
                                                                onClick={() => generatePitch(activeItem.id)}
                                                                disabled={generatingPitchId === activeItem.id}
                                                                className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-medium text-xs rounded border border-indigo-500/30 flex items-center gap-2"
                                                            >
                                                                {generatingPitchId === activeItem.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate Now'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {activeItem.status === 'Approved' && (
                                                <div className="col-span-2 mb-8 pt-6 border-t border-white/10">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-indigo-400" /> Dedicated Storefront Link
                                                    </label>
                                                    <div className="flex gap-4 mb-3">
                                                        <select
                                                            value={activeItem.linked_microsite_id || ''}
                                                            onChange={(e) => updateLinkedMicrosite(activeItem.id, e.target.value)}
                                                            className="flex-1 bg-[#131320] text-white border border-white/10 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500/50"
                                                        >
                                                            <option value="">-- Link to an existing Brand Property --</option>
                                                            {microsites.map(ms => (
                                                                <option key={ms.id} value={ms.id}>{ms.site_title} ({ms.subdomain}.dealfindai.com)</option>
                                                            ))}
                                                        </select>
                                                        {activeItem.linked_microsite_subdomain && (
                                                            <a 
                                                                href={`https://${activeItem.linked_microsite_subdomain}.dealfindai.com`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                                                            >
                                                                Visit Content Site <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <input 
                                                            type="text"
                                                            defaultValue={activeItem.ecommerce_store_url || ''}
                                                            onBlur={(e) => {
                                                                if (e.target.value !== activeItem.ecommerce_store_url) {
                                                                    updateEcommerceUrl(activeItem.id, e.target.value);
                                                                }
                                                            }}
                                                            placeholder="Actual E-commerce Store URL (e.g. https://mystore.myshopify.com)"
                                                            className="flex-1 bg-[#131320] text-white border border-white/10 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500/50 placeholder:text-gray-600"
                                                        />
                                                        {activeItem.ecommerce_store_url && (
                                                            <a 
                                                                href={activeItem.ecommerce_store_url.startsWith('http') ? activeItem.ecommerce_store_url : `https://${activeItem.ecommerce_store_url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-6 py-3 bg-[#1a1a2e] hover:bg-[#25254b] text-white font-bold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap border border-white/10"
                                                            >
                                                                Visit Store <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {!activeItem.linked_microsite_id && (
                                                        <p className="text-xs text-gray-500 mt-3">
                                                            Need a new content domain? Go to <Link to="/content-network" className="text-indigo-400 hover:underline">Content Network</Link> to create one.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center border-t border-white/10 pt-6">
                                                <button onClick={() => removeFromCrm(activeItem.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Remove from CRM</button>
                                                {activeItem.generated_pitch && (
                                                    <button 
                                                        onClick={() => generatePitch(activeItem.id)}
                                                        disabled={generatingPitchId === activeItem.id}
                                                        className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium border border-white/10 flex items-center gap-2"
                                                    >
                                                        {generatingPitchId === activeItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                        Regenerate Pitch
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className="h-[400px] flex items-center justify-center bg-surface-700/30 rounded-2xl border border-white/5 border-dashed">
                                        <p className="text-gray-500 font-medium">Select a manufacturer to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
