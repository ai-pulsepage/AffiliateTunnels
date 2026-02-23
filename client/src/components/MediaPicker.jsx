import { useEffect, useState } from 'react';
import { mediaApi } from '../lib/api';
import { useFunnel } from './FunnelContext';
import { Upload, Folder, Image as ImageIcon, Film, FileImage, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * MediaPicker — modal for selecting a media file.
 * Props:
 *   isOpen:    boolean
 *   onClose:   () => void
 *   onSelect:  (url, media) => void  — called when user picks a file
 *   accept:    'image' | 'video' | 'all' (default 'all')
 */
export default function MediaPicker({ isOpen, onClose, onSelect, accept = 'all', funnelId: propFunnelId }) {
    const { selectedFunnelId: ctxFunnelId } = useFunnel();
    const selectedFunnelId = propFunnelId || ctxFunnelId;
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) loadFolders();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) loadMedia();
    }, [selectedFolder, isOpen]);

    async function loadFolders() {
        try {
            const d = await mediaApi.listFolders();
            let list = d.folders || [];
            if (selectedFunnelId) list = list.filter(f => f.funnel_id === selectedFunnelId || !f.funnel_id);
            setFolders(list);
            const funnelFolder = list.find(f => f.funnel_id === selectedFunnelId);
            setSelectedFolder(funnelFolder || null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function loadMedia() {
        try {
            const opts = {};
            if (selectedFolder) opts.folder_id = selectedFolder.id;
            else if (selectedFunnelId) opts.funnel_id = selectedFunnelId;
            const d = await mediaApi.list(opts);
            let list = d.media || [];
            // Filter by accept type
            if (accept === 'image') list = list.filter(m => m.mime_type?.startsWith('image/'));
            if (accept === 'video') list = list.filter(m => m.mime_type?.startsWith('video/'));
            setMedia(list);
        } catch (err) { console.error(err); }
    }

    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const d = await mediaApi.upload(file, selectedFolder?.id || null);
            setMedia(prev => [d.media, ...prev]);
            toast.success('Uploaded!');
        } catch (err) { toast.error(err.message); }
        finally { setUploading(false); e.target.value = ''; }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-surface-850 rounded-2xl w-full max-w-2xl max-h-[80vh] border border-white/10 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Select Media</h3>
                    <div className="flex items-center gap-3">
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-brand-500 ${uploading ? 'opacity-50' : ''}`}>
                            <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload'}
                            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*,.gif' : 'image/*,video/*,.gif'} />
                        </label>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Folder list */}
                    <div className="w-40 shrink-0 border-r border-white/5 overflow-y-auto p-2 space-y-1">
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${!selectedFolder ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <ImageIcon className="w-3.5 h-3.5" /> All
                        </button>
                        {folders.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFolder(f)}
                                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs truncate ${selectedFolder?.id === f.id ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Folder className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Media grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="text-center text-gray-500 py-8">Loading...</div>
                        ) : media.length === 0 ? (
                            <div className="text-center py-12">
                                <ImageIcon className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No files. Upload one above.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {media.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => { onSelect(m.file_url, m); onClose(); }}
                                        className="group relative rounded-lg overflow-hidden border border-white/5 hover:border-brand-500/50 hover:ring-1 hover:ring-brand-500/30 transition-all"
                                    >
                                        {m.mime_type?.startsWith('image/') || m.mime_type?.includes('gif') ? (
                                            <img src={m.file_url} alt={m.filename} className="w-full h-24 object-cover" loading="lazy" />
                                        ) : m.mime_type?.startsWith('video/') ? (
                                            <div className="w-full h-24 bg-surface-700 flex items-center justify-center">
                                                <Film className="w-6 h-6 text-purple-400" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-24 bg-surface-700 flex items-center justify-center">
                                                <FileImage className="w-6 h-6 text-blue-400" />
                                            </div>
                                        )}
                                        <p className="text-[10px] text-gray-400 truncate px-2 py-1.5">{m.filename}</p>
                                        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/10 transition-colors flex items-center justify-center">
                                            <Check className="w-5 h-5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
