import { useEffect, useState } from 'react';
import { mediaApi } from '../lib/api';
import { Upload, Trash2, Image as ImageIcon, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaLibrary() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => { loadMedia(); }, []);

    async function loadMedia() {
        try { const d = await mediaApi.list(); setMedia(d.media || []); }
        catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try { const d = await mediaApi.upload(file); setMedia(prev => [d.media, ...prev]); toast.success('Uploaded!'); }
        catch (err) { toast.error(err.message); }
        finally { setUploading(false); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this file?')) return;
        try { await mediaApi.delete(id); setMedia(prev => prev.filter(m => m.id !== id)); toast.success('Deleted'); }
        catch (err) { toast.error(err.message); }
    }

    function copyUrl(url) { navigator.clipboard.writeText(url); toast.success('URL copied!'); }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Media Library</h1>
                <label className={`btn-primary flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*,video/*,.pdf,.doc,.docx" />
                </label>
            </div>

            {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse h-40" />)}</div> :
                media.length === 0 ? (
                    <div className="card text-center py-12"><ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No files uploaded yet.</p></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {media.map(m => (
                            <div key={m.id} className="card-hover group relative">
                                {m.mime_type?.startsWith('image/') ? (
                                    <img src={m.file_url} alt={m.filename} className="w-full h-32 object-cover rounded-lg mb-2" />
                                ) : (
                                    <div className="w-full h-32 bg-surface-700 rounded-lg mb-2 flex items-center justify-center">
                                        <span className="text-xs text-gray-500 uppercase">{m.mime_type?.split('/')[1] || 'file'}</span>
                                    </div>
                                )}
                                <p className="text-xs text-white truncate">{m.filename}</p>
                                <p className="text-xs text-gray-500">{m.file_size ? (m.file_size / 1024).toFixed(1) + ' KB' : ''}</p>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => copyUrl(m.file_url)} className="p-1.5 bg-surface-800/80 hover:bg-white/10 rounded-lg"><Copy className="w-3 h-3 text-gray-300" /></button>
                                    <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-surface-800/80 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
