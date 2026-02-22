import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Search, Ban, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, [page, search]);

    async function loadUsers() {
        try { const d = await adminApi.getUsers(page, search); setUsers(d.users || []); setTotal(d.total || 0); }
        catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleSuspend(id) {
        try { const d = await adminApi.suspendUser(id); setUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: d.user.is_suspended } : u)); toast.success(d.user.is_suspended ? 'Suspended' : 'Unsuspended'); }
        catch (err) { toast.error(err.message); }
    }

    async function handleDelete(id) {
        if (!confirm('Permanently delete this user and all their data?')) return;
        try { await adminApi.deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); toast.success('User deleted'); }
        catch (err) { toast.error(err.message); }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">User Management</h1>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" placeholder="Search users..." />
            </div>

            <p className="text-sm text-gray-500">{total} total users</p>

            {loading ? <div className="card animate-pulse h-64" /> : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-white/5 text-left">
                            <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Role</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Tier</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Funnels</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
                            <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="px-4 py-3 text-white">{u.email}</td>
                                    <td className="px-4 py-3 text-gray-300">{u.name || '—'}</td>
                                    <td className="px-4 py-3"><span className={u.role === 'admin' ? 'badge badge-success' : 'badge badge-info'}>{u.role}</span></td>
                                    <td className="px-4 py-3 text-gray-300 uppercase text-xs">{u.tier}</td>
                                    <td className="px-4 py-3 text-gray-400">{u.funnel_count}</td>
                                    <td className="px-4 py-3">{u.is_suspended ? <span className="badge bg-red-500/10 text-red-400 border-red-500/20">Suspended</span> : <span className="badge badge-success">Active</span>}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => handleSuspend(u.id)} className="p-1.5 hover:bg-amber-500/10 rounded-lg" title="Toggle suspend"><Ban className="w-3.5 h-3.5 text-amber-400" /></button>
                                            {u.role !== 'admin' && <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {total > 50 && (
                <div className="flex justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">Prev</button>
                    <span className="text-sm text-gray-500 py-2">Page {page}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={users.length < 50} className="btn-secondary text-sm">Next</button>
                </div>
            )}
        </div>
    );
}
