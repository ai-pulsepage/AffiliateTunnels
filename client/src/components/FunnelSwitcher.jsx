import { useFunnel } from './FunnelContext';
import { ChevronDown } from 'lucide-react';

export default function FunnelSwitcher({ className = '' }) {
    const { funnels, selectedFunnelId, selectFunnel, loading } = useFunnel();

    if (loading) return null;

    return (
        <div className={`${className}`}>
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 px-1">Active Funnel</label>
            <div className="relative">
                <select
                    value={selectedFunnelId}
                    onChange={e => selectFunnel(e.target.value)}
                    className="w-full appearance-none bg-surface-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 pr-8 cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                    <option value="">All Funnels</option>
                    {funnels.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
}
