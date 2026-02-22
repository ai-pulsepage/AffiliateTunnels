import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funnelApi, publishApi } from '../lib/api';
import {
    ArrowLeft, Save, Eye, Globe, Undo2, Redo2, Monitor, Tablet, Smartphone,
    Settings2, Code2, History, Layers, X, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PageBuilder() {
    const { funnelId, pageId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const autoSaveTimer = useRef(null);
    const [page, setPage] = useState(null);
    const [funnel, setFunnel] = useState(null);
    const [saving, setSaving] = useState(false);
    const [device, setDevice] = useState('desktop');
    const [showSettings, setShowSettings] = useState(false);
    const [showScripts, setShowScripts] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [versions, setVersions] = useState([]);
    const [customHead, setCustomHead] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDesc, setSeoDesc] = useState('');
    const [lastSaved, setLastSaved] = useState(null);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        loadPageAndInitEditor();
        return () => {
            if (editorRef.current) editorRef.current.destroy();
            if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
        };
    }, [funnelId, pageId]);

    async function loadPageAndInitEditor() {
        try {
            const [pageData, funnelData] = await Promise.all([
                funnelApi.getPage(funnelId, pageId),
                funnelApi.get(funnelId),
            ]);
            setPage(pageData.page);
            setFunnel(funnelData.funnel);
            setCustomHead(pageData.page.custom_head || '');
            setCustomBody(pageData.page.custom_body || '');
            setSeoTitle(pageData.page.seo_title || '');
            setSeoDesc(pageData.page.seo_description || '');
            initEditor(pageData.page);
        } catch (err) {
            toast.error('Failed to load page');
            navigate(`/funnels/${funnelId}`);
        }
    }

    function initEditor(pageData) {
        if (!containerRef.current || typeof window === 'undefined') return;

        Promise.all([
            import('grapesjs'),
            import('grapesjs-preset-webpage'),
            import('../components/builder/grapes-config.js'),
        ]).then(([grapesjs, preset, config]) => {
            const editor = grapesjs.default.init({
                container: containerRef.current,
                height: '100%',
                width: 'auto',
                fromElement: false,
                storageManager: false,
                plugins: [preset.default],
                pluginsOpts: {
                    [preset.default]: {
                        blocks: ['link-block', 'quote', 'text-basic'],
                    },
                },
                canvas: {
                    styles: [
                        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
                    ],
                },
                deviceManager: {
                    devices: [
                        { name: 'Desktop', width: '' },
                        { name: 'Tablet', width: '768px', widthMedia: '992px' },
                        { name: 'Mobile', width: '375px', widthMedia: '480px' },
                    ],
                },
                styleManager: config.styleManagerConfig,
            });

            // Inject canvas baseline styles
            const canvasDoc = editor.Canvas.getDocument();
            if (canvasDoc) {
                const styleEl = canvasDoc.createElement('style');
                styleEl.textContent = config.canvasStyles;
                canvasDoc.head.appendChild(styleEl);
            }

            // Register custom blocks
            config.registerCustomBlocks(editor);

            // Load existing data
            if (pageData.grapes_data && typeof pageData.grapes_data === 'object') {
                if (pageData.grapes_data.components) {
                    editor.setComponents(pageData.grapes_data.components);
                }
                if (pageData.grapes_data.styles) {
                    editor.setStyle(pageData.grapes_data.styles);
                }
            }

            // Auto-save: mark dirty on any change
            editor.on('component:update', () => setDirty(true));
            editor.on('component:add', () => setDirty(true));
            editor.on('component:remove', () => setDirty(true));
            editor.on('style:change', () => setDirty(true));

            editorRef.current = editor;

            // Auto-save every 45 seconds if dirty
            autoSaveTimer.current = setInterval(() => {
                if (editorRef.current && dirty) {
                    performSave(true);
                }
            }, 45000);
        });
    }

    const performSave = useCallback(async (isAutoSave = false) => {
        if (!editorRef.current) return;
        if (!isAutoSave) setSaving(true);
        try {
            const editor = editorRef.current;
            const grapes_data = {
                components: editor.getComponents().toJSON(),
                styles: editor.getStyle().toJSON(),
            };
            const html_output = editor.getHtml();
            const css_output = editor.getCss();

            await funnelApi.updatePage(funnelId, pageId, {
                grapes_data,
                html_output,
                css_output,
                custom_head: customHead,
                custom_body: customBody,
                seo_title: seoTitle,
                seo_description: seoDesc,
            });

            setDirty(false);
            setLastSaved(new Date());
            if (!isAutoSave) toast.success('Saved!');
        } catch (err) {
            if (!isAutoSave) toast.error(err.message);
        } finally {
            if (!isAutoSave) setSaving(false);
        }
    }, [funnelId, pageId, customHead, customBody, seoTitle, seoDesc, dirty]);

    async function handlePublish() {
        await performSave();
        try {
            const data = await publishApi.publishPage(funnelId, pageId);
            toast.success('Published! ' + (data.url || ''));
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handlePreview() {
        await performSave();
        // Open preview in new tab
        const previewUrl = `/p/${funnel?.slug}/${page?.slug}`;
        window.open(previewUrl, '_blank');
    }

    async function loadVersions() {
        try {
            const data = await funnelApi.getVersions(funnelId, pageId);
            setVersions(data.versions || []);
            setShowVersions(true);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async function handleRollback(versionId) {
        if (!confirm('Restore this version? Current changes will be saved as a new version first.')) return;
        try {
            await performSave();
            const data = await funnelApi.rollback(funnelId, pageId, versionId);
            toast.success('Version restored!');
            // Reload editor with restored data
            if (editorRef.current && data.page?.grapes_data) {
                editorRef.current.setComponents(data.page.grapes_data.components || []);
                editorRef.current.setStyle(data.page.grapes_data.styles || []);
            }
            setShowVersions(false);
        } catch (err) {
            toast.error(err.message);
        }
    }

    function handleDeviceChange(d) {
        setDevice(d);
        if (!editorRef.current) return;
        const map = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' };
        editorRef.current.setDevice(map[d]);
    }

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                performSave();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [performSave]);

    return (
        <div className="h-screen flex flex-col bg-surface-900">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-850 border-b border-white/5 shrink-0">
                {/* Left: Back + Page name */}
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/funnels/${funnelId}`)} className="p-2 hover:bg-white/5 rounded-lg" title="Back to funnel">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <span className="text-sm font-medium text-white">{page?.name || 'Loading...'}</span>
                        {page?.page_type && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">{page.page_type}</span>
                        )}
                    </div>
                    {dirty && <span className="text-[10px] text-amber-400">• unsaved</span>}
                    {lastSaved && !dirty && (
                        <span className="text-[10px] text-gray-600">
                            saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>

                {/* Center: Device toggle */}
                <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-0.5">
                    {[
                        { key: 'desktop', icon: Monitor },
                        { key: 'tablet', icon: Tablet },
                        { key: 'mobile', icon: Smartphone },
                    ].map(({ key, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => handleDeviceChange(key)}
                            className={`p-1.5 rounded-md transition-colors ${device === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            title={key}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => editorRef.current?.UndoManager.undo()} className="p-2 hover:bg-white/5 rounded-lg" title="Undo (Ctrl+Z)">
                        <Undo2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => editorRef.current?.UndoManager.redo()} className="p-2 hover:bg-white/5 rounded-lg" title="Redo (Ctrl+Shift+Z)">
                        <Redo2 className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="w-px h-5 bg-white/10 mx-1" />

                    <button onClick={loadVersions} className="p-2 hover:bg-white/5 rounded-lg" title="Version History">
                        <History className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setShowScripts(true)} className="p-2 hover:bg-white/5 rounded-lg" title="Custom Scripts">
                        <Code2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/5 rounded-lg" title="Page Settings">
                        <Settings2 className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="w-px h-5 bg-white/10 mx-1" />

                    <button onClick={handlePreview} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => performSave()} disabled={saving} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handlePublish} className="btn-primary text-sm flex items-center gap-1.5 py-1.5">
                        <Globe className="w-3.5 h-3.5" /> Publish
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div ref={containerRef} className="flex-1 overflow-hidden" />

            {/* Settings Panel */}
            {showSettings && (
                <SlidePanel title="Page Settings" onClose={() => setShowSettings(false)}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Title</label>
                            <input type="text" value={seoTitle} onChange={e => { setSeoTitle(e.target.value); setDirty(true); }} className="input-field" placeholder="Page title for search engines" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">SEO Description</label>
                            <textarea value={seoDesc} onChange={e => { setSeoDesc(e.target.value); setDirty(true); }} className="input-field h-24" placeholder="Meta description for search results" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Page Type</label>
                            <p className="text-sm text-gray-500">{page?.page_type}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
                            <p className="text-sm text-gray-500">/{funnel?.slug}/{page?.slug}</p>
                        </div>
                    </div>
                </SlidePanel>
            )}

            {/* Script Injector */}
            {showScripts && (
                <SlidePanel title="Custom Scripts" onClose={() => setShowScripts(false)}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Custom {'<head>'} Scripts
                            </label>
                            <textarea
                                value={customHead}
                                onChange={e => { setCustomHead(e.target.value); setDirty(true); }}
                                className="input-field h-32 font-mono text-xs"
                                placeholder={'<!-- GA4, FB Pixel, custom CSS, etc. -->\n<script>...</script>'}
                            />
                            <p className="text-xs text-gray-600 mt-1">Injected before {'</head>'}. Use for tracking pixels, custom CSS.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Custom {'<body>'} Scripts
                            </label>
                            <textarea
                                value={customBody}
                                onChange={e => { setCustomBody(e.target.value); setDirty(true); }}
                                className="input-field h-32 font-mono text-xs"
                                placeholder={'<!-- Custom JS, chat widgets, etc. -->\n<script>...</script>'}
                            />
                            <p className="text-xs text-gray-600 mt-1">Injected before {'</body>'}. Use for chat widgets, custom JS.</p>
                        </div>
                    </div>
                </SlidePanel>
            )}

            {/* Version History */}
            {showVersions && (
                <SlidePanel title="Version History" onClose={() => setShowVersions(false)}>
                    {versions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">No saved versions yet. Versions are created each time you save.</p>
                    ) : (
                        <div className="space-y-2">
                            {versions.map(v => (
                                <div key={v.id} className="flex items-center justify-between p-3 bg-surface-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-white">Version #{v.version_number}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(v.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <button onClick={() => handleRollback(v.id)} className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                                        Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </SlidePanel>
            )}
        </div>
    );
}

/**
 * Reusable slide-in panel for settings/scripts/versions
 */
function SlidePanel({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40" />
            <div
                className="relative w-96 h-full bg-surface-850 border-l border-white/5 animate-slide-in-right overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-surface-850 z-10">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
