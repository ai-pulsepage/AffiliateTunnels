import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, billingApi } from '../lib/api';
import { User, CreditCard, Shield, Check, ArrowRight, Zap, Crown, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
    {
        tier: 'free', name: 'Free', price: '$0', period: '/mo',
        icon: Zap, color: 'gray',
        features: ['3 funnels', '5 pages per funnel', 'Basic analytics', 'Email support'],
    },
    {
        tier: 'pro', name: 'Pro', price: '$29', period: '/mo',
        icon: Crown, color: 'brand', popular: true,
        features: ['Unlimited funnels', '25 pages per funnel', 'Advanced analytics', 'Drip campaigns', 'Custom domains', 'Priority support'],
    },
    {
        tier: 'agency', name: 'Agency', price: '$79', period: '/mo',
        icon: Building2, color: 'purple',
        features: ['Everything in Pro', 'Unlimited pages', 'White-label branding', 'Team members', 'API access', 'Dedicated support'],
    },
];

export default function Settings() {
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState('profile');
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [loadingSub, setLoadingSub] = useState(true);

    useEffect(() => { loadSubscription(); }, []);

    async function loadSubscription() {
        try {
            const d = await billingApi.getSubscription();
            setSubscription(d.subscription);
        } catch (err) { /* no subscription */ }
        finally { setLoadingSub(false); }
    }

    async function handleProfile(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const body = { name };
            if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
            await authApi.updateProfile(body);
            await refreshUser();
            setCurrentPassword(''); setNewPassword('');
            toast.success('Profile updated');
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    async function handleUpgrade(tier) {
        // In production, priceId would come from admin settings
        const priceMap = { pro: 'price_pro_placeholder', agency: 'price_agency_placeholder' };
        try {
            const d = await billingApi.createCheckout(priceMap[tier]);
            window.location.href = d.url;
        } catch (err) { toast.error(err.message); }
    }

    async function handlePortal() {
        try {
            const d = await billingApi.openPortal();
            window.location.href = d.url;
        } catch (err) { toast.error(err.message); }
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-800 rounded-xl p-1 w-fit">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <div className="card">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-400" /> Profile
                    </h2>
                    <form onSubmit={handleProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input type="email" value={user?.email || ''} className="input-field opacity-60" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
                        </div>

                        <hr className="border-white/5" />

                        <h3 className="font-medium text-gray-300 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Change Password
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" />
                        </div>

                        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
                    </form>
                </div>
            )}

            {/* Billing Tab */}
            {tab === 'billing' && (
                <div className="space-y-6">
                    {/* Current plan */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-white">Current Plan</h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    You are on the <span className="font-semibold text-brand-400 uppercase">{user?.tier || 'free'}</span> plan
                                    {subscription?.status === 'active' && <span className="ml-2 badge badge-success text-[10px]">Active</span>}
                                    {subscription?.status === 'past_due' && <span className="ml-2 badge badge-warning text-[10px]">Past Due</span>}
                                </p>
                                {subscription?.current_period_end && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            {subscription && (
                                <button onClick={handlePortal} className="btn-secondary text-sm flex items-center gap-1.5">
                                    Manage Subscription <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Plan cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLANS.map(plan => {
                            const isCurrentPlan = (user?.tier || 'free') === plan.tier;
                            return (
                                <div key={plan.tier} className={`card relative ${plan.popular ? 'ring-2 ring-brand-500/50' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                                            Popular
                                        </div>
                                    )}
                                    <plan.icon className={`w-8 h-8 mb-3 text-${plan.color === 'brand' ? 'brand' : plan.color}-400`} />
                                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mt-1 mb-4">
                                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                                        <span className="text-sm text-gray-500">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    {isCurrentPlan ? (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-white/5 text-gray-500 text-sm font-medium">
                                            Current Plan
                                        </button>
                                    ) : plan.tier === 'free' ? (
                                        <button disabled className="w-full py-2.5 rounded-xl bg-white/5 text-gray-500 text-sm font-medium">
                                            Free Tier
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(plan.tier)}
                                            disabled={!plan.tier || plan.tier === 'free'}
                                            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                                            title="Upgrade plan"
                                        >
                                            Upgrade to {plan.name}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
