import { useEffect, useState, useMemo } from 'react';
import { mediaApi, funnelApi } from '../lib/api';
import {
    Upload, FolderPlus, Trash2, Image, Film, FileText,
    Search, ChevronDown, ChevronRight, X, Pencil, Download,
    HardDrive, FolderOpen, Layers, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_FILTERS = [
    { key: 'all', label: 'All', icon: Layers },
    { key: 'image', label: 'Images', icon: Image },
    { key: 'video', label: 'Videos', icon: Film },
    { key: 'gif', label: 'GIFs', icon: FileText },
];

function getMediaType(mime) {
    if (!mime) return 'other';
    if (mime === 'image/gif') return 'gif';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    return 'other';
}

export default function MediaLibrary() {
    const [media, setMedia] = useState([]);
    const [folders, setFolders] = useState([]);
    const [funnels, setFunnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Filters
    const [selectedFunnelId, setSelectedFunnelId] = useState(null);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [typeFilter, setTypeFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderFunnelId, setNewFolderFunnelId] = useState('');
    const [editingFolder, setEditingFolder] = useState(null);

    // Sidebar collapsed funnels
    const [collapsedFunnels, setCollapsedFunnels] = useState({});

    useEffect(() => { loadAll(); }, []);

    async function loadAll() {
        try {
            const [mediaData, folderData, funnelData] = await Promise.all([
                mediaApi.list(),
                mediaApi.listFolders(),
                funnelApi.list(),
            ]);
            setMedia(mediaData.media || []);
            setFolders(folderData.folders || []);
            setFunnels(funnelData.funnels || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    // Group folders by funnel
    const groupedFolders = useMemo(() => {
        const groups = {};
        const general = [];

        folders.forEach(f => {
            if (f.funnel_id) {
                if (!groups[f.funnel_id]) {
                    groups[f.funnel_id] = { funnel: funnels.find(fn => fn.id === f.funnel_id), folders: [] };
                }
                groups[f.funnel_id].folders.push(f);
            } else {
                general.push(f);
            }
        });

        return { groups, general };
    }, [folders, funnels]);

    // Filter media
    const filteredMedia = useMemo(() => {
        let items = [...media];

        if (selectedFolderId) {
            items = items.filter(m => m.folder_id === selectedFolderId);
        } else if (selectedFunnelId) {
            const funnelFolderIds = folders.filter(f => f.funnel_id === selectedFunnelId).map(f => f.id);
            items = items.filter(m => funnelFolderIds.includes(m.folder_id));
        }

        if (typeFilter !== 'all') {
            items = items.filter(m => getMediaType(m.mime_type) === typeFilter);
        }

        if (searchTerm.trim()) {
            const s = searchTerm.toLowerCase();
            items = items.filter(m => m.filename?.toLowerCase().includes(s));
        }

        return items;
    }, [media, selectedFolderId, selectedFunnelId, typeFilter, searchTerm, folders]);

    async function handleUpload(e) {
        const files = e.target.files;
        if (!files?.length) return;
        setUploading(true);
        let uploaded = 0;
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                if (selectedFolderId) formData.append('folder_id', selectedFolderId);
                const d = await mediaApi.upload(formData);
                setMedia(prev => [d.media, ...prev]);
                uploaded++;
            } catch (err) { toast.error(`Failed: ${file.name}`); }
        }
        if (uploaded > 0) toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`);
        setUploading(false);
        e.target.value = '';
    }

    async function handleCreateFolder() {
        if (!newFolderName.trim()) return;
        try {
            const d = await mediaApi.createFolder(newFolderName, newFolderFunnelId || null);
            setFolders(prev => [d.folder, ...prev]);
            setNewFolderName('');
            setNewFolderFunnelId('');
            setShowNewFolder(false);
            toast.success('Folder created');
        } catch (err) { toast.error(err.message); }
    }

    async function handleUpdateFolder() {
        if (!editingFolder) return;
        try {
            const d = await mediaApi.updateFolder(editingFolder.id, {
                name: editingFolder.name,
                funnel_id: editingFolder.funnel_id || null,
            });
            setFolders(prev => prev.map(f => f.id === d.folder.id ? { ...d.folder, file_count: f.file_count } : f));
            setEditingFolder(null);
            toast.success('Folder updated');
        } catch (err) { toast.error(err.message); }
    }

    async function handleDeleteFolder(id) {
        if (!confirm('Delete this folder? Files will be unlinked, not deleted.')) return;
        try {
            await mediaApi.deleteFolder(id);
            setFolders(prev => prev.filter(f => f.id !== id));
            if (selectedFolderId === id) setSelectedFolderId(null);
            toast.success('Folder deleted');
        } catch (err) { toast.error(err.message); }
    }

    async function handleDeleteMedia(id) {
        if (!confirm('Delete this file?')) return;
        try {
            await mediaApi.delete(id);
            setMedia(prev => prev.filter(m => m.id !== id));
            toast.success('Deleted');
        } catch (err) { toast.error(err.message); }
    }

    function toggleFunnel(fid) {
        setCollapsedFunnels(prev => ({ ...prev, [fid]: !prev[fid] }));
    }

    function selectSidebarItem(funnelId, folderId) {
        setSelectedFunnelId(funnelId);
        setSelectedFolderId(folderId);
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-surface-800 animate-pulse rounded-lg" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="card animate-pulse h-48" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-6 h-[calc(100vh-130px)]">
            {/* ── Sidebar ── */}
            <div className="w-64 shrink-0 bg-surface-800 border border-white/5 rounded-2xl p-4 overflow-y-auto">
                {/* Sidebar header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white text-sm">Media</h2>
                    <button
                        onClick={() => setShowNewFolder(true)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* All Files */}
                <button
                    onClick={() => selectSidebarItem(null, null)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${!selectedFunnelId && !selectedFolderId
                        ? 'bg-brand-600/15 text-brand-400 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>All Files</span>
                    <span className="ml-auto text-xs text-gray-600">{media.length}</span>
                </button>

                <div className="h-px bg-white/5 my-3" />

                {/* Funnel groups */}
                {Object.entries(groupedFolders.groups).map(([funnelId, group]) => {
                    const isCollapsed = collapsedFunnels[funnelId];
                    const isActiveFunnel = selectedFunnelId === funnelId && !selectedFolderId;
                    return (
                        <div key={funnelId} className="mb-2">
                            <button
                                onClick={() => {
                                    toggleFunnel(funnelId);
                                    selectSidebarItem(funnelId, null);
                                }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${isActiveFunnel ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                <span className="truncate">{group.funnel?.name || 'Unknown Funnel'}</span>
                            </button>
                            {!isCollapsed && (
                                <div className="ml-3 mt-0.5 space-y-0.5">
                                    {group.folders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => selectSidebarItem(funnelId, folder.id)}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors group ${selectedFolderId === folder.id
                                                ? 'bg-brand-600/15 text-white font-medium'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{folder.name}</span>
                                            <span className="ml-auto text-xs text-gray-600">{folder.file_count || 0}</span>
                                            <Pencil
                                                className="w-3 h-3 text-gray-600 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                onClick={(e) => { e.stopPropagation(); setEditingFolder({ ...folder }); }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* General (unassigned) folders */}
                {groupedFolders.general.length > 0 && (
                    <div className="mb-2">
                        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                            General
                        </div>
                        <div className="ml-3 space-y-0.5">
                            {groupedFolders.general.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => selectSidebarItem(null, folder.id)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors group ${selectedFolderId === folder.id
                                        ? 'bg-brand-600/15 text-white font-medium'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                    <span className="ml-auto text-xs text-gray-600">{folder.file_count || 0}</span>
                                    <Pencil
                                        className="w-3 h-3 text-gray-600 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        onClick={(e) => { e.stopPropagation(); setEditingFolder({ ...folder }); }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {folders.length === 0 && (
                    <div className="text-center py-4 px-2">
                        <p className="text-xs text-gray-600 mb-3">
                            No folders yet. Create a funnel to auto-generate folders, or add one manually.
                        </p>
                        <button
                            onClick={() => setShowNewFolder(true)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-600/15 text-brand-400 rounded-lg text-xs font-medium hover:bg-brand-600/25 transition-colors"
                        >
                            <FolderPlus className="w-4 h-4" /> Create Folder
                        </button>
                    </div>
                )}
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search files..."
                            className="input-field pl-9 py-2 text-sm"
                        />
                    </div>

                    {/* Type filter pills */}
                    <div className="flex gap-1 bg-surface-800 rounded-lg p-0.5">
                        {TYPE_FILTERS.map(tf => (
                            <button
                                key={tf.key}
                                onClick={() => setTypeFilter(tf.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === tf.key
                                    ? 'bg-brand-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tf.icon className="w-3 h-3" /> {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Upload */}
                    <label className="btn-primary text-sm flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {/* Context breadcrumb */}
                {(selectedFunnelId || selectedFolderId) && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                        <button onClick={() => selectSidebarItem(null, null)} className="text-gray-500 hover:text-white transition-colors">
                            All Files
                        </button>
                        {selectedFunnelId && (
                            <>
                                <span className="text-gray-700">/</span>
                                <button
                                    onClick={() => selectSidebarItem(selectedFunnelId, null)}
                                    className={`${selectedFolderId ? 'text-gray-500 hover:text-white' : 'text-brand-400'} transition-colors`}
                                >
                                    {funnels.find(f => f.id === selectedFunnelId)?.name || 'Funnel'}
                                </button>
                            </>
                        )}
                        {selectedFolderId && (
                            <>
                                <span className="text-gray-700">/</span>
                                <span className="text-brand-400">
                                    {folders.find(f => f.id === selectedFolderId)?.name || 'Folder'}
                                </span>
                            </>
                        )}
                        <button onClick={() => selectSidebarItem(null, null)} className="ml-2 p-1 hover:bg-white/5 rounded">
                            <X className="w-3 h-3 text-gray-500" />
                        </button>
                    </div>
                )}

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto">
                    {filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <HardDrive className="w-12 h-12 text-gray-700 mb-3" />
                            <p className="text-gray-400 font-medium">
                                {searchTerm ? 'No files match your search' : 'No files here yet'}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">Upload files or import from Google Drive</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredMedia.map(m => {
                                const isImage = m.mime_type?.startsWith('image/');
                                const isVideo = m.mime_type?.startsWith('video/');
                                return (
                                    <div key={m.id} className="group relative bg-surface-800 border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all">
                                        {/* Preview */}
                                        <div className="aspect-square bg-surface-900 flex items-center justify-center">
                                            {isImage ? (
                                                <img src={m.file_url} alt={m.filename} className="w-full h-full object-cover" loading="lazy" />
                                            ) : isVideo ? (
                                                <video src={m.file_url} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <FileText className="w-10 h-10 text-gray-600" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-2.5">
                                            <p className="text-xs text-white truncate font-medium">{m.filename}</p>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                                {m.file_size ? `${(m.file_size / 1024).toFixed(0)} KB` : ''}
                                            </p>
                                        </div>

                                        {/* Hover actions */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={m.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition-colors"
                                                title="Open"
                                            >
                                                <Download className="w-3.5 h-3.5 text-white" />
                                            </a>
                                            <button
                                                onClick={() => handleDeleteMedia(m.id)}
                                                className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-red-600/80 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── New Folder Modal ── */}
            {showNewFolder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewFolder(false)}>
                    <div className="card w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">New Folder</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Folder Name</label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g. Product Shots"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Assign to Funnel (optional)</label>
                                <select
                                    value={newFolderFunnelId}
                                    onChange={e => setNewFolderFunnelId(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">General (no funnel)</option>
                                    {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowNewFolder(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleCreateFolder} className="btn-primary flex-1">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Folder Modal ── */}
            {editingFolder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingFolder(null)}>
                    <div className="card w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">Edit Folder</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingFolder.name}
                                    onChange={e => setEditingFolder(prev => ({ ...prev, name: e.target.value }))}
                                    className="input-field"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Assign to Funnel</label>
                                <select
                                    value={editingFolder.funnel_id || ''}
                                    onChange={e => setEditingFolder(prev => ({ ...prev, funnel_id: e.target.value || null }))}
                                    className="input-field"
                                >
                                    <option value="">General (no funnel)</option>
                                    {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => handleDeleteFolder(editingFolder.id)} className="btn-danger flex-1 text-sm">Delete</button>
                                <button onClick={() => setEditingFolder(null)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleUpdateFolder} className="btn-primary flex-1">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
