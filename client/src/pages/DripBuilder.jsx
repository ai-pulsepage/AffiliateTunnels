import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emailApi, funnelApi } from '../lib/api';
import { ArrowLeft, Plus, Trash2, Play, Pause, GripVertical, Mail, Clock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DripBuilder() {
    const { funnelId } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [drip, setDrip] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddStep, setShowAddStep] = useState(false);
    const [newStep, setNewStep] = useState({ email_template_id: '', delay_days: 1, subject_override: '' });

    useEffect(() => { loadAll(); }, [funnelId]);

    async function loadAll() {
        try {
            const [f, d, t, m] = await Promise.all([
                funnelApi.get(funnelId),
                emailApi.getDrip(funnelId),
                emailApi.listTemplates(),
                emailApi.getMetrics(funnelId).catch(() => ({ metrics: null })),
            ]);
            setFunnel(f.funnel);
            setDrip(d.drip);
            setTemplates(t.templates || []);
            setMetrics(m.metrics);
        } catch (err) {
            toast.error(err.message);
        } finally { setLoading(false); }
    }

    async function handleCreateDrip() {
        try {
            const d = await emailApi.createDrip(funnelId, {
                name: `${funnel?.name || 'Funnel'} Drip`,
                from_name: '',
                from_email: '',
            });
            setDrip(d.drip);
            toast.success('Drip campaign created');
        } catch (err) { toast.error(err.message); }
    }

    async function handleToggleActive() {
        if (!drip) return;
        try {
            await emailApi.activateDrip(drip.id, !drip.is_active);
            setDrip(prev => ({ ...prev, is_active: !prev.is_active }));
            toast.success(drip.is_active ? 'Campaign paused' : 'Campaign activated');
        } catch (err) { toast.error(err.message); }
    }

    async function handleAddStep() {
        if (!newStep.email_template_id) {
            toast.error('Select an email template');
            return;
        }
        try {
            const d = await emailApi.addDripEmail(drip.id, newStep);
            // Reload to get updated emails list
            const updated = await emailApi.getDrip(funnelId);
            setDrip(updated.drip);
            setShowAddStep(false);
            setNewStep({ email_template_id: '', delay_days: 1, subject_override: '' });
            toast.success('Step added');
        } catch (err) { toast.error(err.message); }
    }

    if (loading) return <div className="card animate-pulse h-64" />;

    const emails = drip?.emails || [];

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/funnels/${funnelId}`)} className="p-2 hover:bg-white/5 rounded-lg">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Drip Campaign</h1>
                        <p className="text-sm text-gray-500">{funnel?.name}</p>
                    </div>
                </div>
                {drip && (
                    <button onClick={handleToggleActive} className={`flex items-center gap-2 ${drip.is_active ? 'btn-danger' : 'btn-primary'} text-sm`}>
                        {drip.is_active ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Activate</>}
                    </button>
                )}
            </div>

            {/* Metrics */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="stat-card"><p className="stat-value text-lg">{metrics.sent || 0}</p><p className="stat-label text-xs">Sent</p></div>
                    <div className="stat-card"><p className="stat-value text-lg text-emerald-400">{metrics.delivered || 0}</p><p className="stat-label text-xs">Delivered</p></div>
                    <div className="stat-card"><p className="stat-value text-lg text-blue-400">{metrics.opened || 0}</p><p className="stat-label text-xs">Opened</p></div>
                    <div className="stat-card"><p className="stat-value text-lg text-purple-400">{metrics.clicked || 0}</p><p className="stat-label text-xs">Clicked</p></div>
                    <div className="stat-card"><p className="stat-value text-lg text-red-400">{metrics.bounced || 0}</p><p className="stat-label text-xs">Bounced</p></div>
                </div>
            )}

            {/* No drip yet */}
            {!drip && (
                <div className="card text-center py-16">
                    <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-white mb-2">No Drip Campaign Yet</h2>
                    <p className="text-sm text-gray-400 mb-6">Automatically send a sequence of emails to new leads captured from this funnel.</p>
                    <button onClick={handleCreateDrip} className="btn-primary">Create Drip Campaign</button>
                </div>
            )}

            {/* Drip sequence */}
            {drip && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-white">Email Sequence</h2>
                            {drip.is_active ? (
                                <span className="badge badge-success text-[10px]">Active</span>
                            ) : (
                                <span className="badge text-[10px]">Paused</span>
                            )}
                        </div>
                        <button onClick={() => setShowAddStep(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Add Step
                        </button>
                    </div>

                    {emails.length === 0 ? (
                        <div className="card text-center py-10">
                            <p className="text-gray-500">No emails in this sequence. Add your first step.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {emails.sort((a, b) => a.step_order - b.step_order).map((email, i) => {
                                const template = templates.find(t => t.id === email.email_template_id);
                                return (
                                    <div key={email.id} className="relative">
                                        {/* Connector line */}
                                        {i > 0 && (
                                            <div className="absolute -top-3 left-6 w-px h-3 bg-brand-500/30" />
                                        )}
                                        <div className="card flex items-center gap-4 py-4">
                                            {/* Step number */}
                                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
                                                {i + 1}
                                            </div>

                                            {/* Delay info */}
                                            <div className="flex items-center gap-2 shrink-0 w-24">
                                                <Clock className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-sm text-gray-300">
                                                    {email.delay_days === 0 ? 'Immediately' : `Day ${email.delay_days}`}
                                                </span>
                                            </div>

                                            {/* Email info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {email.subject_override || template?.subject || 'No subject'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    Template: {template?.name || 'Unknown'}
                                                </p>
                                            </div>

                                            {/* Status indicator */}
                                            <div className="shrink-0">
                                                <Mail className="w-4 h-4 text-gray-600" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add Step Modal */}
            {showAddStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddStep(false)}>
                    <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">Add Email Step</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Email Template</label>
                                <select
                                    value={newStep.email_template_id}
                                    onChange={e => setNewStep(p => ({ ...p, email_template_id: e.target.value }))}
                                    className="input-field"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Send After (days)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newStep.delay_days}
                                    onChange={e => setNewStep(p => ({ ...p, delay_days: parseInt(e.target.value) || 0 }))}
                                    className="input-field"
                                    placeholder="0 = immediately, 1 = after 1 day"
                                />
                                <p className="text-xs text-gray-600 mt-1">Days after lead opts in (or after previous email)</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Subject Override (optional)</label>
                                <input
                                    type="text"
                                    value={newStep.subject_override}
                                    onChange={e => setNewStep(p => ({ ...p, subject_override: e.target.value }))}
                                    className="input-field"
                                    placeholder="Override the template subject"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAddStep(false)} className="btn-secondary flex-1">Cancel</button>
                                <button onClick={handleAddStep} className="btn-primary flex-1">Add Step</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
