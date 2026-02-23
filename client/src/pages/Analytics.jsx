import { useEffect, useState } from 'react';
import { analyticsApi, funnelApi } from '../lib/api';
import { BarChart3, TrendingUp, Users, MousePointerClick, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function Analytics() {
    const [funnels, setFunnels] = useState([]);
    const [selected, setSelected] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7d');

    useEffect(() => { loadFunnels(); }, []);

    async function loadFunnels() {
        try {
            const d = await funnelApi.list();
            setFunnels(d.funnels || []);
            if (d.funnels?.length) { setSelected(d.funnels[0].id); loadAnalytics(d.funnels[0].id); }
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function loadAnalytics(funnelId, rangeOverride) {
        try { const d = await analyticsApi.getFunnel(funnelId, { range: rangeOverride || range }); setData(d); }
        catch (err) { toast.error(err.message); }
    }

    function handleSelect(id) { setSelected(id); loadAnalytics(id); }
    function handleRangeChange(r) { setRange(r); if (selected) loadAnalytics(selected, r); }

    if (loading) return <div className="card animate-pulse h-96" />;

    const overview = data?.overview || {};
    const prevViews = overview.prevPageViews || 0;
    const viewsTrend = prevViews > 0 ? ((overview.pageViews - prevViews) / prevViews * 100).toFixed(1) : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <div className="flex items-center gap-3">
                    {/* Date range */}
                    <div className="flex gap-1 bg-surface-800 rounded-xl p-0.5">
                        {[
                            { key: '24h', label: '24h' },
                            { key: '7d', label: '7d' },
                            { key: '30d', label: '30d' },
                            { key: '90d', label: '90d' },
                        ].map(r => (
                            <button key={r.key} onClick={() => handleRangeChange(r.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                    {/* Funnel selector */}
                    {funnels.length > 0 && (
                        <select value={selected || ''} onChange={e => handleSelect(e.target.value)} className="input-field w-auto text-sm">
                            {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {!data ? (
                <div className="card text-center py-12">
                    <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Select a funnel to view analytics.</p>
                </div>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard label="Page Views" value={overview.pageViews?.toLocaleString() || 0} icon={Eye} trend={viewsTrend} />
                        <KPICard label="Unique Visitors" value={overview.uniqueVisitors?.toLocaleString() || 0} icon={Users} color="purple" />
                        <KPICard label="Conversions" value={overview.conversions || 0} icon={MousePointerClick} color="emerald" />
                        <KPICard label="Conv. Rate" value={`${overview.conversionRate || 0}%`} icon={TrendingUp} color="amber" />
                    </div>

                    {/* Daily traffic chart */}
                    {data.daily?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold text-white mb-4">Traffic Over Time</h3>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={data.daily}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 13 }} />
                                    <defs>
                                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewsGrad)" strokeWidth={2} dot={false} />
                                    <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#convGrad)" strokeWidth={2} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Bottom sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Page-level stats */}
                        {data.pages?.length > 0 && (
                            <div className="card lg:col-span-1">
                                <h3 className="font-semibold text-white mb-3">Top Pages</h3>
                                {data.pages.slice(0, 8).map((p, i) => (
                                    <div key={p.page_slug || i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-gray-300 truncate flex-1">/{p.page_slug}</span>
                                        <span className="text-sm font-medium text-white ml-3">{parseInt(p.count || p.views || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Traffic Sources */}
                        <div className="card">
                            <h3 className="font-semibold text-white mb-3">Traffic Sources</h3>
                            {data.sources?.length > 0 ? (
                                <>
                                    {data.sources.slice(0, 6).map((s, i) => {
                                        const total = data.sources.reduce((sum, x) => sum + parseInt(x.count || 0), 0);
                                        const pct = total > 0 ? (parseInt(s.count) / total * 100).toFixed(0) : 0;
                                        return (
                                            <div key={s.source || i} className="mb-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-300">{s.source || 'Direct'}</span>
                                                    <span className="text-white font-medium">{parseInt(s.count).toLocaleString()} ({pct}%)</span>
                                                </div>
                                                <div className="h-1.5 bg-surface-700 rounded-full">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 py-4 text-center">No traffic data yet</p>
                            )}
                        </div>

                        {/* Devices */}
                        <div className="card">
                            <h3 className="font-semibold text-white mb-3">Devices</h3>
                            {data.devices?.length > 0 ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data.devices.map(d => ({ ...d, count: parseInt(d.count) }))} dataKey="count" nameKey="device_type" cx="50%" cy="50%" innerRadius={24} outerRadius={40} paddingAngle={4}>
                                                    {data.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {data.devices.map((d, i) => (
                                            <div key={d.device_type} className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                                <span className="text-sm text-gray-300 capitalize flex-1">{d.device_type}</span>
                                                <span className="text-sm font-medium text-white">{parseInt(d.count).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 py-4 text-center">No device data yet</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function KPICard({ label, value, icon: Icon, trend, color = 'brand' }) {
    const colorMap = { brand: 'brand-400', purple: 'purple-400', emerald: 'emerald-400', amber: 'amber-400' };
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{label}</p>
                <Icon className={`w-4 h-4 text-${colorMap[color]}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend !== null && trend !== undefined && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${parseFloat(trend) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {parseFloat(trend) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(trend)}% vs prev period</span>
                </div>
            )}
        </div>
    );
}
