import { useEffect, useState } from 'react';
import { templateApi } from '../lib/api';
import { Layout as LayoutIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadTemplates(); }, []);

    async function loadTemplates() {
        try { const d = await templateApi.list(); setTemplates(d.templates || []); }
        catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this template?')) return;
        try { await templateApi.delete(id); setTemplates(prev => prev.filter(t => t.id !== id)); toast.success('Deleted'); }
        catch (err) { toast.error(err.message); }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Templates</h1>

            {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-40" />)}</div> :
                templates.length === 0 ? (
                    <div className="card text-center py-12"><LayoutIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No templates yet. Save a page as a template from the page builder.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(t => (
                            <div key={t.id} className="card-hover group">
                                {t.thumbnail_url ? <img src={t.thumbnail_url} alt={t.name} className="w-full h-32 object-cover rounded-lg mb-3" /> :
                                    <div className="w-full h-32 bg-surface-700 rounded-lg mb-3 flex items-center justify-center"><LayoutIcon className="w-8 h-8 text-gray-600" /></div>}
                                <div className="flex items-start justify-between">
                                    <div><h3 className="font-semibold text-white">{t.name}</h3>
                                        <div className="flex gap-2 mt-1">{t.category && <span className="badge badge-info">{t.category}</span>}{t.is_global && <span className="badge badge-success">Global</span>}</div>
                                    </div>
                                    {!t.is_global && <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
