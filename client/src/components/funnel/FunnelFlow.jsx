import { ChevronRight, GripVertical, Eye, Pencil, Globe, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeColors = {
    landing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    bridge: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    offer: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    optin: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    thankyou: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    bonus: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};

const typeIcons = {
    landing: '🎯', bridge: '🌉', offer: '💰', optin: '📧', thankyou: '🎉', bonus: '🎁',
};

/**
 * Visual funnel step sequencer — shows pages as connected flow nodes.
 */
export default function FunnelFlow({ pages, funnelId, funnelSlug, onPublish, onDelete }) {
    const navigate = useNavigate();

    if (!pages || pages.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-gray-400">No pages yet. Add your first page to start building.</p>
            </div>
        );
    }

    const sorted = [...pages].sort((a, b) => a.step_order - b.step_order);

    return (
        <div className="relative">
            {/* Horizontal flow for desktop */}
            <div className="hidden lg:flex items-start gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {sorted.map((page, i) => {
                    const c = typeColors[page.page_type] || typeColors.landing;
                    return (
                        <div key={page.id} className="flex items-center shrink-0">
                            <FlowNode
                                page={page}
                                colors={c}
                                funnelId={funnelId}
                                funnelSlug={funnelSlug}
                                onEdit={() => navigate(`/builder/${funnelId}/${page.id}`)}
                                onPublish={() => onPublish(page.id)}
                                onDelete={() => onDelete(page.id)}
                            />
                            {i < sorted.length - 1 && (
                                <ChevronRight className="w-5 h-5 text-gray-600 mx-1 shrink-0" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Vertical flow for mobile/tablet */}
            <div className="lg:hidden space-y-3">
                {sorted.map((page, i) => {
                    const c = typeColors[page.page_type] || typeColors.landing;
                    return (
                        <div key={page.id}>
                            <FlowNode
                                page={page}
                                colors={c}
                                funnelId={funnelId}
                                funnelSlug={funnelSlug}
                                onEdit={() => navigate(`/builder/${funnelId}/${page.id}`)}
                                onPublish={() => onPublish(page.id)}
                                onDelete={() => onDelete(page.id)}
                            />
                            {i < sorted.length - 1 && (
                                <div className="flex justify-center py-1">
                                    <div className="w-px h-4 bg-gray-700" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FlowNode({ page, colors, funnelId, funnelSlug, onEdit, onPublish, onDelete }) {
    return (
        <div className={`relative p-4 rounded-xl border ${colors.border} ${colors.bg} min-w-[220px] max-w-[260px] group transition-all hover:scale-[1.02]`}>
            {/* Type badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[page.page_type] || '📄'}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
                        {page.page_type}
                    </span>
                </div>
                <span className="text-[10px] text-gray-600">Step {page.step_order + 1}</span>
            </div>

            {/* Page name */}
            <h4 className="text-sm font-semibold text-white mb-2 truncate">{page.name}</h4>

            {/* Status */}
            <div className="flex items-center gap-2 mb-3">
                {page.is_published ? (
                    <span className="badge badge-success text-[10px]">Published</span>
                ) : (
                    <span className="badge text-[10px]">Draft</span>
                )}
                {page.slug && (
                    <span className="text-[10px] text-gray-600 truncate">/{page.slug}</span>
                )}
            </div>

            {/* Actions — always visible */}
            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-1.5 hover:bg-white/10 rounded-lg" title="Edit in builder">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button onClick={onPublish} className="p-1.5 hover:bg-white/10 rounded-lg" title="Publish / Unpublish">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {page.is_published && funnelSlug && page.slug && (
                    <a href={`/p/${funnelSlug}/${page.slug}`} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/10 rounded-lg" title="View live">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </a>
                )}
                <button onClick={onDelete} className="p-1.5 hover:bg-red-500/10 rounded-lg ml-auto" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
            </div>
        </div>
    );
}
