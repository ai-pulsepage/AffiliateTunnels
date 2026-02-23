import { createContext, useContext, useState, useEffect } from 'react';
import { funnelApi } from '../lib/api';

const FunnelContext = createContext(null);

export function FunnelProvider({ children }) {
    const [funnels, setFunnels] = useState([]);
    const [selectedFunnelId, setSelectedFunnelId] = useState(() => localStorage.getItem('at_selected_funnel') || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadFunnels(); }, []);

    async function loadFunnels() {
        try {
            const data = await funnelApi.list();
            setFunnels(data.funnels || []);
            // Auto-select first if none selected
            if (!selectedFunnelId && data.funnels?.length > 0) {
                setSelectedFunnelId(data.funnels[0].id);
                localStorage.setItem('at_selected_funnel', data.funnels[0].id);
            }
        } catch (err) {
            console.error('Failed to load funnels:', err);
        } finally {
            setLoading(false);
        }
    }

    function selectFunnel(id) {
        setSelectedFunnelId(id);
        localStorage.setItem('at_selected_funnel', id);
    }

    const selectedFunnel = funnels.find(f => f.id === selectedFunnelId) || null;

    return (
        <FunnelContext.Provider value={{
            funnels,
            selectedFunnelId,
            selectedFunnel,
            selectFunnel,
            loading,
            refreshFunnels: loadFunnels
        }}>
            {children}
        </FunnelContext.Provider>
    );
}

export function useFunnel() {
    const ctx = useContext(FunnelContext);
    // Return safe defaults when used outside FunnelProvider (e.g. full-screen editors)
    if (!ctx) return { funnels: [], selectedFunnelId: null, selectedFunnel: null, selectFunnel: () => { }, loading: false, refreshFunnels: () => { } };
    return ctx;
}

export default FunnelContext;
