import { useEffect, useState } from 'react';
import { mediaApi, funnelApi } from '../lib/api';
import { useFunnel } from '../components/FunnelContext';
import {
    Upload, Trash2, Image as ImageIcon, Copy, FolderPlus, Folder, Film, FileImage, X,
    ChevronDown, ChevronRight, Plus, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MediaLibrary() {
    const { selectedFunnelId, selectedFunnel } = useFunnel();
    const [funnels, setFunnels] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderFunnel, setNewFolderFunnel] = useState('');
    const [expandedFunnels, setExpandedFunnels] = useState({});
    const [viewMode, setViewMode] = useState('all'); // 'all' or funnel id

    useEffect(() => { loadAll(); }, []);
    useEffect(() => { loadMedia(); }, [selectedFolder, viewMode]);

    async function loadAll() {
        try {
            const [fData, mfData] = await Promise.all([
                funnelApi.list(),
                mediaApi.listFolders()
            ]);
            setFunnels(fData.funnels || []);
            setFolders(mfData.folders || []);
            // Auto-expand all funnels
            const exp = {};
            (fData.funnels || []).forEach(f => { exp[f.id] = true; });
            exp['unassigned'] = true;
            setExpandedFunnels(exp);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function loadMedia() {
        try {
            const opts = {};
            if (selectedFolder) opts.folder_id = selectedFolder.id;
            else if (viewMode !== 'all') opts.funnel_id = viewMode;
            const d = await mediaApi.list(opts);
            setMedia(d.media || []);
        } catch (err) { toast.error(err.message); }
    }

    async function handleCreateFolder() {
        if (!newFolderName.trim()) return;
        try {
            const d = await mediaApi.createFolder(newFolderName.trim(), newFolderFunnel || null);
            setFolders(prev => [d.folder, ...prev]);
            setSelectedFolder(d.folder);
            setNewFolderName('');
            setNewFolderFunnel('');
            setShowNewFolder(false);
            toast.success('Folder created!');
        } catch (err) { toast.error(err.message); }
    }

    async function handleDeleteFolder(id) {
        if (!confirm('Delete this folder? Files will be moved to unsorted.')) return;
        try {
            await mediaApi.deleteFolder(id);
            setFolders(prev => prev.filter(f => f.id !== id));
            if (selectedFolder?.id === id) setSelectedFolder(null);
            toast.success('Folder deleted');
        } catch (err) { toast.error(err.message); }
    }

    async function handleUpload(e) {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const d = await mediaApi.upload(file, selectedFolder?.id || null);
                setMedia(prev => [d.media, ...prev]);
            }
            toast.success(`${files.length} file(s) uploaded!`);
        } catch (err) { toast.error(err.message); }
        finally { setUploading(false); e.target.value = ''; }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this file permanently?')) return;
        try {
            await mediaApi.delete(id);
            setMedia(prev => prev.filter(m => m.id !== id));
            toast.success('Deleted');
        } catch (err) { toast.error(err.message); }
    }

    function copyUrl(url) {
        navigator.clipboard.writeText(url);
        toast.success('URL copied!');
    }

    function formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function toggleFunnel(id) {
        setExpandedFunnels(prev => ({ ...prev, [id]: !prev[id] }));
    }

    // Group folders by funnel
    const funnelFolders = {};
    funnels.forEach(f => { funnelFolders[f.id] = []; });
    funnelFolders['unassigned'] = [];
    folders.forEach(f => {
        const key = f.funnel_id || 'unassigned';
        if (!funnelFolders[key]) funnelFolders[key] = [];
        funnelFolders[key].push(f);
    });

    return (
        <div className="flex gap-6 h-full">
            {/* Folder Sidebar */}
            <div className="w-64 shrink-0 space-y-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white">Media Library</h2>
                    <button
                        onClick={() => setShowNewFolder(true)}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        title="New folder"
                    >
                        <FolderPlus className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* New folder form */}
                {showNewFolder && (
                    <div className="mb-3 p-3 bg-surface-800 border border-white/10 rounded-xl space-y-2">
                        <input
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                            placeholder="Folder name"
                            className="w-full bg-surface-700 border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            autoFocus
                        />
                        <select
                            value={newFolderFunnel}
                            onChange={e => setNewFolderFunnel(e.target.value)}
                            className="w-full bg-surface-700 border border-white/10 text-white text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                            <option value="">— No funnel (general) —</option>
                            {funnels.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-1.5">
                            <button onClick={handleCreateFolder} className="flex-1 px-2 py-1.5 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-500">Create</button>
                            <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); setNewFolderFunnel(''); }} className="px-2 py-1.5 text-gray-500 hover:text-white text-xs">Cancel</button>
                        </div>
                    </div>
                )}

                {/* All Files */}
                <button
                    onClick={() => { setSelectedFolder(null); setViewMode('all'); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${!selectedFolder && viewMode === 'all'
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                    <ImageIcon className="w-4 h-4 shrink-0" /> All Files
                </button>

                {/* Per-funnel sections */}
                {funnels.map(f => (
                    <div key={f.id}>
                        <button
                            onClick={() => { toggleFunnel(f.id); setSelectedFolder(null); setViewMode(f.id); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${viewMode === f.id && !selectedFolder
                                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            {expandedFunnels[f.id]
                                ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                            <Layers className="w-3.5 h-3.5 shrink-0 text-brand-500" />
                            <span className="truncate font-medium">{f.name}</span>
                        </button>

                        {expandedFunnels[f.id] && (funnelFolders[f.id] || []).map(folder => (
                            <div key={folder.id} className="group relative ml-4">
                                <button
                                    onClick={() => { setSelectedFolder(folder); setViewMode(f.id); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${selectedFolder?.id === folder.id
                                        ? 'bg-brand-600/15 text-brand-400'
                                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                                >
                                    <Folder className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-[10px] text-gray-600">{folder.file_count || 0}</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteFolder(folder.id)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {expandedFunnels[f.id] && (!funnelFolders[f.id] || funnelFolders[f.id].length === 0) && (
                            <p className="ml-8 text-[10px] text-gray-600 py-1">No folders yet</p>
                        )}
                    </div>
                ))}

                {/* Unassigned folders */}
                {funnelFolders['unassigned'].length > 0 && (
                    <div>
                        <button
                            onClick={() => toggleFunnel('unassigned')}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300"
                        >
                            {expandedFunnels['unassigned']
                                ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                            <span className="text-xs font-medium uppercase tracking-wider">General</span>
                        </button>
                        {expandedFunnels['unassigned'] && funnelFolders['unassigned'].map(folder => (
                            <div key={folder.id} className="group relative ml-4">
                                <button
                                    onClick={() => { setSelectedFolder(folder); setViewMode('all'); }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${selectedFolder?.id === folder.id
                                        ? 'bg-brand-600/15 text-brand-400'
                                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                                >
                                    <Folder className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-[10px] text-gray-600">{folder.file_count || 0}</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteFolder(folder.id)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">
                        {selectedFolder
                            ? selectedFolder.name
                            : viewMode !== 'all'
                                ? `${funnels.find(f => f.id === viewMode)?.name || ''} Media`
                                : 'All Media'}
                    </h1>
                    <label className={`flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-brand-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Files'}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*,video/*,.gif" multiple />
                    </label>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="bg-surface-800 animate-pulse h-40 rounded-xl" />)}
                    </div>
                ) : media.length === 0 ? (
                    <div className="bg-surface-800 border border-white/5 rounded-xl text-center py-16">
                        <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400 text-lg font-medium mb-1">No files yet</p>
                        <p className="text-gray-600 text-sm">Upload images, GIFs, or videos to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {media.map(m => (
                            <div key={m.id} className="group relative bg-surface-800 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                                {m.mime_type?.startsWith('image/') || m.mime_type?.includes('gif') ? (
                                    <img src={m.file_url} alt={m.filename} className="w-full h-36 object-cover" loading="lazy" />
                                ) : m.mime_type?.startsWith('video/') ? (
                                    <video src={m.file_url} className="w-full h-36 object-cover" muted />
                                ) : (
                                    <div className="w-full h-36 flex items-center justify-center bg-surface-700">
                                        {m.mime_type?.startsWith('video/')
                                            ? <Film className="w-6 h-6 text-purple-400" />
                                            : m.mime_type?.includes('gif')
                                                ? <FileImage className="w-6 h-6 text-green-400" />
                                                : <ImageIcon className="w-6 h-6 text-blue-400" />}
                                    </div>
                                )}
                                <div className="px-3 py-2.5">
                                    <p className="text-xs font-medium text-white truncate">{m.filename}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{formatSize(m.file_size)}</p>
                                </div>
                                {/* Actions overlay */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => copyUrl(m.file_url)} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80" title="Copy URL">
                                        <Copy className="w-3 h-3 text-white" />
                                    </button>
                                    <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-red-600/80" title="Delete">
                                        <Trash2 className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
