import { useState, useEffect } from 'react';
import { Store, Plus, ShoppingBag, Trash2, Link as LinkIcon, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function StoreManager() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);
    
    // Form State
    const [platform, setPlatform] = useState('shopify');
    const [storeName, setStoreName] = useState('');
    const [storeUrl, setStoreUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        loadStores();
    }, []);

    async function loadStores() {
        setLoading(true);
        try {
            const data = await api('/stores');
            setStores(data.stores || []);
        } catch (err) {
            toast.error('Failed to load connected stores');
        }
        setLoading(false);
    }

    async function handleConnect(e) {
        e.preventDefault();
        setConnecting(true);

        const payload = {
            store_name: storeName,
            platform,
            store_url: storeUrl,
            api_key: apiKey,
            api_secret: apiSecret,
            access_token: accessToken
        };

        try {
            const data = await api('/stores', {
                method: 'POST',
                body: payload
            });
            
            if (data.oauthUrl) {
                // Redirect to Shopify for OAuth
                window.location.href = data.oauthUrl;
                return;
            }

            toast.success('Store connected successfully!');
            setShowConnectModal(false);
            resetForm();
            loadStores();
        } catch (err) {
            toast.error(err.message || 'Failed to connect store');
        }
        setConnecting(false);
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to disconnect this store? You will no longer be able to push products to it.')) return;
        
        try {
            await api(`/stores/${id}`, { method: 'DELETE' });
            toast.success('Store disconnected');
            loadStores();
        } catch (err) {
            toast.error('Failed to disconnect store');
        }
    }

    function resetForm() {
        setPlatform('shopify');
        setStoreName('');
        setStoreUrl('');
        setApiKey('');
        setApiSecret('');
        setAccessToken('');
    }

    return (
        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Store className="w-8 h-8 text-blue-400" /> Store Command Center
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Manage all your independent e-commerce backends from one place.</p>
                </div>
                <button 
                    onClick={() => setShowConnectModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                >
                    <Plus className="w-5 h-5" /> Connect Store
                </button>
            </header>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-blue-400 animate-spin" /></div>
            ) : stores.length === 0 ? (
                <div className="text-center py-20 bg-surface-700/30 rounded-2xl border border-white/5 border-dashed">
                    <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Stores Connected</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">Connect your Shopify or WooCommerce stores to start pushing products directly from AffiliateTunnels.</p>
                    <button onClick={() => setShowConnectModal(true)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                        Connect Your First Store
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map(store => (
                        <div key={store.id} className="bg-surface-700 rounded-2xl border border-white/10 p-6 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <button onClick={() => handleDelete(store.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${store.platform === 'shopify' ? 'bg-[#95BF47]/20 text-[#95BF47]' : 'bg-[#96588a]/20 text-[#96588a]'}`}>
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-tight">{store.store_name}</h3>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{store.platform}</span>
                                </div>
                            </div>

                            <a href={store.store_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline text-sm mb-6 bg-blue-500/10 px-3 py-2 rounded-lg self-start">
                                <LinkIcon className="w-4 h-4" /> {store.store_url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                            </a>

                            <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Status</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <div className={`w-2 h-2 rounded-full ${store.metrics?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className={store.metrics?.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                                            {store.metrics?.status === 'connected' ? 'Connected' : 'Connection Error'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Orders</p>
                                    <p className="text-xl font-black text-white">{store.metrics?.orders_count || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Connect Store Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface-800 rounded-2xl w-full max-w-xl shadow-2xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-700/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-400" /> Connect New Store
                            </h2>
                            <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleConnect} className="p-6 space-y-6">
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setPlatform('shopify')}
                                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${platform === 'shopify' ? 'border-[#95BF47] bg-[#95BF47]/10 text-[#95BF47]' : 'border-white/10 bg-surface-700 text-gray-400 hover:border-white/30'}`}
                                    >
                                        Shopify
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPlatform('woocommerce')}
                                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${platform === 'woocommerce' ? 'border-[#96588a] bg-[#96588a]/10 text-[#96588a]' : 'border-white/10 bg-surface-700 text-gray-400 hover:border-white/30'}`}
                                    >
                                        WooCommerce
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Store Name</label>
                                    <input 
                                        type="text" required
                                        value={storeName} onChange={e => setStoreName(e.target.value)}
                                        placeholder="e.g. My Sauna Store"
                                        className="w-full bg-[#131320] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Store URL</label>
                                    <input 
                                        type="url" required
                                        value={storeUrl} onChange={e => setStoreUrl(e.target.value)}
                                        placeholder="https://mystore.com"
                                        className="w-full bg-[#131320] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            {platform === 'shopify' ? (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-4">
                                    <h4 className="text-blue-300 font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> OAuth Setup</h4>
                                    <ol className="text-xs text-blue-200/70 list-decimal list-inside space-y-1 mb-2">
                                        <li>Go to Shopify Partner Dashboard -> Apps -> Create App.</li>
                                        <li>Under App Setup, set App URL to your domain.</li>
                                        <li>Set Allowed redirection URI to: <code className="bg-black/50 px-1 py-0.5 rounded text-blue-300">{window.location.origin}/api/stores/shopify/callback</code></li>
                                        <li>Copy Client ID and Client Secret below.</li>
                                    </ol>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Client ID</label>
                                        <input 
                                            type="text" required
                                            value={apiKey} onChange={e => setApiKey(e.target.value)}
                                            placeholder="c043b6b..."
                                            className="w-full bg-[#131320] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Client Secret</label>
                                        <input 
                                            type="password" required
                                            value={apiSecret} onChange={e => setApiSecret(e.target.value)}
                                            placeholder="shpss_..."
                                            className="w-full bg-[#131320] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-[#96588a]/10 border border-[#96588a]/30 rounded-xl space-y-4">
                                    <h4 className="text-[#96588a] font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Setup Instructions</h4>
                                    <ol className="text-xs text-[#96588a]/70 list-decimal list-inside space-y-1 mb-2">
                                        <li>Go to WooCommerce -> Settings -> Advanced -> REST API</li>
                                        <li>Add Key (Permissions: Read/Write)</li>
                                        <li>Copy Consumer Key and Secret below</li>
                                    </ol>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Consumer Key</label>
                                        <input 
                                            type="text" required
                                            value={apiKey} onChange={e => setApiKey(e.target.value)}
                                            placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                                            className="w-full bg-[#131320] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-[#96588a]/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Consumer Secret</label>
                                        <input 
                                            type="password" required
                                            value={apiSecret} onChange={e => setApiSecret(e.target.value)}
                                            placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                                            className="w-full bg-[#131320] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-[#96588a]/50"
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={connecting}
                                className="w-full py-3.5 bg-white text-black hover:bg-gray-200 font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Connect Store'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
