import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { 
    TrendingUp, Coins, Sparkles, RefreshCw, FileText, Upload, Database, 
    Wand2, Plus, Play, ArrowLeft, Check, AlertCircle, Trash2, Download, Printer,
    ArrowUpDown, ChevronDown, ChevronUp, Undo2, X, AlertTriangle
} from 'lucide-react';

export default function PriceMonitor() {
    const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' or 'optimizer'
    const [stores, setStores] = useState([]);
    const [loadingStores, setLoadingStores] = useState(true);
    
    // Module 1 (Pricing Monitor) States
    const [pricingSessions, setPricingSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [sessionDetail, setSessionDetail] = useState(null);
    const [loadingSession, setLoadingSession] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    
    // New Session Form States
    const [newSessionName, setNewSessionName] = useState('');
    const [newSessionSource, setNewSessionSource] = useState('shopify_scan');
    const [selectedStoreId, setSelectedStoreId] = useState('');
    const [collections, setCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvInputText, setCsvInputText] = useState('');
    
    // Module 2 (WooCommerce Optimizer) States
    const [optimizerJobs, setOptimizerJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [jobDetail, setJobDetail] = useState(null);
    const [loadingJob, setLoadingJob] = useState(false);
    const [isStartingJob, setIsStartingJob] = useState(false);
    const [diffModalChange, setDiffModalChange] = useState(null);

    useEffect(() => {
        loadStores();
        loadPricingSessions();
        loadOptimizerJobs();
        
        // Poll for progress updates if there's a running job or scanning session
        const interval = setInterval(() => {
            if (sessionDetail?.session?.status === 'scanning' || sessionDetail?.session?.status === 'pending') {
                loadSessionDetail(sessionDetail.session.id, true);
            }
            if (jobDetail?.job?.status === 'running' || jobDetail?.job?.status === 'pending') {
                loadJobDetail(jobDetail.job.id, true);
            }
            loadOptimizerJobs(true);
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionDetail?.session?.status, jobDetail?.job?.status]);

    const loadStores = async () => {
        try {
            const data = await api('/stores');
            setStores(data.stores || data || []);
        } catch (err) {
            toast.error('Failed to load stores');
        } finally {
            setLoadingStores(false);
        }
    };

    const loadPricingSessions = async () => {
        try {
            const data = await api('/price-comparison/sessions');
            setPricingSessions(data.sessions || []);
            if (data.sessions?.length > 0 && !selectedSessionId) {
                setSelectedSessionId(data.sessions[0].id);
                loadSessionDetail(data.sessions[0].id);
            }
        } catch (err) {
            console.error('Failed to load pricing sessions', err);
        }
    };

    const loadPricingSessionsSilent = async () => {
        try {
            const data = await api('/price-comparison/sessions');
            setPricingSessions(data.sessions || []);
        } catch (err) {}
    };

    const loadSessionDetail = async (id, silent = false) => {
        if (!silent) setLoadingSession(true);
        try {
            const data = await api(`/price-comparison/sessions/${id}`);
            setSessionDetail(data);
        } catch (err) {
            toast.error('Failed to load session details');
        } finally {
            if (!silent) setLoadingSession(false);
        }
    };

    const handleSelectSession = (id) => {
        setSelectedSessionId(id);
        loadSessionDetail(id);
    };

    const handleStoreChangeForNewSession = async (storeId) => {
        setSelectedStoreId(storeId);
        setCollections([]);
        setSelectedCollectionId('');
        
        if (!storeId) return;

        const store = stores.find(s => s.id === storeId);
        if (store && store.platform === 'shopify') {
            setLoadingCollections(true);
            try {
                const data = await api(`/stores/${storeId}/collections`);
                setCollections(data.collections || []);
            } catch (err) {
                toast.error('Failed to fetch Shopify collections');
            } finally {
                setLoadingCollections(false);
            }
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        
        let payload = {
            name: newSessionName,
            source: newSessionSource,
            store_id: selectedStoreId || null,
        };

        if (newSessionSource === 'shopify_scan') {
            if (!selectedStoreId) {
                toast.error('Please select a store');
                return;
            }
            payload.shopify_collection = selectedCollectionId || null;
        } else if (newSessionSource === 'excel_upload') {
            // Simple CSV parser
            if (!csvInputText && !csvFile) {
                toast.error('Please upload a CSV file or paste SKU data');
                return;
            }
            
            let textToParse = csvInputText;
            if (csvFile) {
                textToParse = await csvFile.text();
            }

            const parsed = parseCSVData(textToParse);
            if (parsed.length === 0) {
                toast.error('No valid products found. Ensure columns include SKU, Title, and Price.');
                return;
            }
            payload.products = parsed;
        }

        setIsCreatingSession(true);
        const toastId = toast.loading('Initializing pricing session...');

        try {
            const res = await api('/price-comparison/sessions', {
                method: 'POST',
                body: payload
            });
            toast.success('Pricing session created successfully!', { id: toastId });
            setNewSessionName('');
            setCsvFile(null);
            setCsvInputText('');
            setIsCreatingSession(false);
            
            // Reload and select
            await loadPricingSessionsSilent();
            setSelectedSessionId(res.sessionId);
            loadSessionDetail(res.sessionId);
        } catch (err) {
            toast.error(err.message || 'Failed to create session', { id: toastId });
            setIsCreatingSession(false);
        }
    };

    const parseCSVData = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length <= 1) return [];

        const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
        const skuIdx = headers.findIndex(h => h.includes('sku'));
        const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('name'));
        const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('current_price'));
        const costIdx = headers.findIndex(h => h.includes('cost') || h.includes('supplier_price'));
        const barcodeIdx = headers.findIndex(h => h.includes('barcode') || h.includes('upc') || h.includes('ean'));

        if (skuIdx === -1 || titleIdx === -1) return [];

        const products = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.replace(/["']/g, '').trim());
            if (cols.length <= Math.max(skuIdx, titleIdx)) continue;

            products.push({
                sku: cols[skuIdx],
                title: cols[titleIdx],
                barcode: barcodeIdx !== -1 ? cols[barcodeIdx] : '',
                current_price: priceIdx !== -1 ? parseFloat(cols[priceIdx]) || 0 : 0,
                cost: costIdx !== -1 ? parseFloat(cols[costIdx]) || 0 : 0
            });
        }
        return products;
    };

    const handleStartScouring = async () => {
        if (!selectedSessionId) return;
        
        try {
            await api(`/price-comparison/sessions/${selectedSessionId}/scour`, { method: 'POST' });
            toast.success('Price scouring started in background! This will take a moment.');
            // Toggle local session status to scanning
            setSessionDetail(prev => ({
                ...prev,
                session: { ...prev.session, status: 'scanning' }
            }));
        } catch (err) {
            toast.error('Failed to start scouring');
        }
    };

    const handleGenerateSummary = async () => {
        if (!selectedSessionId) return;
        const toastId = toast.loading('Gemini is analyzing competitor prices...');
        try {
            const data = await api(`/price-comparison/sessions/${selectedSessionId}/summary`, { method: 'POST' });
            setSessionDetail(prev => ({ ...prev, summary: data.report }));
            toast.success('AI Pricing Report generated successfully!', { id: toastId });
        } catch (err) {
            toast.error('Failed to generate summary', { id: toastId });
        }
    };

    const handleProductFieldUpdate = async (productId, field, value) => {
        try {
            // Optimistic update
            setSessionDetail(prev => {
                const updatedProducts = prev.products.map(p => {
                    if (p.id === productId) {
                        const updated = { ...p, [field]: parseFloat(value) || 0 };
                        // Recalculate margins
                        const sellPrice = updated.suggested_price || updated.current_price;
                        updated.margin = sellPrice > 0 ? ((sellPrice - updated.cost) / sellPrice) * 100 : 0;
                        return updated;
                    }
                    return p;
                });
                return { ...prev, products: updatedProducts };
            });

            await api(`/price-comparison/products/${productId}`, {
                method: 'PUT',
                body: { [field]: value }
            });
        } catch (err) {
            toast.error('Failed to save pricing edits');
            loadSessionDetail(selectedSessionId, true); // Revert
        }
    };

    const handlePushPriceToStore = async (productId) => {
        const toastId = toast.loading('Syncing updated price to store...');
        
        // Mark product status as syncing locally
        setSessionDetail(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === productId ? { ...p, sync_status: 'syncing' } : p)
        }));

        try {
            await api(`/price-comparison/products/${productId}/push`, { method: 'POST' });
            toast.success('Price synced successfully!', { id: toastId });
            setSessionDetail(prev => ({
                ...prev,
                products: prev.products.map(p => p.id === productId ? { ...p, sync_status: 'synced', sync_error: null } : p)
            }));
        } catch (err) {
            toast.error(err.message || 'Sync failed', { id: toastId });
            setSessionDetail(prev => ({
                ...prev,
                products: prev.products.map(p => p.id === productId ? { ...p, sync_status: 'error', sync_error: err.message } : p)
            }));
        }
    };

    const handleDeleteSession = async (id) => {
        if (!confirm('Are you sure you want to delete this pricing session?')) return;
        try {
            await api(`/price-comparison/sessions/${id}`, { method: 'DELETE' });
            toast.success('Session deleted');
            setSelectedSessionId(null);
            setSessionDetail(null);
            loadPricingSessions();
        } catch (err) {
            toast.error('Failed to delete session');
        }
    };

    // Module 2 (WooCommerce Optimizer) Logic
    const loadOptimizerJobs = async (silent = false) => {
        try {
            const data = await api('/price-comparison/woo/jobs');
            setOptimizerJobs(data.jobs || []);
            if (data.jobs?.length > 0 && !selectedJobId && !silent) {
                setSelectedJobId(data.jobs[0].id);
                loadJobDetail(data.jobs[0].id);
            }
        } catch (err) {
            console.error('Failed to load woo jobs', err);
        }
    };

    const loadJobDetail = async (id, silent = false) => {
        if (!silent) setLoadingJob(true);
        try {
            const data = await api(`/price-comparison/woo/jobs/${id}`);
            setJobDetail(data);
        } catch (err) {
            toast.error('Failed to load job details');
        } finally {
            if (!silent) setLoadingJob(false);
        }
    };

    const handleSelectJob = (id) => {
        setSelectedJobId(id);
        loadJobDetail(id);
    };

    const handleStartOptimizationJob = async () => {
        const activeWooStores = stores.filter(s => s.platform === 'woocommerce' && s.is_active);
        if (activeWooStores.length === 0) {
            toast.error('Please connect and activate a WooCommerce store in the Store Manager first.');
            return;
        }

        const storeId = activeWooStores[0].id; // Choose first active WooCommerce store
        setIsStartingJob(true);
        const toastId = toast.loading('Queuing background WooCommerce AI Copy Optimizer job...');

        try {
            const res = await api('/price-comparison/woo/jobs', {
                method: 'POST',
                body: { store_id: storeId }
            });
            toast.success('AI Optimization job successfully queued!', { id: toastId });
            await loadOptimizerJobs();
            setSelectedJobId(res.jobId);
            loadJobDetail(res.jobId);
        } catch (err) {
            toast.error(err.message || 'Failed to start optimization job', { id: toastId });
        } finally {
            setIsStartingJob(false);
        }
    };

    const handleRevertChange = async (changeId) => {
        if (!confirm('Revert product title, description, and categories in WooCommerce back to the original details?')) return;
        const toastId = toast.loading('Reverting WooCommerce product changes...');

        try {
            await api(`/price-comparison/woo/changes/${changeId}/revert`, { method: 'POST' });
            toast.success('Changes reverted in WooCommerce successfully!', { id: toastId });
            loadJobDetail(selectedJobId);
        } catch (err) {
            toast.error(err.message || 'Failed to revert changes', { id: toastId });
        }
    };

    const handleExportCSV = () => {
        if (!sessionDetail || sessionDetail.products.length === 0) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "SKU,Product Name,Cost,Current Price,Suggested Price,Margin %,Competitor Prices\n";
        
        sessionDetail.products.forEach(p => {
            const compPrices = p.competitors.map(c => `${c.competitor_name}: $${c.competitor_price}`).join(' | ');
            const margin = p.margin ? p.margin.toFixed(1) : 0;
            const line = `"${p.sku}","${p.title.replace(/"/g, '""')}",$${p.cost},$${p.current_price},$${p.suggested_price || p.current_price},${margin}%,"${compPrices}"\n`;
            csvContent += line;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `pricing_report_${sessionDetail.session.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div className="space-y-6 print:space-y-4 print:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-brand-500" />
                        Commerce Control Room
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Monitor competitor prices, optimize product catalog copywriting, and auto-classify store categories.
                    </p>
                </div>
                
                {/* Tabs Selector */}
                <div className="flex bg-surface-850 p-1 border border-white/10 rounded-xl max-w-sm self-start">
                    <button
                        onClick={() => setActiveTab('pricing')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'pricing' 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        Price Monitor
                    </button>
                    <button
                        onClick={() => setActiveTab('optimizer')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === 'optimizer' 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10' 
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Wand2 className="w-4 h-4" />
                        WooCopy Optimizer
                    </button>
                </div>
            </div>

            {/* TAB 1: PRICE MONITOR */}
            {activeTab === 'pricing' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Sidebar Sessions List */}
                    <div className="lg:col-span-1 space-y-4 print:hidden">
                        <div className="bg-surface-850 border border-white/10 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reports</h3>
                                <button 
                                    onClick={() => setNewSessionSource('shopify_scan')} 
                                    className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-brand-400 hover:text-white transition-colors"
                                    title="New Scanning Session"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {/* New Session Fields Form */}
                            {(newSessionName === '' && pricingSessions.length === 0) || isCreatingSession ? (
                                <form onSubmit={handleCreateSession} className="space-y-3 p-3 bg-surface-900/50 border border-white/5 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-400">Initialize Scanner</div>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Session Name (e.g. Fragrance Scan)"
                                        value={newSessionName}
                                        onChange={e => setNewSessionName(e.target.value)}
                                        className="w-full text-xs bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                                    />
                                    <select
                                        value={newSessionSource}
                                        onChange={e => setNewSessionSource(e.target.value)}
                                        className="w-full text-xs bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                                    >
                                        <option value="shopify_scan">Shopify Scan</option>
                                        <option value="excel_upload">CSV / Excel Upload</option>
                                    </select>

                                    {newSessionSource === 'shopify_scan' && (
                                        <>
                                            <select
                                                required
                                                value={selectedStoreId}
                                                onChange={e => handleStoreChangeForNewSession(e.target.value)}
                                                className="w-full text-xs bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                                            >
                                                <option value="">Select Connected Store</option>
                                                {stores.filter(s => s.platform === 'shopify' && s.is_active).map(s => (
                                                    <option key={s.id} value={s.id}>{s.store_name}</option>
                                                ))}
                                            </select>
                                            {loadingCollections ? (
                                                <div className="text-xs text-gray-400 flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Loading collections...</div>
                                            ) : collections.length > 0 ? (
                                                <select
                                                    value={selectedCollectionId}
                                                    onChange={e => setSelectedCollectionId(e.target.value)}
                                                    className="w-full text-xs bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                                                >
                                                    <option value="">All Shopify Collections</option>
                                                    {collections.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            ) : selectedStoreId && (
                                                <div className="text-xs text-gray-500">No collections found. Will sync all products.</div>
                                            )}
                                        </>
                                    )}

                                    {newSessionSource === 'excel_upload' && (
                                        <div className="space-y-2">
                                            <textarea
                                                rows="3"
                                                placeholder="Paste comma separated values:&#10;SKU,Title,Price,Cost,Barcode"
                                                value={csvInputText}
                                                onChange={e => setCsvInputText(e.target.value)}
                                                className="w-full text-[10px] font-mono bg-surface-800 border border-white/10 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                                            />
                                            <div className="text-[10px] text-gray-500 text-center">or upload .csv file</div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={e => setCsvFile(e.target.files[0])}
                                                className="w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-500/10 file:text-brand-400 hover:file:bg-brand-500/20"
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isCreatingSession}
                                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        {isCreatingSession ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Start Session
                                    </button>
                                    {pricingSessions.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setNewSessionName('')}
                                            className="w-full text-center text-[10px] text-gray-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </form>
                            ) : null}

                            {/* Reports Navigation List */}
                            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                                {pricingSessions.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-xs">No scan reports found. Create one above!</div>
                                ) : (
                                    pricingSessions.map(sess => (
                                        <div 
                                            key={sess.id}
                                            className={`group w-full flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                                                selectedSessionId === sess.id 
                                                    ? 'bg-brand-500/10 border-brand-500/30 text-white' 
                                                    : 'bg-surface-900 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <button 
                                                onClick={() => handleSelectSession(sess.id)}
                                                className="flex-1 text-left min-w-0"
                                            >
                                                <div className="text-xs font-semibold truncate">{sess.name}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                    <span>{sess.source === 'shopify_scan' ? 'Shopify' : 'CSV'}</span>
                                                    <span>•</span>
                                                    <span>{sess.product_count} SKUs</span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSession(sess.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity"
                                                title="Delete report"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {loadingSession && !sessionDetail ? (
                            <div className="bg-surface-850 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                                <div className="text-gray-400 text-sm">Loading session reports...</div>
                            </div>
                        ) : !sessionDetail ? (
                            <div className="bg-surface-850 border border-white/10 rounded-2xl p-12 text-center text-gray-500 text-sm">
                                <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                Select or create a pricing session report on the left panel to begin.
                            </div>
                        ) : (
                            <>
                                {/* Report Header Panel */}
                                <div className="bg-surface-850 border border-white/10 rounded-2xl p-5 space-y-4 print:border-0 print:p-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-bold text-white">{sessionDetail.session.name}</h2>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    sessionDetail.session.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                    sessionDetail.session.status === 'scanning' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                                                    'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                    {sessionDetail.session.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Source: {sessionDetail.session.source === 'shopify_scan' ? `Shopify Store (${sessionDetail.session.store_name})` : 'Excel CSV Upload'}
                                                {sessionDetail.session.shopify_collection && ` • Collection: ${sessionDetail.session.shopify_collection}`}
                                            </p>
                                        </div>

                                        {/* Actions Panel */}
                                        <div className="flex flex-wrap items-center gap-2 print:hidden">
                                            {sessionDetail.session.status === 'pending' && (
                                                <button
                                                    onClick={handleStartScouring}
                                                    className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                                                >
                                                    <Play className="w-3.5 h-3.5" />
                                                    Scour Competitor Prices
                                                </button>
                                            )}
                                            {sessionDetail.session.status === 'completed' && (
                                                <>
                                                    <button
                                                        onClick={handleGenerateSummary}
                                                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                                                        AI Pricing Report
                                                    </button>
                                                    <button
                                                        onClick={handleExportCSV}
                                                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Download className="w-3.5 h-3.5 text-gray-400" />
                                                        Export CSV
                                                    </button>
                                                    <button
                                                        onClick={handlePrintPDF}
                                                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Printer className="w-3.5 h-3.5 text-gray-400" />
                                                        Print PDF
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    {sessionDetail.session.status === 'completed' && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                            <div className="bg-surface-900 border border-white/5 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Total SKUs</div>
                                                <div className="text-xl font-bold text-white mt-1">{sessionDetail.products.length}</div>
                                            </div>
                                            <div className="bg-surface-900 border border-white/5 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Avg Profit Margin</div>
                                                <div className="text-xl font-bold text-brand-400 mt-1">
                                                    {(sessionDetail.products.reduce((acc, p) => acc + (p.margin || 0), 0) / sessionDetail.products.length).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div className="bg-surface-900 border border-white/5 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Below Competitors</div>
                                                <div className="text-xl font-bold text-green-400 mt-1">
                                                    {sessionDetail.products.filter(p => {
                                                        const activeComps = p.competitors.filter(c => c.stock_status === 'in_stock');
                                                        if (activeComps.length === 0) return false;
                                                        const minComp = Math.min(...activeComps.map(c => c.competitor_price));
                                                        return p.current_price < minComp;
                                                    }).length}
                                                </div>
                                            </div>
                                            <div className="bg-surface-900 border border-white/5 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Profit Opportunity</div>
                                                <div className="text-xl font-bold text-purple-400 mt-1">
                                                    ${sessionDetail.products.reduce((acc, p) => {
                                                        const gap = (p.suggested_price || p.current_price) - p.current_price;
                                                        return acc + (gap > 0 ? gap : 0);
                                                    }, 0).toFixed(0)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scanning Progress Loader */}
                                    {sessionDetail.session.status === 'scanning' && (
                                        <div className="bg-surface-900/50 border border-white/5 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
                                            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold text-white">Scouring Google Shopping...</div>
                                                <p className="text-[10px] text-gray-500 max-w-sm">
                                                    We are running Google search queries to extract fragrance prices from Sephora, FragranceNet, FragranceX, and Jomashop. Please wait.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI pricing summary */}
                                {sessionDetail.summary && (
                                    <div className="bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent border border-brand-500/20 rounded-2xl p-5 space-y-4 print:border-black/10">
                                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                            <Sparkles className="w-4.5 h-4.5 text-brand-400" />
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI pricing summary & strategy</h3>
                                        </div>
                                        
                                        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                            {sessionDetail.summary.executive_summary}
                                        </div>

                                        {/* Q&A Accordion */}
                                        <div className="space-y-2 pt-2 print:hidden">
                                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Strategic Q&A</div>
                                            {sessionDetail.summary.qa_insights?.map((qa, idx) => (
                                                <details key={idx} className="group bg-surface-900 border border-white/5 rounded-xl p-3 [&_summary::-webkit-details-marker]:hidden">
                                                    <summary className="flex items-center justify-between text-xs font-semibold text-white cursor-pointer select-none">
                                                        <span>{qa.question}</span>
                                                        <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                                                    </summary>
                                                    <p className="text-xs text-gray-400 mt-2 pl-1 border-l-2 border-brand-500/50 leading-relaxed">
                                                        {qa.answer}
                                                    </p>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Interactive pricing grid */}
                                {sessionDetail.products.length > 0 && (
                                    <div className="bg-surface-850 border border-white/10 rounded-2xl overflow-hidden print:border-0 print:rounded-none">
                                        <div className="px-5 py-4 border-b border-white/5 print:hidden">
                                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pricing Analysis Grid</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-[10px] text-gray-500 font-semibold uppercase bg-surface-900/50">
                                                        <th className="py-3 px-4">Title / SKU</th>
                                                        <th className="py-3 px-4 w-28">Cost ($)</th>
                                                        <th className="py-3 px-4 w-28">Your Price ($)</th>
                                                        <th className="py-3 px-4 w-44">Competitor Prices</th>
                                                        <th className="py-3 px-4 w-28">Suggest Price ($)</th>
                                                        <th className="py-3 px-4 w-24">Margin (%)</th>
                                                        <th className="py-3 px-4 w-24 text-right print:hidden">Sync</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                                    {sessionDetail.products.map(prod => {
                                                        const minCompPrice = prod.competitors?.length > 0 
                                                            ? Math.min(...prod.competitors.map(c => c.competitor_price)) 
                                                            : null;
                                                        const isUnderCompetitors = minCompPrice && prod.current_price < minCompPrice;
                                                        const hasProfitOpportunity = prod.suggested_price && prod.suggested_price > prod.current_price;

                                                        return (
                                                            <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                                                                <td className="py-3 px-4 max-w-xs">
                                                                    <div className="font-semibold text-white truncate" title={prod.title}>{prod.title}</div>
                                                                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{prod.sku}</div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 bg-surface-900 border border-white/5 rounded px-2 py-1 max-w-[90px] print:bg-transparent print:border-0 print:p-0">
                                                                        <span className="text-gray-500">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={prod.cost}
                                                                            onChange={e => handleProductFieldUpdate(prod.id, 'cost', e.target.value)}
                                                                            className="w-full bg-transparent focus:outline-none text-xs text-white"
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 bg-surface-900 border border-white/5 rounded px-2 py-1 max-w-[90px] print:bg-transparent print:border-0 print:p-0">
                                                                        <span className="text-gray-500">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={prod.current_price}
                                                                            onChange={e => handleProductFieldUpdate(prod.id, 'current_price', e.target.value)}
                                                                            className="w-full bg-transparent focus:outline-none text-xs text-white"
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    {prod.status === 'scanning' ? (
                                                                        <span className="text-blue-400 flex items-center gap-1 animate-pulse"><RefreshCw className="w-3 h-3 animate-spin" /> Scanning...</span>
                                                                    ) : prod.competitors?.length > 0 ? (
                                                                        <div className="space-y-1 text-[10px]">
                                                                            {prod.competitors.slice(0, 3).map((c, i) => (
                                                                                <div key={i} className="flex justify-between gap-2">
                                                                                    <span className="text-gray-500 truncate max-w-[80px]">{c.competitor_name}:</span>
                                                                                    <span className={c.stock_status === 'out_of_stock' ? 'text-gray-600 line-through' : 'text-gray-300 font-semibold'}>
                                                                                        ${c.competitor_price.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-600 font-mono">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-1 bg-surface-900 border border-white/5 rounded px-2 py-1 max-w-[90px] print:bg-transparent print:border-0 print:p-0">
                                                                        <span className="text-gray-500">$</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={prod.suggested_price || ''}
                                                                            placeholder={prod.current_price}
                                                                            onChange={e => handleProductFieldUpdate(prod.id, 'suggested_price', e.target.value)}
                                                                            className={`w-full bg-transparent focus:outline-none text-xs font-semibold ${
                                                                                hasProfitOpportunity ? 'text-purple-400' : 'text-white'
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className={`font-semibold ${
                                                                        prod.margin < 15 ? 'text-red-400' :
                                                                        prod.margin < 35 ? 'text-yellow-400' :
                                                                        'text-green-400'
                                                                    }`}>
                                                                        {prod.margin ? prod.margin.toFixed(1) : 0}%
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-right print:hidden">
                                                                    {sessionDetail.session.store_id ? (
                                                                        <button
                                                                            onClick={() => handlePushPriceToStore(prod.id)}
                                                                            disabled={prod.sync_status === 'syncing'}
                                                                            className={`p-1.5 border rounded-lg transition-colors ${
                                                                                prod.sync_status === 'synced' 
                                                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                                                    : prod.sync_status === 'error'
                                                                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
                                                                            }`}
                                                                            title={prod.sync_status === 'error' ? `Sync Error: ${prod.sync_error}` : "Sync Price to Store"}
                                                                        >
                                                                            {prod.sync_status === 'syncing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 
                                                                             prod.sync_status === 'synced' ? <Check className="w-3.5 h-3.5" /> : 
                                                                             prod.sync_status === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> :
                                                                             <RefreshCw className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-600 font-mono">No Store</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: WOOCOPY OPTIMIZER */}
            {activeTab === 'optimizer' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Sidebar Job list */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-surface-850 border border-white/10 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Jobs List</h3>
                                <button
                                    onClick={handleStartOptimizationJob}
                                    disabled={isStartingJob}
                                    className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-brand-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                                    title="Start Optimization Job"
                                >
                                    {isStartingJob ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                    Run Optimizer
                                </button>
                            </div>

                            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                                {optimizerJobs.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-xs">No optimization runs found. Hit run above!</div>
                                ) : (
                                    optimizerJobs.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => handleSelectJob(job.id)}
                                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${
                                                selectedJobId === job.id
                                                    ? 'bg-brand-500/10 border-brand-500/30 text-white'
                                                    : 'bg-surface-900 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-semibold truncate">{job.store_name}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{job.processed_products}/{job.total_products} items</span>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                                job.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                job.status === 'running' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {job.status.toUpperCase()}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Job Details / logs area */}
                    <div className="lg:col-span-3 space-y-6">
                        {loadingJob && !jobDetail ? (
                            <div className="bg-surface-850 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
                                <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
                                <div className="text-gray-400 text-sm">Loading job logs...</div>
                            </div>
                        ) : !jobDetail ? (
                            <div className="bg-surface-850 border border-white/10 rounded-2xl p-12 text-center text-gray-500 text-sm">
                                <Wand2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                Select an optimization job on the left panel or click "Run Optimizer" to rewrite WooCommerce copy and auto-classify categories.
                            </div>
                        ) : (
                            <>
                                {/* Job progress overview */}
                                <div className="bg-surface-850 border border-white/10 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-base font-bold text-white">AI Copywriter & Category Classifier</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">Target Store: {jobDetail.job.store_name} ({jobDetail.job.store_url})</p>
                                        </div>
                                        <div className="text-xs font-semibold text-gray-400">
                                            Progress: {jobDetail.job.processed_products} / {jobDetail.job.total_products} Products
                                        </div>
                                    </div>

                                    {jobDetail.job.status === 'running' && (
                                        <div className="space-y-2">
                                            <div className="w-full bg-surface-900 border border-white/5 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="bg-brand-500 h-full transition-all duration-500" 
                                                    style={{ width: `${(jobDetail.job.processed_products / jobDetail.job.total_products) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-brand-400 flex items-center gap-1.5 animate-pulse">
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                Background worker is optimizing titles, copywriting descriptions, and classifying categories...
                                            </div>
                                        </div>
                                    )}

                                    {jobDetail.job.status === 'failed' && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <span>Job Failed: {jobDetail.job.error_message}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Optimization Change History Logs */}
                                <div className="bg-surface-850 border border-white/10 rounded-2xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-white/5">
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Optimization Logs</h3>
                                    </div>

                                    {jobDetail.changes.length === 0 ? (
                                        <div className="py-12 text-center text-gray-500 text-xs">No products processed in this run yet.</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-[10px] text-gray-500 font-semibold uppercase bg-surface-900/50">
                                                        <th className="py-3 px-4">Woo ID</th>
                                                        <th className="py-3 px-4">Title Optimizations</th>
                                                        <th className="py-3 px-4">Category Mapping</th>
                                                        <th className="py-3 px-4">Details</th>
                                                        <th className="py-3 px-4 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                                    {jobDetail.changes.map(change => (
                                                        <tr key={change.id} className="hover:bg-white/5 transition-colors">
                                                            <td className="py-3 px-4 font-mono text-[10px] text-gray-500">#{change.product_id}</td>
                                                            <td className="py-3 px-4 max-w-xs">
                                                                <div className="text-gray-500 line-through text-[11px] truncate">{change.original_title}</div>
                                                                <div className="text-white font-semibold mt-0.5 truncate">{change.optimized_title}</div>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {change.status === 'failed' ? (
                                                                    <span className="text-red-400">Failed</span>
                                                                ) : change.optimized_categories?.length > 0 ? (
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-[10px] text-gray-500 line-through">
                                                                            {change.original_categories?.map(c => c.name).join(' > ') || 'Uncategorized'}
                                                                        </span>
                                                                        <span className="text-green-400 font-semibold">
                                                                            {change.optimized_categories.map(c => c.name).join(' > ')}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-600 font-mono">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() => setDiffModalChange(change)}
                                                                    className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                    View Copy Diff
                                                                </button>
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                {change.status === 'applied' && (
                                                                    <button
                                                                        onClick={() => handleRevertChange(change.id)}
                                                                        className="p-1 px-2 border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] ml-auto"
                                                                    >
                                                                        <Undo2 className="w-3 h-3" />
                                                                        Rollback
                                                                    </button>
                                                                )}
                                                                {change.status === 'reverted' && (
                                                                    <span className="text-[10px] text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Reverted</span>
                                                                )}
                                                                {change.status === 'failed' && (
                                                                    <span className="text-[10px] text-red-500 font-mono truncate max-w-[100px]" title={change.optimized_description}>{change.optimized_description}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Diffs Modal */}
            {diffModalChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
                    <div className="bg-surface-850 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Before & After AI Optimization Diff</h3>
                            <button onClick={() => setDiffModalChange(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Title Diff */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Title</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                                        <div className="text-[10px] text-red-400 font-semibold mb-1">ORIGINAL</div>
                                        <div className="text-xs text-gray-400 font-mono whitespace-pre-wrap">{diffModalChange.original_title}</div>
                                    </div>
                                    <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                                        <div className="text-[10px] text-green-400 font-semibold mb-1">OPTIMIZED</div>
                                        <div className="text-xs text-white font-mono whitespace-pre-wrap">{diffModalChange.optimized_title}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Diff */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Description (HTML View)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                                        <div className="text-[10px] text-red-400 font-semibold mb-1">ORIGINAL COPY</div>
                                        <div className="text-[11px] text-gray-400 font-mono max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                                            {diffModalChange.original_description || 'No description'}
                                        </div>
                                    </div>
                                    <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                                        <div className="text-[10px] text-green-400 font-semibold mb-1">AI WRITTEN COPY</div>
                                        <div className="text-[11px] text-gray-300 font-mono max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                                            {diffModalChange.optimized_description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-white/5 bg-surface-900 text-right">
                            <button
                                onClick={() => setDiffModalChange(null)}
                                className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-1.5 px-4 rounded-lg text-xs transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
