import { useState, useEffect } from 'react';
import { Bot, Plus, Trash2, Sparkles, FileText, Calendar, Send, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export default function BlogMaker() {
    const [tab, setTab] = useState('workers');
    const [workers, setWorkers] = useState([]);
    const [microsites, setMicrosites] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([loadWorkers(), loadMicrosites(), loadAllPosts(), loadNotifications()])
            .finally(() => setLoading(false));
    }, []);

    async function loadWorkers() {
        try {
            const data = await api('/blogmaker/workers');
            setWorkers(data.workers || []);
        } catch (err) { console.error(err); }
    }
    async function loadMicrosites() {
        try {
            const data = await api('/storefront/microsites');
            setMicrosites(data.microsites || []);
        } catch (err) { console.error(err); }
    }
    async function loadAllPosts() {
        try {
            const data = await api('/blogmaker/posts');
            setAllPosts(data.posts || []);
        } catch (err) { console.error(err); }
    }
    async function loadNotifications() {
        try {
            const data = await api('/blogmaker/notifications');
            setNotifications(data.notifications || []);
        } catch (err) { console.error(err); }
    }

    const tabs = [
        { key: 'workers', label: 'Workers', icon: Bot },
        { key: 'queue', label: 'Queue', icon: Calendar },
        { key: 'published', label: 'Published', icon: FileText },
    ];

    const pendingNotifs = notifications.filter(n => n.status === 'paused').length;

    if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Bot className="w-7 h-7 text-brand-400" /> BlogMaker 3000
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">AI-powered blog queue — research, write, publish, notify</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface-800 rounded-xl p-1 w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                        {t.key === 'published' && pendingNotifs > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">{pendingNotifs}</span>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'workers' && <WorkersTab workers={workers} microsites={microsites} onRefresh={loadWorkers} />}
            {tab === 'queue' && <QueueTab workers={workers} onRefresh={() => { loadWorkers(); loadAllPosts(); loadNotifications(); }} />}
            {tab === 'published' && <PublishedTab posts={allPosts} notifications={notifications} onRefresh={() => { loadAllPosts(); loadNotifications(); }} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// WORKERS TAB
// ═══════════════════════════════════════════════════════════════
function WorkersTab({ workers, microsites, onRefresh }) {
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ worker_name: '', worker_title: '', microsite_id: '', affiliate_links: '', prompt_template: '' });

    async function createWorker(e) {
        e.preventDefault();
        const affiliateLinks = form.affiliate_links.split('\n').filter(Boolean).map(line => {
            const [url, ...rest] = line.split('|');
            return { url: url.trim(), productName: rest.join('|').trim() || 'Product' };
        });
        try {
            await api('/blogmaker/workers', { body: { ...form, affiliate_links: affiliateLinks } });
            setShowCreate(false);
            setForm({ worker_name: '', worker_title: '', microsite_id: '', affiliate_links: '', prompt_template: '' });
            onRefresh();
        } catch (err) { console.error(err); }
    }

    async function deleteWorker(id) {
        if (!confirm('Delete this worker?')) return;
        await api(`/blogmaker/workers/${id}`, { method: 'DELETE' });
        onRefresh();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Blog Workers</h2>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Worker
                </button>
            </div>

            {showCreate && (
                <form onSubmit={createWorker} className="bg-surface-800 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="text-white font-semibold">Create Blog Worker</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Persona Name</label>
                            <input value={form.worker_name} onChange={e => setForm({ ...form, worker_name: e.target.value })} placeholder="Jake Firestone" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" required />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">Title / Expertise</label>
                            <input value={form.worker_title} onChange={e => setForm({ ...form, worker_title: e.target.value })} placeholder="Outdoor living enthusiast" className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-400 block mb-1">Assign to Microsite</label>
                            <select value={form.microsite_id} onChange={e => setForm({ ...form, microsite_id: e.target.value })} className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm">
                                <option value="">Select microsite...</option>
                                {microsites.map(ms => <option key={ms.id} value={ms.id}>{ms.subdomain}.dealfindai.com — {ms.site_title}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Affiliate Links <span className="text-gray-600">(one per line: URL | Product Name)</span></label>
                        <textarea value={form.affiliate_links} onChange={e => setForm({ ...form, affiliate_links: e.target.value })} rows="3" placeholder={"https://example.com/product-1 | Fire Pit\nhttps://example.com/product-2 | BBQ Smoker"} className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm font-mono" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Writing Instructions <span className="text-gray-600">(tone, audience, style)</span></label>
                        <textarea value={form.prompt_template} onChange={e => setForm({ ...form, prompt_template: e.target.value })} rows="2" placeholder="Write casually for homeowners 30-55. Mention personal experience." className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium">Create Worker</button>
                    </div>
                </form>
            )}

            {workers.length === 0 ? (
                <div className="text-center py-16">
                    <Bot className="w-14 h-14 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">No Workers Yet</h3>
                    <p className="text-gray-400 text-sm mb-4">Create a worker with a persona and affiliate links to start</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {workers.map(w => (
                        <div key={w.id} className="bg-surface-800 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {(w.worker_name || 'W')[0]}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm">{w.worker_name}</h4>
                                    <p className="text-gray-500 text-xs">{w.worker_title || 'Writer'} · {w.subdomain ? `${w.subdomain}.dealfindai.com` : 'No microsite'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-white text-sm font-medium">{w.post_count || 0} <span className="text-gray-500 font-normal">posts</span></p>
                                    <p className="text-xs text-gray-500">{w.queue_pending || 0} queued</p>
                                </div>
                                <button onClick={() => deleteWorker(w.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// QUEUE TAB
// ═══════════════════════════════════════════════════════════════
function QueueTab({ workers, onRefresh }) {
    const [selectedWorker, setSelectedWorker] = useState(workers[0]?.id || '');
    const [queue, setQueue] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    // Manual add form
    const [entries, setEntries] = useState([{ reference_url: '', topic: '', target_keyword: '', scheduled_at: '' }]);

    // Smart suggest URLs
    const [suggestUrls, setSuggestUrls] = useState('');

    useEffect(() => { if (selectedWorker) loadQueue(); }, [selectedWorker]);

    async function loadQueue() {
        try {
            const data = await api(`/blogmaker/workers/${selectedWorker}/queue`);
            setQueue(data.queue || []);
        } catch (err) { console.error(err); }
    }

    async function addEntries(entriesToAdd) {
        try {
            await api(`/blogmaker/workers/${selectedWorker}/queue`, { body: { entries: entriesToAdd } });
            setShowAdd(false);
            setEntries([{ reference_url: '', topic: '', target_keyword: '', scheduled_at: '' }]);
            setSuggestions([]);
            loadQueue();
            onRefresh();
        } catch (err) { console.error(err); }
    }

    async function handleSmartSuggest() {
        const urls = suggestUrls.split('\n').filter(Boolean).map(u => u.trim());
        if (urls.length === 0) return;
        setSuggesting(true);
        try {
            const data = await api(`/blogmaker/workers/${selectedWorker}/smart-suggest`, { body: { reference_urls: urls } });
            const start = new Date();
            start.setDate(start.getDate() + 1);
            start.setHours(9, 0, 0, 0);

            const withDates = (data.suggestions || []).map((s, i) => ({
                ...s,
                scheduled_at: new Date(start.getTime() + i * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            }));
            setSuggestions(withDates);
        } catch (err) { console.error(err); }
        setSuggesting(false);
    }

    async function deleteEntry(id) {
        await api(`/blogmaker/queue/${id}`, { method: 'DELETE' });
        loadQueue();
        onRefresh();
    }

    function addRow() {
        setEntries([...entries, { reference_url: '', topic: '', target_keyword: '', scheduled_at: '' }]);
    }

    function updateEntry(i, field, val) {
        const updated = [...entries];
        updated[i] = { ...updated[i], [field]: val };
        setEntries(updated);
    }

    const pending = queue.filter(q => q.status === 'pending');
    const completed = queue.filter(q => q.status !== 'pending');

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}
                    className="px-3 py-2.5 bg-surface-800 border border-white/10 rounded-lg text-white text-sm">
                    {workers.map(w => <option key={w.id} value={w.id}>{w.worker_name}</option>)}
                </select>
                <button onClick={() => { setShowAdd(true); setSuggestions([]); }} className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium">
                    <Plus className="w-4 h-4" /> Add to Queue
                </button>
            </div>

            {/* Smart Suggest or Manual Add */}
            {showAdd && (
                <div className="bg-surface-800 border border-white/10 rounded-2xl p-6 mb-6 space-y-5">
                    {/* Smart Suggest */}
                    <div>
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Smart Suggest</h3>
                        <p className="text-gray-500 text-xs mb-3">Paste reference article URLs — AI generates paired topics, keywords, and auto-spaces dates</p>
                        <textarea value={suggestUrls} onChange={e => setSuggestUrls(e.target.value)} rows="3"
                            placeholder={"https://popularsite.com/how-to-smoke-meat\nhttps://anothersite.com/10-best-fire-pits\nhttps://blogsite.com/backyard-essentials"}
                            className="w-full px-3 py-2.5 bg-surface-700 border border-white/10 rounded-lg text-white text-sm font-mono" />
                        <button onClick={handleSmartSuggest} disabled={suggesting} className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                            <Sparkles className="w-4 h-4" /> {suggesting ? 'Analyzing articles...' : 'Generate Suggestions'}
                        </button>
                    </div>

                    {/* Suggestions Result */}
                    {suggestions.length > 0 && (
                        <div>
                            <h3 className="text-white font-semibold mb-3">Suggested Queue ({suggestions.length} entries)</h3>
                            <div className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="bg-surface-700 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                                        <div className="md:col-span-1">
                                            <p className="text-xs text-gray-500 truncate">{s.reference_url}</p>
                                        </div>
                                        <div className="md:col-span-1">
                                            <input value={s.topic} onChange={e => {
                                                const u = [...suggestions]; u[i] = { ...u[i], topic: e.target.value }; setSuggestions(u);
                                            }} className="w-full px-2 py-1.5 bg-surface-600 rounded text-white text-sm" />
                                        </div>
                                        <div>
                                            <input value={s.target_keyword || ''} onChange={e => {
                                                const u = [...suggestions]; u[i] = { ...u[i], target_keyword: e.target.value }; setSuggestions(u);
                                            }} placeholder="keyword" className="w-full px-2 py-1.5 bg-surface-600 rounded text-white text-sm" />
                                        </div>
                                        <div>
                                            <input type="datetime-local" value={s.scheduled_at || ''} onChange={e => {
                                                const u = [...suggestions]; u[i] = { ...u[i], scheduled_at: e.target.value }; setSuggestions(u);
                                            }} className="w-full px-2 py-1.5 bg-surface-600 rounded text-white text-sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-3">
                                <button onClick={() => addEntries(suggestions)} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium">
                                    <CheckCircle className="w-4 h-4 inline mr-1.5" /> Approve All
                                </button>
                                <button onClick={() => setSuggestions([])} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Discard</button>
                            </div>
                        </div>
                    )}

                    {/* Manual Add */}
                    {suggestions.length === 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-semibold">Or Add Manually</h3>
                                <button onClick={addRow} className="text-xs text-brand-400 hover:text-brand-300">+ Add Row</button>
                            </div>
                            <div className="space-y-2">
                                {entries.map((entry, i) => (
                                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <input value={entry.reference_url} onChange={e => updateEntry(i, 'reference_url', e.target.value)} placeholder="Reference URL" className="px-3 py-2 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                                        <input value={entry.topic} onChange={e => updateEntry(i, 'topic', e.target.value)} placeholder="Blog Topic" className="px-3 py-2 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                                        <input value={entry.target_keyword} onChange={e => updateEntry(i, 'target_keyword', e.target.value)} placeholder="Target Keyword" className="px-3 py-2 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                                        <input type="datetime-local" value={entry.scheduled_at} onChange={e => updateEntry(i, 'scheduled_at', e.target.value)} className="px-3 py-2 bg-surface-700 border border-white/10 rounded-lg text-white text-sm" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addEntries(entries.filter(e => e.reference_url && e.topic))} className="mt-3 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium">
                                Add to Queue
                            </button>
                        </div>
                    )}

                    <button onClick={() => setShowAdd(false)} className="text-sm text-gray-500 hover:text-gray-300">Close</button>
                </div>
            )}

            {/* Pending Queue */}
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Scheduled ({pending.length})</h3>
            {pending.length === 0 ? (
                <p className="text-gray-600 text-sm mb-6">No pending items. Add entries above to schedule blog posts.</p>
            ) : (
                <div className="space-y-2 mb-6">
                    {pending.map(q => (
                        <div key={q.id} className="bg-surface-800 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-white text-sm font-medium truncate">{q.topic}</p>
                                <p className="text-gray-500 text-xs truncate">{q.reference_url} · {q.target_keyword || 'auto keyword'}</p>
                                <p className="text-gray-600 text-xs mt-1">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {q.scheduled_at ? new Date(q.scheduled_at).toLocaleString() : 'No date set'}
                                </p>
                            </div>
                            <button onClick={() => deleteEntry(q.id)} className="p-2 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
                <>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Completed ({completed.length})</h3>
                    <div className="space-y-2">
                        {completed.map(q => (
                            <div key={q.id} className="bg-surface-800 border border-white/10 rounded-xl p-3 flex items-center justify-between opacity-70">
                                <div className="min-w-0 flex-1">
                                    <p className="text-white text-sm truncate">{q.post_title || q.topic}</p>
                                    <p className="text-gray-500 text-xs">{q.status === 'failed' ? `❌ ${q.error || 'Failed'}` : '✅ Published'}</p>
                                </div>
                                {q.post_slug && (
                                    <a href={`/blog/${q.post_id}/edit`} className="text-xs text-brand-400 hover:text-brand-300 font-medium">Edit</a>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PUBLISHED TAB
// ═══════════════════════════════════════════════════════════════
function PublishedTab({ posts, notifications, onRefresh }) {
    const pendingNotifs = notifications.filter(n => n.status === 'paused');
    const sentNotifs = notifications.filter(n => n.status === 'sent');

    async function publishPost(postId, action) {
        await api(`/blogmaker/posts/${postId}/${action}`, { method: 'POST' });
        onRefresh();
    }

    async function approveNotification(id) {
        await api(`/blogmaker/notifications/${id}/approve`, { method: 'POST' });
        onRefresh();
    }

    async function deleteNotification(id) {
        await api(`/blogmaker/notifications/${id}`, { method: 'DELETE' });
        onRefresh();
    }

    return (
        <div>
            {/* Pending Notifications (admin approval) */}
            {pendingNotifs.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" /> Awaiting Approval ({pendingNotifs.length})
                    </h3>
                    <p className="text-gray-500 text-xs mb-3">New blog posts generated email notifications. Review and approve to send to subscribers.</p>
                    <div className="space-y-2">
                        {pendingNotifs.map(n => (
                            <div key={n.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-white text-sm font-medium">{n.subject}</p>
                                    <p className="text-gray-500 text-xs">{n.category} subscribers · {new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2 shrink-0 ml-3">
                                    <button onClick={() => approveNotification(n.id)} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium">Approve & Send</button>
                                    <button onClick={() => deleteNotification(n.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Posts */}
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-brand-400" /> All Posts ({posts.length})</h3>
            {posts.length === 0 ? (
                <p className="text-gray-600 text-sm">No blog posts yet. Add items to the queue to start generating.</p>
            ) : (
                <div className="space-y-2">
                    {posts.map(post => (
                        <div key={post.id} className="bg-surface-800 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{post.title}</p>
                                    <p className="text-gray-500 text-xs">
                                        {post.worker_name || 'Staff'} · {post.subdomain ? `${post.subdomain}.dealfindai.com` : ''} · {post.target_keyword} · {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{post.status}</span>
                                {post.status === 'draft' ? (
                                    <button onClick={() => publishPost(post.id, 'publish')} className="text-xs text-green-400 hover:text-green-300 font-medium">Publish</button>
                                ) : (
                                    <button onClick={() => publishPost(post.id, 'unpublish')} className="text-xs text-yellow-400 hover:text-yellow-300 font-medium">Unpublish</button>
                                )}
                                {post.subdomain && post.slug && (
                                    <a href={`https://${post.subdomain}.dealfindai.com/blog/${post.slug}`} target="_blank" rel="noopener" className="text-xs text-gray-400 hover:text-white">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                                <a href={`/blog/${post.id}/edit`} className="text-xs text-brand-400 hover:text-brand-300 font-medium">Edit</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sent Notifications History */}
            {sentNotifs.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-gray-400 font-semibold mb-3 flex items-center gap-2"><Send className="w-4 h-4" /> Sent Notifications</h3>
                    <div className="space-y-1">
                        {sentNotifs.map(n => (
                            <div key={n.id} className="flex items-center justify-between py-2 px-3 text-sm text-gray-500">
                                <span className="truncate">{n.subject}</span>
                                <span className="text-xs shrink-0 ml-2">{n.sent_count} sent · {new Date(n.approved_at || n.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
