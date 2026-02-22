import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Activity, Users, Layers, Mail, BarChart3, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStats() {
    const [stats, setStats] = useState(null);
    const [health, setHealth] = useState(null);
    const [billing, setBilling] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [s, h, b] = await Promise.all([adminApi.getStats(), adminApi.getHealth(), adminApi.getBilling()]);
            setStats(s); setHealth(h); setBilling(b);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    if (loading) return <div className="card animate-pulse h-96" />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">System Dashboard</h1>

            {/* Health */}
            {health && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                        <Heart className={`w-5 h-5 ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`} />
                        <h2 className="font-semibold text-white">Server Health</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Status</p><p className={`font-medium ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>{health.status}</p></div>
                        <div><p className="text-gray-500">Uptime</p><p className="text-white">{Math.round(health.uptime / 60)}m</p></div>
                        <div><p className="text-gray-500">Memory (RSS)</p><p className="text-white">{health.memory?.rss}</p></div>
                        <div><p className="text-gray-500">Database</p><p className="text-emerald-400">{health.database}</p></div>
                    </div>
                </div>
            )}

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="stat-card"><Users className="w-5 h-5 text-brand-400 mb-2" /><p className="stat-value">{stats.users?.total}</p><p className="stat-label">Users ({stats.users?.last30Days} this month)</p></div>
                    <div className="stat-card"><Layers className="w-5 h-5 text-purple-400 mb-2" /><p className="stat-value">{stats.funnels?.total}</p><p className="stat-label">Funnels ({stats.funnels?.published} published)</p></div>
                    <div className="stat-card"><Activity className="w-5 h-5 text-blue-400 mb-2" /><p className="stat-value">{stats.pages?.total}</p><p className="stat-label">Pages</p></div>
                    <div className="stat-card"><Mail className="w-5 h-5 text-emerald-400 mb-2" /><p className="stat-value">{stats.leads?.total}</p><p className="stat-label">Leads</p></div>
                    <div className="stat-card"><BarChart3 className="w-5 h-5 text-amber-400 mb-2" /><p className="stat-value">{stats.events?.total.toLocaleString()}</p><p className="stat-label">Events ({stats.events?.last24h} today)</p></div>
                </div>
            )}

            {/* Billing */}
            {billing && (
                <div className="card">
                    <h2 className="font-semibold text-white mb-4">Billing Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-gray-500">Active Subs</p><p className="text-2xl font-bold text-white">{billing.subscriptions?.active || 0}</p></div>
                        <div><p className="text-gray-500">MRR</p><p className="text-2xl font-bold text-emerald-400">${billing.mrr?.toFixed(2) || '0.00'}</p></div>
                        {billing.tiers?.map(t => (
                            <div key={t.tier}><p className="text-gray-500 capitalize">{t.tier}</p><p className="text-2xl font-bold text-white">{t.count}</p></div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
