import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { funnelApi, analyticsApi } from '../lib/api';
import { Layers, Users, TrendingUp, Plus, ArrowUpRight, BarChart3, Zap } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [funnels, setFunnels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        funnelApi.list()
            .then(data => setFunnels(data.funnels || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const published = funnels.filter(f => f.status === 'published').length;
    const totalViews = funnels.reduce((s, f) => s + parseInt(f.total_views || 0), 0);
    const totalLeads = funnels.reduce((s, f) => s + parseInt(f.lead_count || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Here's what's happening with your funnels.</p>
                </div>
                <Link to="/funnels?create=true" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Funnel
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Layers} label="Total Funnels" value={funnels.length} color="brand" />
                <StatCard icon={Zap} label="Published" value={published} color="emerald" />
                <StatCard icon={BarChart3} label="Total Views" value={totalViews.toLocaleString()} color="blue" />
                <StatCard icon={Users} label="Total Leads" value={totalLeads.toLocaleString()} color="purple" />
            </div>

            {/* Recent Funnels */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Funnels</h2>
                    <Link to="/funnels" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card animate-pulse">
                                <div className="h-4 bg-surface-700 rounded w-3/4 mb-3" />
                                <div className="h-3 bg-surface-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : funnels.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-8 h-8 text-brand-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No funnels yet</h3>
                        <p className="text-gray-400 text-sm mb-4">Create your first funnel to start converting visitors.</p>
                        <Link to="/funnels" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create Funnel
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {funnels.slice(0, 6).map(funnel => (
                            <Link key={funnel.id} to={`/funnels/${funnel.id}`} className="card-hover group">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors truncate">{funnel.name}</h3>
                                    <span className={`badge ${funnel.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                        {funnel.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{funnel.page_count || 0} pages</span>
                                    <span>{parseInt(funnel.total_views || 0).toLocaleString()} views</span>
                                    <span>{parseInt(funnel.lead_count || 0)} leads</span>
                                </div>
                                <div className="mt-3 text-xs text-gray-600">
                                    /{funnel.slug}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colorMap = {
        brand: 'from-brand-500/10 to-brand-600/5 border-brand-500/10 text-brand-400',
        emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/10 text-emerald-400',
        blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/10 text-blue-400',
        purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/10 text-purple-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 animate-slide-up`}>
            <div className="flex items-center gap-3 mb-3">
                <Icon className={`w-5 h-5`} />
                <span className="text-sm text-gray-400">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
