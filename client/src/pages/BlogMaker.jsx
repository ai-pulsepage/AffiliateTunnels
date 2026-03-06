import { useState, useEffect } from 'react';
import { Bot, Plus, Play, Pause, Trash2, Sparkles, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function BlogMaker() {
    const [workers, setWorkers] = useState([]);
    const [microsites, setMicrosites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [expandedWorker, setExpandedWorker] = useState(null);
    const [workerPosts, setWorkerPosts] = useState({});
    const [generating, setGenerating] = useState({});
    const [suggestingTopics, setSuggestingTopics] = useState({});

    // New worker form
    const [form, setForm] = useState({
        worker_name: '', worker_title: '', microsite_id: '',
        affiliate_links: '', reference_urls: '', prompt_template: '',
        schedule_cron: '0 9 1,15 * *', posts_requested: 4,
    });

    useEffect(() => { loadWorkers(); loadMicrosites(); }, []);

    async function loadWorkers() {
        try {
            const res = await fetch(`${API}/api/blogmaker/workers`, { credentials: 'include' });
            const data = await res.json();
            setWorkers(data.workers || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    async function loadMicrosites() {
        try {
            const res = await fetch(`${API}/api/storefront/microsites`, { credentials: 'include' });
            const data = await res.json();
            setMicrosites(data.microsites || []);
        } catch (err) { console.error(err); }
    }

    async function createWorker(e) {
        e.preventDefault();
        const affiliateLinks = form.affiliate_links.split('\n').filter(Boolean).map(line => {
            const [url, ...rest] = line.split('|');
            return { url: url.trim(), productName: rest.join('|').trim() || 'Product' };
        });
        const referenceUrls = form.reference_urls.split('\n').filter(Boolean).map(u => u.trim());

        const res = await fetch(`${API}/api/blogmaker/workers`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, affiliate_links: affiliateLinks, reference_urls: referenceUrls }),
        });
        if (res.ok) {
            setShowCreate(false);
            setForm({ worker_name: '', worker_title: '', microsite_id: '', affiliate_links: '', reference_urls: '', prompt_template: '', schedule_cron: '0 9 1,15 * *', posts_requested: 4 });
            loadWorkers();
        }
    }

    async function deleteWorker(id) {
        if (!confirm('Delete this worker and all its settings?')) return;
        await fetch(`${API}/api/blogmaker/workers/${id}`, { method: 'DELETE', credentials: 'include' });
        loadWorkers();
    }

    async function toggleWorker(id, currentStatus) {
        const status = currentStatus === 'active' ? 'paused' : 'active';
        await fetch(`${API}/api/blogmaker/workers/${id}`, {
            method: 'PUT', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        loadWorkers();
    }

    async function loadWorkerPosts(workerId) {
        const res = await fetch(`${API}/api/blogmaker/workers/${workerId}/posts`, { credentials: 'include' });
        const data = await res.json();
        setWorkerPosts(prev => ({ ...prev, [workerId]: data.posts || [] }));
    }

    async function generatePost(workerId, topic = null) {
        setGenerating(prev => ({ ...prev, [workerId]: true }));
        try {
            const res = await fetch(`${API}/api/blogmaker/workers/${workerId}/generate`, {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            if (res.ok) {
                await loadWorkerPosts(workerId);
                loadWorkers();
            } else {
                const err = await res.json();
                alert(err.error || 'Generation failed');
            }
        } catch (err) { alert('Generation failed: ' + err.message); }
        setGenerating(prev => ({ ...prev, [workerId]: false }));
    }

    async function suggestTopics(workerId) {
        setSuggestingTopics(prev => ({ ...prev, [workerId]: true }));
        try {
            const res = await fetch(`${API}/api/blogmaker/workers/${workerId}/suggest-topics`, {
                method: 'POST', credentials: 'include',
            });
            const data = await res.json();
            if (data.topics?.length) {
                await fetch(`${API}/api/blogmaker/workers/${workerId}`, {
                    method: 'PUT', credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topics: data.topics }),
                });
                loadWorkers();
            }
        } catch (err) { console.error(err); }
        setSuggestingTopics(prev => ({ ...prev, [workerId]: false }));
    }

    function toggleExpand(workerId) {
        if (expandedWorker === workerId) {
            setExpandedWorker(null);
        } else {
            setExpandedWorker(workerId);
            if (!workerPosts[workerId]) loadWorkerPosts(workerId);
        }
    }

    if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Bot className="w-7 h-7 text-brand-400" /> BlogMaker 3000
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">AI-powered blog workers that research, write, and publish on schedule</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors">
                    <Plus className="w-4 h-4" /> New Worker
                </button>
            </div>

            {/* Create Worker Form */}
            {showCreate && (
                <form onSubmit={createWorker} className="bg-surface-800 border border-white/10 rounded-2xl p-6 mb-8 space-y-4">
                    <h2 className="text-lg font-bold text-white mb-2">Create Blog Worker</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Worker Name (Persona)</label>
                            <input value={form.worker_name} onChange={e => setForm({ ...form, worker_name: e.target.value })} placeholder="Andrew McFunkle" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" required />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Worker Title</label>
                            <input value={form.worker_title} onChange={e => setForm({ ...form, worker_title: e.target.value })} placeholder="I review spa and sauna equipment" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Assign to Microsite</label>
                            <select value={form.microsite_id} onChange={e => setForm({ ...form, microsite_id: e.target.value })} className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm">
                                <option value="">No microsite</option>
                                {microsites.map(ms => <option key={ms.id} value={ms.id}>{ms.subdomain}.dealfindai.com — {ms.site_title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Posts Requested</label>
                            <input type="number" value={form.posts_requested} onChange={e => setForm({ ...form, posts_requested: parseInt(e.target.value) || 4 })} min="1" max="20" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Affiliate Links <span className="text-gray-600">(one per line: URL | Product Name)</span></label>
                        <textarea value={form.affiliate_links} onChange={e => setForm({ ...form, affiliate_links: e.target.value })} rows="3" placeholder={"https://example.com/product-1 | Citrus Burn\nhttps://example.com/product-2 | TestoMax"} className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm font-mono" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Reference URLs <span className="text-gray-600">(blogs to learn from, one per line)</span></label>
                        <textarea value={form.reference_urls} onChange={e => setForm({ ...form, reference_urls: e.target.value })} rows="2" placeholder="https://health-blog.com/testosterone-guide" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm font-mono" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Custom Prompt Instructions <span className="text-gray-600">(optional tone/style guidance)</span></label>
                        <textarea value={form.prompt_template} onChange={e => setForm({ ...form, prompt_template: e.target.value })} rows="2" placeholder="Write in a casual, friendly tone. Target men 40-60. Mention personal experience." className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors">Create Worker</button>
                    </div>
                </form>
            )}

            {/* Workers List */}
            {workers.length === 0 ? (
                <div className="text-center py-20">
                    <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Blog Workers Yet</h2>
                    <p className="text-gray-400 text-sm mb-6">Create a worker to start generating AI-powered blog content</p>
                    <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors">
                        <Plus className="w-4 h-4 inline mr-1.5" /> Create First Worker
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {workers.map(worker => {
                        const isExpanded = expandedWorker === worker.id;
                        const posts = workerPosts[worker.id] || [];
                        const topics = (typeof worker.topics === 'string' ? JSON.parse(worker.topics) : worker.topics) || [];
                        return (
                            <div key={worker.id} className="bg-surface-800 border border-white/10 rounded-2xl overflow-hidden">
                                {/* Worker Header */}
                                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[.02] transition-colors" onClick={() => toggleExpand(worker.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {(worker.worker_name || 'W')[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-[15px]">{worker.worker_name}</h3>
                                            <p className="text-gray-500 text-xs">{worker.worker_title || 'Blog Writer'} · {worker.subdomain ? `${worker.subdomain}.dealfindai.com` : 'No microsite'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${worker.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {worker.status || 'paused'}
                                        </span>
                                        <span className="text-gray-500 text-xs">{worker.post_count || 0} posts</span>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </div>

                                {/* Expanded Worker Detail */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-5 space-y-5">
                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={(e) => { e.stopPropagation(); toggleWorker(worker.id, worker.status); }} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${worker.status === 'active' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                                                {worker.status === 'active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Activate</>}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); generatePost(worker.id); }} disabled={generating[worker.id]} className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                                <Sparkles className="w-3.5 h-3.5" /> {generating[worker.id] ? 'Generating...' : 'Generate Now'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); suggestTopics(worker.id); }} disabled={suggestingTopics[worker.id]} className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                                <Sparkles className="w-3.5 h-3.5" /> {suggestingTopics[worker.id] ? 'Suggesting...' : 'Suggest Topics'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteWorker(worker.id); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors ml-auto">
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                        </div>

                                        {/* Topics */}
                                        {topics.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-300 mb-2">Suggested Topics</h4>
                                                <div className="space-y-1.5">
                                                    {topics.map((t, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-surface-700 rounded-lg px-3 py-2">
                                                            <span className="text-sm text-gray-300">{t.title}</span>
                                                            <div className="flex items-center gap-2">
                                                                {t.keyword && <span className="text-xs text-gray-500">{t.keyword}</span>}
                                                                <button onClick={() => generatePost(worker.id, t.title)} disabled={generating[worker.id]} className="text-xs text-brand-400 hover:text-brand-300 font-medium">Write</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Generated Posts */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Generated Posts ({posts.length})</h4>
                                            {posts.length === 0 ? (
                                                <p className="text-gray-600 text-sm">No posts generated yet. Click "Generate Now" or "Suggest Topics" to get started.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {posts.map(post => (
                                                        <div key={post.id} className="flex items-center justify-between bg-surface-700 rounded-lg px-4 py-3">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm text-white font-medium truncate">{post.title}</p>
                                                                    <p className="text-xs text-gray-500">{post.target_keyword} · {post.status} · {new Date(post.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <a href={`/blog/${post.id}/edit`} className="text-xs text-brand-400 hover:text-brand-300 font-medium shrink-0 ml-3">Edit</a>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
