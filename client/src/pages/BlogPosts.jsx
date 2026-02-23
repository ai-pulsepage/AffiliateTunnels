import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogApi, funnelApi } from '../lib/api';
import { Plus, Search, Pencil, Trash2, Globe, GlobeLock, FileText, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterFunnel, setFilterFunnel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [funnels, setFunnels] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newFunnelId, setNewFunnelId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadPosts();
        loadFunnels();
    }, [filterFunnel, filterStatus]);

    async function loadPosts() {
        try {
            const params = {};
            if (filterFunnel) params.funnel_id = filterFunnel;
            if (filterStatus) params.status = filterStatus;
            const data = await blogApi.list(params);
            setPosts(data.posts || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function loadFunnels() {
        try {
            const data = await funnelApi.list();
            setFunnels(data.funnels || []);
        } catch (err) { /* ignore */ }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            const data = await blogApi.create({ title: newTitle, funnel_id: newFunnelId || null });
            toast.success('Blog post created!');
            navigate(`/blog/${data.post.id}/edit`);
        } catch (err) { toast.error(err.message); }
    }

    async function handlePublish(id) {
        try {
            const data = await blogApi.publish(id);
            toast.success('Published!');
            setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'published', published_url: data.url } : p));
        } catch (err) { toast.error(err.message); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this blog post?')) return;
        try {
            await blogApi.delete(id);
            setPosts(prev => prev.filter(p => p.id !== id));
            toast.success('Deleted');
        } catch (err) { toast.error(err.message); }
    }

    const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{posts.length} posts · SEO & Pinterest content</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10 text-sm" placeholder="Search posts..." />
                </div>
                <select value={filterFunnel} onChange={e => setFilterFunnel(e.target.value)} className="input-field text-sm w-48">
                    <option value="">All Products</option>
                    {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-sm w-36">
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <div className="bg-[#1a1d27] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white">New Blog Post</h2>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-field" placeholder="Top 10 Golf Swing Tips for Beginners" required autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Link to Product Funnel (optional)</label>
                                <select value={newFunnelId} onChange={e => setNewFunnelId(e.target.value)} className="input-field text-sm">
                                    <option value="">— None —</option>
                                    {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Post List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-20" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-16">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">{search ? 'No posts match your search.' : 'No blog posts yet.'}</p>
                    <p className="text-xs text-gray-600 mt-1">Create your first post to start driving organic traffic.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(post => (
                        <div key={post.id} className="card flex items-center justify-between py-3 group hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-green-600/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{post.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>/blog/{post.slug}</span>
                                        {post.funnel_name && <span>· {post.funnel_name}</span>}
                                        {post.category && <span>· {post.category}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {post.status === 'published' ? (
                                    <span className="badge badge-success text-[10px]">Published</span>
                                ) : (
                                    <span className="badge text-[10px]">Draft</span>
                                )}
                                {post.published_url && (
                                    <a href={post.published_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-white/5 rounded-lg" title="View live">
                                        <Globe className="w-3.5 h-3.5 text-green-400" />
                                    </a>
                                )}
                                <Link to={`/blog/${post.id}/edit`} className="flex items-center gap-1 px-2 py-1.5 hover:bg-white/5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <button onClick={() => handlePublish(post.id)} className="p-1.5 hover:bg-white/5 rounded-lg" title="Publish">
                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete">
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
