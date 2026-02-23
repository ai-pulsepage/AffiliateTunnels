import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { funnelApi } from '../lib/api';
import { Plus, Search, MoreHorizontal, Copy, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Funnels() {
    const [funnels, setFunnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [showCreate, setShowCreate] = useState(searchParams.get('create') === 'true');
    const [newName, setNewName] = useState('');
    const navigate = useNavigate();

    useEffect(() => { loadFunnels(); }, []);

    async function loadFunnels() {
        try {
            const data = await funnelApi.list();
            setFunnels(data.funnels || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            const data = await funnelApi.create({ name: newName });
            toast.success('Funnel created!');
            navigate(`/funnels/${data.funnel.id}`);
        } catch (err) { toast.error(err.message); }
    }

    async function handleDuplicate(id) {
        try {
            const data = await funnelApi.duplicate(id);
            toast.success('Funnel duplicated!');
            setFunnels(prev => [data.funnel, ...prev]);
        } catch (err) { toast.error(err.message); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this funnel and all its pages?')) return;
        try {
            await funnelApi.delete(id);
            setFunnels(prev => prev.filter(f => f.id !== id));
            toast.success('Funnel deleted');
        } catch (err) { toast.error(err.message); }
    }

    const filtered = funnels.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Funnels</h1>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Funnel
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search funnels..." />
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <div className="card w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-4">Create New Funnel</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input-field" placeholder="My Awesome Funnel" required autoFocus />
                                {newName.trim() && (
                                    <p className="text-xs text-gray-500 mt-1.5 px-1">
                                        Slug: <span className="text-brand-400 font-mono">/p/{newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Funnel Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="card animate-pulse h-36" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-400">{search ? 'No funnels match your search.' : 'No funnels yet. Create your first one!'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(funnel => (
                        <div key={funnel.id} className="card-hover group relative">
                            <Link to={`/funnels/${funnel.id}`} className="block">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">{funnel.name}</h3>
                                    <span className={`badge ${funnel.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{funnel.status}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{funnel.page_count || 0} pages</span>
                                    <span>{parseInt(funnel.total_views || 0).toLocaleString()} views</span>
                                    <span>{parseInt(funnel.lead_count || 0)} leads</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">/{funnel.slug}</p>
                            </Link>
                            <div className="absolute top-4 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDuplicate(funnel.id)} className="p-1.5 hover:bg-white/10 rounded-lg" title="Duplicate">
                                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                <button onClick={() => handleDelete(funnel.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
