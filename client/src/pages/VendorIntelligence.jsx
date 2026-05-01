import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { toast } from 'react-hot-toast';
import { Database, Search, ArrowRight, Wand2, RefreshCw, Trash2, ShoppingCart } from 'lucide-react';

export default function VendorIntelligence() {
    const [sourceUrl, setSourceUrl] = useState('');
    const [scraping, setScraping] = useState(false);
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        loadQueue();
        loadStores();
    }, []);

    const loadQueue = async () => {
        try {
            const data = await api('/vendors/queue');
            setQueue(data.queue);
        } catch (err) {
            toast.error('Failed to load queue');
        } finally {
            setLoading(false);
        }
    };

    const loadStores = async () => {
        try {
            const data = await api('/stores');
            setStores(data.filter(s => s.is_active));
        } catch (err) { }
    };

    const handleScrape = async (e) => {
        e.preventDefault();
        if (!sourceUrl) return;

        setScraping(true);
        const toastId = toast.loading('Scraping product and running AI refinement... This takes about 15 seconds.');
        
        try {
            await api('/vendors/scrape', {
                method: 'POST',
                body: { source_url: sourceUrl }
            });
            toast.success('Product scraped and refined successfully!', { id: toastId });
            setSourceUrl('');
            loadQueue();
        } catch (err) {
            toast.error(err.message || 'Failed to process product', { id: toastId });
        } finally {
            setScraping(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this product from the queue?')) return;
        try {
            await api(`/vendors/${id}`, { method: 'DELETE' });
            setQueue(q => q.filter(item => item.id !== id));
            toast.success('Removed');
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    const handleUpdate = async (id, field, value) => {
        try {
            const updated = await api(`/vendors/${id}`, {
                method: 'PUT',
                body: { [field]: value }
            });
            setQueue(q => q.map(item => item.id === id ? updated.product : item));
        } catch (err) {
            toast.error('Failed to save edit');
        }
    };

    const handlePush = async (item) => {
        if (!item.target_store_id) {
            return toast.error('Please select a target store first');
        }

        const toastId = toast.loading(`Pushing to store...`);
        try {
            const res = await api(`/vendors/${item.id}/push`, { method: 'POST' });
            toast.success('Successfully injected into store!', { id: toastId });
            setQueue(q => q.filter(i => i.id !== item.id));
        } catch (err) {
            toast.error(err.message || 'Failed to push product', { id: toastId });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                        <Database className="w-10 h-10 text-emerald-400" />
                        Vendor Intelligence
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Scrape messy vendor listings and use AI to generate premium storefront copy.</p>
                </div>
            </div>

            {/* Ingestion Panel */}
            <div className="bg-[#131320] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-emerald-400" />
                    Product Ingestion
                </h2>
                <form onSubmit={handleScrape} className="flex gap-4">
                    <input 
                        type="url" 
                        required
                        value={sourceUrl}
                        onChange={e => setSourceUrl(e.target.value)}
                        placeholder="Paste vendor product URL (e.g., Alibaba, CJ Dropshipping, direct supplier)..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        disabled={scraping}
                    />
                    <button 
                        type="submit" 
                        disabled={scraping || !sourceUrl}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {scraping ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {scraping ? 'Processing...' : 'Scrape & Refine'}
                    </button>
                </form>
            </div>

            {/* Queue */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Review Queue 
                    <span className="bg-emerald-500/20 text-emerald-400 text-sm py-1 px-3 rounded-full">{queue.length}</span>
                </h2>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading queue...</div>
                ) : queue.length === 0 ? (
                    <div className="text-center py-12 bg-[#131320] border border-white/5 rounded-2xl text-gray-400">
                        Queue is empty. Paste a product URL above to get started.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {queue.map(item => (
                            <div key={item.id} className="bg-[#131320] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row">
                                {/* Left: Original */}
                                <div className="flex-1 p-6 border-r border-white/10 bg-black/20">
                                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Original Vendor Listing
                                        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline lowercase normal-case">({item.vendor_name || 'Link'})</a>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-400 mb-1">Raw Title:</div>
                                        <div className="text-white font-medium line-clamp-2">{item.original_title}</div>
                                    </div>
                                    {item.original_images?.length > 0 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                                            {item.original_images.slice(0,4).map((img, i) => (
                                                <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg bg-white/5 flex-shrink-0" alt="" />
                                            ))}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">Scraped Price:</div>
                                        <div className="text-white font-bold">${item.original_price}</div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-400 mb-1">Raw Body Text (Snippet):</div>
                                        <div className="text-gray-500 text-sm line-clamp-4 bg-black/30 p-3 rounded-lg border border-white/5">
                                            {item.original_desc?.substring(0, 300)}...
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Refined */}
                                <div className="flex-1 p-6 relative">
                                    <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Wand2 className="w-3 h-3" /> AI Refined Copy
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Premium Title</label>
                                            <input 
                                                type="text" 
                                                value={item.refined_title || ''}
                                                onChange={e => handleUpdate(item.id, 'refined_title', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white text-lg font-medium focus:ring-1 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">HTML Description</label>
                                            <textarea 
                                                rows="8"
                                                value={item.refined_desc || ''}
                                                onChange={e => handleUpdate(item.id, 'refined_desc', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-mono focus:ring-1 focus:ring-emerald-500/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center gap-4 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                        <div className="flex-1">
                                            <select 
                                                value={item.target_store_id || ''}
                                                onChange={e => handleUpdate(item.id, 'target_store_id', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white"
                                            >
                                                <option value="">-- Select Store to Push To --</option>
                                                {stores.map(s => (
                                                    <option key={s.id} value={s.id}>{s.store_name} ({s.platform})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={() => handlePush(item)}
                                            disabled={!item.target_store_id}
                                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-4 h-4" /> Push Product
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2.5 text-gray-500 hover:text-red-400 bg-black/50 rounded-lg border border-white/5 transition-all"
                                            title="Discard"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
