import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emailApi, funnelApi } from '../lib/api';
import { ArrowLeft, Download, Search, Users, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Leads() {
    const { funnelId } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => { loadFunnelInfo(); }, [funnelId]);
    useEffect(() => { loadLeads(); }, [funnelId, page]);

    async function loadFunnelInfo() {
        try {
            const d = await funnelApi.get(funnelId);
            setFunnel(d.funnel);
        } catch (err) { toast.error(err.message); }
    }

    async function loadLeads() {
        setLoading(true);
        try {
            const d = await emailApi.getLeads(funnelId, page);
            setLeads(d.leads || []);
            setTotal(d.total || 0);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleExport() {
        setExporting(true);
        try {
            const res = await fetch(`/api/emails/leads/${funnelId}/export`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('at_access_token')}` },
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads-${funnelId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV downloaded');
        } catch (err) {
            toast.error(err.message);
        } finally { setExporting(false); }
    }

    const filtered = search
        ? leads.filter(l => l.email?.toLowerCase().includes(search.toLowerCase()) || l.name?.toLowerCase().includes(search.toLowerCase()))
        : leads;

    const totalPages = Math.ceil(total / 50);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/funnels/${funnelId}`)} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Leads</h1>
                        <p className="text-sm text-gray-500">{funnel?.name} · {total} total</p>
                    </div>
                </div>
                <button onClick={handleExport} disabled={exporting || total === 0} className="btn-primary text-sm flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="stat-card">
                    <p className="stat-value">{total}</p>
                    <p className="stat-label">Total Leads</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{leads.filter(l => l.subscribed !== false).length}</p>
                    <p className="stat-label">Subscribed</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{leads.filter(l => {
                        const d = new Date(l.created_at);
                        const now = new Date();
                        return d.toDateString() === now.toDateString();
                    }).length}</p>
                    <p className="stat-label">Today</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Search leads by name or email..."
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="card animate-pulse h-48" />
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{search ? 'No matching leads.' : 'No leads captured yet.'}</p>
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Source Page</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Captured</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(lead => (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-gray-600" />
                                            <span className="text-sm text-white">{lead.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-300">{lead.name || '—'}</td>
                                    <td className="px-5 py-3 text-sm text-gray-500">{lead.page_name || '—'}</td>
                                    <td className="px-5 py-3">
                                        {lead.subscribed !== false ? (
                                            <span className="badge badge-success text-[10px]">Subscribed</span>
                                        ) : (
                                            <span className="badge badge-warning text-[10px]">Unsubscribed</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-500">
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {page} of {totalPages} · {total} total
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm p-2">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm p-2">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
