import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Layers, Users, TrendingUp, Plus, ArrowUpRight, BarChart3, Zap, Store, Globe, AlertTriangle, Clock, Activity, CheckCircle, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/analytics/dashboard')
            .then(res => setData(res))
            .catch(err => {
                console.error(err);
                toast.error('Failed to load dashboard data');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    const metrics = data?.metrics || { total_funnels: 0, total_views: 0, total_leads: 0, total_stores: 0 };
    const staleMicrosites = data?.stale_microsites || [];
    const contentQueue = data?.content_queue || [];

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Activity className="w-8 h-8 text-brand-400" /> Control Room
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">System overview, metrics aggregation, and actionable alerts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/store-manager')} className="px-4 py-2 bg-surface-700 hover:bg-surface-600 border border-white/10 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                        <Store className="w-4 h-4" /> Manage Stores
                    </button>
                    <button onClick={() => navigate('/content-network')} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                        <Globe className="w-4 h-4" /> Content Network
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Store} label="Connected Stores" value={metrics.total_stores} color="purple" />
                <StatCard icon={Globe} label="Content Properties" value={metrics.total_funnels} color="brand" />
                <StatCard icon={BarChart3} label="Global Views" value={metrics.total_views.toLocaleString()} color="blue" />
                <StatCard icon={Users} label="Total Leads" value={metrics.total_leads.toLocaleString()} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Alerts & Staleness */}
                <div className="space-y-6">
                    <div className="bg-surface-700 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" /> Content Staleness Alerts
                            </h2>
                            <Link to="/content-network" className="text-xs text-amber-400 hover:text-amber-300">View All</Link>
                        </div>
                        
                        {staleMicrosites.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-800/50 rounded-xl border border-white/5">
                                <CheckCircle className="w-10 h-10 text-emerald-500/50 mb-2" />
                                <p className="text-gray-400 text-sm">All properties are fresh!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {staleMicrosites.map(site => (
                                    <div key={site.id} className="flex items-center justify-between p-3 bg-surface-800 rounded-xl border border-white/5 hover:border-amber-500/30 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{site.site_title || site.subdomain}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {site.last_content_at ? `Last updated: ${new Date(site.last_content_at).toLocaleDateString()}` : 'Never updated'}
                                            </p>
                                        </div>
                                        <button onClick={() => navigate('/blogmaker')} className="text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg transition-colors">
                                            Generate
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Content Queue */}
                <div className="space-y-6">
                    <div className="bg-surface-700 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-400" /> Action Required: Queue
                            </h2>
                            <Link to="/blogmaker" className="text-xs text-blue-400 hover:text-blue-300">Open BlogMaker</Link>
                        </div>

                        {contentQueue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-800/50 rounded-xl border border-white/5">
                                <Bot className="w-10 h-10 text-gray-500/50 mb-2" />
                                <p className="text-gray-400 text-sm">No items in the content queue.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contentQueue.map(item => (
                                    <div key={item.id} className="p-3 bg-surface-800 rounded-xl border border-white/5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider bg-blue-400/10 px-2 py-0.5 rounded">
                                                    {item.subdomain}.dealfindai.com
                                                </span>
                                                <h3 className="font-medium text-white text-sm mt-1">{item.topic}</h3>
                                            </div>
                                            <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => navigate('/blogmaker')} className="flex-1 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors">Review</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorMap = {
        brand: 'from-brand-500/10 to-brand-600/5 border-brand-500/20 text-brand-400',
        emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
        blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
        purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-6 relative overflow-hidden transition-all hover:scale-[1.02]`}>
            <div className="absolute -right-4 -top-4 opacity-10">
                <Icon className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-surface-800/50 backdrop-blur`}>
                    <Icon className={`w-5 h-5`} />
                </div>
                <span className="text-sm font-semibold text-gray-300">{label}</span>
            </div>
            <p className="text-4xl font-extrabold text-white tracking-tight">{value}</p>
        </div>
    );
}
