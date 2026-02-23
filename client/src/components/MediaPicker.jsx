import { useEffect, useState, useMemo } from 'react';
import { mediaApi } from '../lib/api';
import { Upload, FolderOpen, Image as ImageIcon, Film, FileText, X, Check, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * MediaPicker — modal for selecting a media file.
 * Props:
 *   isOpen:    boolean
 *   onClose:   () => void
 *   onSelect:  (url, media) => void  — called when user picks a file
 *   accept:    'image' | 'video' | 'all' (default 'all')
 *   funnelId:  optional — if set, auto-show that funnel's folders first
 */
export default function MediaPicker({ isOpen, onClose, onSelect, accept = 'all', funnelId }) {
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
            const list = d.folders || [];
            setFolders(list);
            // Always start at root — user can navigate to any folder
            setSelectedFolder(null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function loadMedia() {
        try {
            const params = {};
            if (selectedFolder) {
                params.folder_id = selectedFolder.id;
            } else if (funnelId) {
                params.funnel_id = funnelId;
            }
            const d = await mediaApi.list(params);
            let list = d.media || [];
            if (accept === 'image') list = list.filter(m => m.mime_type?.startsWith('image/'));
            if (accept === 'video') list = list.filter(m => m.mime_type?.startsWith('video/'));
            setMedia(list);
        } catch (err) { console.error(err); }
    }

    // Group folders: funnel folders first, then general
    const sortedFolders = useMemo(() => {
        if (!funnelId) return folders;
        const funnelFolders = folders.filter(f => f.funnel_id === funnelId);
        const otherFolders = folders.filter(f => f.funnel_id !== funnelId);
        return [...funnelFolders, ...otherFolders];
    }, [folders, funnelId]);

    async function handleUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (selectedFolder?.id) formData.append('folder_id', selectedFolder.id);
            const d = await mediaApi.upload(formData);
            setMedia(prev => [d.media, ...prev]);
            toast.success('Uploaded!');
        } catch (err) { toast.error(err.message); }
        finally { setUploading(false); e.target.value = ''; }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-surface-800 rounded-2xl w-full max-w-2xl max-h-[80vh] border border-white/10 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <div>
                        <h3 className="text-lg font-bold text-white">Select Media</h3>
                        {funnelId && <p className="text-xs text-gray-500 mt-0.5">Showing this funnel's media first</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-brand-500 transition-colors ${uploading ? 'opacity-50' : ''}`}>
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
                    <div className="w-44 shrink-0 border-r border-white/5 overflow-y-auto p-2 space-y-0.5">
                        <button
                            onClick={() => setSelectedFolder(null)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${!selectedFolder ? 'bg-brand-600/20 text-brand-400 font-medium' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Layers className="w-3.5 h-3.5" /> All Files
                        </button>
                        {sortedFolders.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFolder(f)}
                                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs truncate transition-colors ${selectedFolder?.id === f.id ? 'bg-brand-600/20 text-brand-400 font-medium' : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{f.name}</span>
                                {f.funnel_id === funnelId && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                                )}
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
                                        {m.mime_type?.startsWith('image/') ? (
                                            <img src={m.file_url} alt={m.filename} className="w-full h-24 object-cover" loading="lazy" />
                                        ) : m.mime_type?.startsWith('video/') ? (
                                            <div className="w-full h-24 bg-surface-700 flex items-center justify-center">
                                                <Film className="w-6 h-6 text-purple-400" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-24 bg-surface-700 flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-400" />
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
