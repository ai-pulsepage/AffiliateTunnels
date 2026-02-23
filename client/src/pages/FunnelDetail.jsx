import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { funnelApi, publishApi } from '../lib/api';
import FunnelFlow from '../components/funnel/FunnelFlow';
import FunnelSettings from '../components/funnel/FunnelSettings';
import {
    ArrowLeft, Plus, Globe, GlobeLock, Pencil, Trash2, BarChart3,
    Layers, Settings2, Copy, Eye, Mail, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_TYPES = ['landing', 'bridge', 'offer', 'optin', 'thankyou', 'bonus'];

export default function FunnelDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddPage, setShowAddPage] = useState(false);
    const [newPage, setNewPage] = useState({ name: '', page_type: 'landing' });
    const [tab, setTab] = useState('flow');

    useEffect(() => { loadFunnel(); }, [id]);

    async function loadFunnel() {
        try {
            const data = await funnelApi.get(id);
            setFunnel(data.funnel);
            setPages(data.pages || []);
        } catch (err) {
            toast.error(err.message);
            navigate('/funnels');
        } finally { setLoading(false); }
    }

    async function handleAddPage() {
        if (!newPage.name.trim()) return;
        try {
            const data = await funnelApi.createPage(id, {
                ...newPage,
                step_order: pages.length,
                slug: newPage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            });
            setPages([...pages, data.page]);
            setNewPage({ name: '', page_type: 'landing' });
            setShowAddPage(false);
            toast.success('Page created');
        } catch (err) { toast.error(err.message); }
    }

    async function handleDeletePage(pageId) {
        if (!confirm('Delete this page?')) return;
        try {
            await funnelApi.deletePage(id, pageId);
            setPages(prev => prev.filter(p => p.id !== pageId));
            toast.success('Page deleted');
        } catch (err) { toast.error(err.message); }
    }

    async function handlePublishPage(pageId) {
        try {
            const data = await publishApi.publishPage(id, pageId);
            setPages(prev => prev.map(p => p.id === pageId ? { ...p, is_published: true, published_url: data.url } : p));
            toast.success('Page published');
        } catch (err) { toast.error(err.message); }
    }

    async function handlePublishAll() {
        try {
            await publishApi.publishAll(id);
            setPages(prev => prev.map(p => ({ ...p, is_published: true })));
            toast.success('All pages published');
        } catch (err) { toast.error(err.message); }
    }

    async function handleDuplicate() {
        try {
            const data = await funnelApi.duplicate(id);
            toast.success('Funnel duplicated');
            navigate(`/funnels/${data.funnel.id}`);
        } catch (err) { toast.error(err.message); }
    }

    if (loading) return <div className="card animate-pulse h-64" />;
    if (!funnel) return null;

    const publishedCount = pages.filter(p => p.is_published).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/funnels')} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{funnel.name}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {pages.length} pages · {publishedCount} published · /p/{funnel.slug}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link to={`/drip/${id}`} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Drip
                    </Link>
                    <Link to={`/leads/${id}`} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Leads
                    </Link>
                    <button onClick={handleDuplicate} className="btn-secondary text-sm flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5" /> Clone
                    </button>
                    <button onClick={handlePublishAll} className="btn-primary text-sm flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Publish All
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <p className="stat-value">{pages.length}</p>
                    <p className="stat-label">Pages</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{publishedCount}</p>
                    <p className="stat-label">Published</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{funnel.metrics?.total_views?.toLocaleString() || 0}</p>
                    <p className="stat-label">Total Views</p>
                </div>
                <div className="stat-card">
                    <p className="stat-value">{funnel.metrics?.total_leads || 0}</p>
                    <p className="stat-label">Leads</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-800 rounded-xl p-1">
                {[
                    { key: 'flow', label: 'Flow', icon: Layers },
                    { key: 'pages', label: 'Pages', icon: Pencil },
                    { key: 'settings', label: 'Settings', icon: Settings2 },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'flow' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Funnel Flow</h2>
                        <button onClick={() => setShowAddPage(true)} className="btn-primary text-sm flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Add Page
                        </button>
                    </div>
                    <FunnelFlow
                        pages={pages}
                        funnelId={id}
                        funnelSlug={funnel.slug}
                        onPublish={handlePublishPage}
                        onDelete={handleDeletePage}
                    />
                </div>
            )}

            {tab === 'pages' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Pages</h2>
                        <button onClick={() => setShowAddPage(true)} className="btn-primary text-sm flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Add Page
                        </button>
                    </div>
                    {pages.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-400">No pages yet. Create your first page to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {[...pages].sort((a, b) => a.step_order - b.step_order).map(page => (
                                <div key={page.id} className="card flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-600 w-6 text-center">{page.step_order + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-white">{page.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {page.page_type} · /{funnel.slug}/{page.slug}
                                                {page.is_published && page.published_url && (
                                                    <a href={page.published_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-400 hover:underline">Live ↗</a>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {page.is_published ? (
                                            <span className="badge badge-success text-[10px]">Published</span>
                                        ) : (
                                            <span className="badge text-[10px]">Draft</span>
                                        )}
                                        <Link to={`/editor/${id}/${page.id}`} className="p-1.5 hover:bg-white/5 rounded-lg" title="Edit page">
                                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                        </Link>
                                        <Link to={`/builder/${id}/${page.id}`} className="p-1.5 hover:bg-white/5 rounded-lg" title="Advanced editor (GrapeJS)">
                                            <Settings2 className="w-3.5 h-3.5 text-gray-500" />
                                        </Link>
                                        <button onClick={() => handlePublishPage(page.id)} className="p-1.5 hover:bg-white/5 rounded-lg">
                                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                                        </button>
                                        <button onClick={() => handleDeletePage(page.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'settings' && (
                <FunnelSettings funnel={funnel} onUpdate={setFunnel} />
            )}

            {/* Add Page Modal */}
            {showAddPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddPage(false)}>
                    <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">Add New Page</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Page Name</label>
                                <input
                                    type="text"
                                    value={newPage.name}
                                    onChange={e => setNewPage({ ...newPage, name: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. Bridge Page"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Page Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PAGE_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewPage({ ...newPage, page_type: type })}
                                            className={`p-3 rounded-xl border text-center text-sm capitalize transition-all ${newPage.page_type === type
                                                ? 'border-brand-500 bg-brand-500/10 text-white'
                                                : 'border-white/5 text-gray-400 hover:border-white/10'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAddPage(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleAddPage} className="btn-primary flex-1">Create Page</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
