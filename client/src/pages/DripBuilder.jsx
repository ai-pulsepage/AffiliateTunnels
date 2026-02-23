import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emailApi, funnelApi } from '../lib/api';
import { ArrowLeft, Plus, Trash2, Play, Pause, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DripBuilder() {
    const { funnelId } = useParams();
    const navigate = useNavigate();
    const [funnel, setFunnel] = useState(null);
    const [drip, setDrip] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, [funnelId]);

    async function loadAll() {
        try {
            const [fData, dData, tData] = await Promise.all([
                funnelApi.get(funnelId),
                emailApi.getDrip(funnelId),
                emailApi.listTemplates()  // Load ALL templates — they may not have funnel_id set
            ]);
            setFunnel(fData.funnel);
            setDrip(dData.drip);
            setTemplates(tData.templates || []);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleCreateDrip() {
        try {
            const d = await emailApi.createDrip(funnelId, {
                name: `${funnel?.name || 'Funnel'} Drip Campaign`
            });
            setDrip(d.drip);
            toast.success('Drip campaign created!');
        } catch (err) { toast.error(err.message); }
    }

    async function handleToggleActive() {
        try {
            const d = await emailApi.activateDrip(drip.id, !drip.is_active);
            setDrip(d.drip);
            toast.success(d.drip.is_active ? 'Campaign activated!' : 'Campaign paused');
        } catch (err) { toast.error(err.message); }
    }

    async function handleAddStep() {
        if (templates.length === 0) {
            toast.error('Create email templates first before adding drip steps.');
            return;
        }
        try {
            const nextDay = drip.emails?.length > 0
                ? Math.max(...drip.emails.map(e => e.delay_days)) + 1
                : 0;
            await emailApi.addDripEmail(drip.id, {
                email_template_id: templates[0].id,
                delay_days: nextDay
            });
            loadAll();
            toast.success('Step added!');
        } catch (err) { toast.error(err.message); }
    }

    async function handleUpdateStep(emailId, field, value) {
        try {
            await emailApi.updateDripEmail(drip.id, emailId, { [field]: value });
            loadAll();
        } catch (err) { toast.error(err.message); }
    }

    async function handleDeleteStep(emailId) {
        if (!confirm('Remove this step?')) return;
        try {
            await emailApi.deleteDripEmail(drip.id, emailId);
            loadAll();
            toast.success('Step removed');
        } catch (err) { toast.error(err.message); }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 bg-surface-800 animate-pulse rounded-lg" />
                <div className="card animate-pulse h-64" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Drip Campaign</h1>
                    <p className="text-sm text-gray-500">{funnel?.name || 'Funnel'}</p>
                </div>
            </div>

            {!drip ? (
                /* No drip yet — create one */
                <div className="bg-surface-800 border border-white/5 rounded-xl text-center py-16">
                    <Mail className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg font-medium mb-2">No drip campaign yet</p>
                    <p className="text-gray-600 text-sm mb-6">Set up automatic emails that send when someone opts in.</p>
                    <button onClick={handleCreateDrip} className="px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-500 transition-colors">
                        Create Drip Campaign
                    </button>
                </div>
            ) : (
                <>
                    {/* Campaign status bar */}
                    <div className="bg-surface-800 border border-white/5 rounded-xl px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${drip.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                            <span className="text-white font-medium">{drip.is_active ? 'Active' : 'Paused'}</span>
                            <span className="text-gray-600 text-sm">— {drip.emails?.length || 0} email{(drip.emails?.length || 0) !== 1 ? 's' : ''} in sequence</span>
                        </div>
                        <button
                            onClick={handleToggleActive}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${drip.is_active
                                ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                                : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                }`}
                        >
                            {drip.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {drip.is_active ? 'Pause' : 'Activate'}
                        </button>
                    </div>

                    {/* Drip steps */}
                    <div className="space-y-3">
                        {(drip.emails || []).map((step, i) => (
                            <div key={step.id} className="bg-surface-800 border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4">
                                {/* Step number */}
                                <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center shrink-0">
                                    <span className="text-brand-400 font-bold text-sm">{i + 1}</span>
                                </div>

                                {/* Template selector */}
                                <div className="flex-1">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Email Template</label>
                                    <select
                                        value={step.email_template_id || ''}
                                        onChange={e => handleUpdateStep(step.id, 'email_template_id', e.target.value)}
                                        className="w-full bg-surface-700 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    >
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Day offset */}
                                <div className="w-28 shrink-0">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                                        <Clock className="w-3 h-3 inline mr-1" />Send on Day
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={step.delay_days}
                                        onChange={e => handleUpdateStep(step.id, 'delay_days', parseInt(e.target.value) || 0)}
                                        className="w-full bg-surface-700 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDeleteStep(step.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Remove step"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add step */}
                    <button
                        onClick={handleAddStep}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-brand-500/30 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Email Step
                    </button>

                    {templates.length === 0 && (
                        <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-xl px-5 py-4">
                            <p className="text-yellow-400 text-sm">
                                <strong>No email templates yet.</strong> Go to Emails → create some templates for this funnel first, then come back to add them as drip steps.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
