import { useState } from 'react';
import { Search, Plus, Sparkles, Download, Copy, Loader2, ChevronRight, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function KeywordIntelligence() {
    const [seedKeyword, setSeedKeyword] = useState('');
    const [niche, setNiche] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [cluster, setCluster] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    
    const [adCopy, setAdCopy] = useState('');
    const [generatingAds, setGeneratingAds] = useState(false);

    async function handleSearch(e) {
        e.preventDefault();
        if (!seedKeyword) return;
        setLoadingSuggestions(true);
        try {
            const data = await api(`/keywords/autocomplete?q=${encodeURIComponent(seedKeyword)}`);
            setSuggestions(data.suggestions || []);
        } catch (err) {
            toast.error('Failed to get keyword suggestions');
        }
        setLoadingSuggestions(false);
    }

    function addToCluster(keyword) {
        if (!cluster.includes(keyword)) {
            setCluster([...cluster, keyword]);
        }
    }

    function removeFromCluster(keyword) {
        setCluster(cluster.filter(k => k !== keyword));
    }

    async function generateAds() {
        if (cluster.length === 0) {
            toast.error('Add at least one keyword to your cluster first');
            return;
        }
        setGeneratingAds(true);
        try {
            const data = await api('/keywords/generate-ads', {
                method: 'POST',
                body: { keywords: cluster, niche }
            });
            setAdCopy(data.adCopy);
            toast.success('Ad copy generated!');
        } catch (err) {
            toast.error('Failed to generate ad copy');
        }
        setGeneratingAds(false);
    }

    function exportCsv() {
        if (cluster.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," + "Keyword\n" + cluster.map(k => `"${k}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "keyword_cluster.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Hash className="w-8 h-8 text-teal-400" /> Keyword & Ad Intelligence
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Build keyword clusters and generate Google Ads copy for your e-commerce funnels.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Keyword Research */}
                <div className="space-y-6">
                    <div className="bg-surface-700 rounded-2xl border border-white/10 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Discover Keywords</h2>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input 
                                type="text"
                                value={seedKeyword}
                                onChange={e => setSeedKeyword(e.target.value)}
                                placeholder="Enter a seed keyword (e.g. premium saunas)"
                                className="flex-1 bg-[#131320] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-teal-500/50"
                            />
                            <button type="submit" disabled={loadingSuggestions} className="px-6 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
                                {loadingSuggestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        </form>

                        {suggestions.length > 0 && (
                            <div className="mt-6">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Live Suggestions</p>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {suggestions.map((sug, i) => (
                                        <div key={i} className="flex items-center justify-between bg-[#1a1a2e] px-4 py-2 rounded-lg group">
                                            <span className="text-gray-300 text-sm font-medium">{sug}</span>
                                            <button onClick={() => addToCluster(sug)} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-teal-300">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Cluster & Ads */}
                <div className="space-y-6">
                    <div className="bg-surface-700 rounded-2xl border border-white/10 p-6 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Your Keyword Cluster ({cluster.length})</h2>
                            {cluster.length > 0 && (
                                <button onClick={exportCsv} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                    <Download className="w-3 h-3" /> Export CSV
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto mb-6 bg-[#131320] rounded-xl border border-white/5 p-4 custom-scrollbar">
                            {cluster.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <Hash className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm">No keywords added yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {cluster.map((k, i) => (
                                        <span key={i} className="bg-teal-500/10 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {k}
                                            <button onClick={() => removeFromCluster(k)} className="hover:text-teal-100">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-auto border-t border-white/10 pt-4 space-y-3">
                            <input 
                                type="text"
                                value={niche}
                                onChange={e => setNiche(e.target.value)}
                                placeholder="Niche context (optional, e.g. Luxury Health)"
                                className="w-full bg-[#131320] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-teal-500/50"
                            />
                            <button onClick={generateAds} disabled={generatingAds || cluster.length === 0} className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                                {generatingAds ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Sparkles className="w-5 h-5 text-black" />}
                                Generate Ads Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ad Copy Result */}
            {adCopy && (
                <div className="mt-8 bg-surface-700 rounded-2xl border border-teal-500/30 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-teal-400" /> AI Generated Ads</h2>
                        <button onClick={() => { navigator.clipboard.writeText(adCopy); toast.success('Copied to clipboard!'); }} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <Copy className="w-4 h-4" /> Copy All
                        </button>
                    </div>
                    <div className="bg-[#131320] p-6 rounded-xl border border-white/5 font-mono text-sm text-teal-100/80 whitespace-pre-wrap">
                        {adCopy}
                    </div>
                </div>
            )}
        </div>
    );
}
