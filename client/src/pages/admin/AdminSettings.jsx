import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Save, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [settings, setSettings] = useState([]);
    const [rawValues, setRawValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [revealed, setRevealed] = useState({});
    const [testing, setTesting] = useState(false);

    useEffect(() => { loadSettings(); }, []);

    async function loadSettings() {
        try {
            const d = await adminApi.getSettings();
            setSettings(d.settings || []);
            const raw = {};
            d.rawSettings?.forEach(s => { raw[s.key] = s.value || ''; });
            setRawValues(raw);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await adminApi.updateSettings(rawValues);
            toast.success('Settings saved');
            loadSettings();
        } catch (err) { toast.error(err.message); }
        finally { setSaving(false); }
    }

    const groups = {
        'Email (Resend)': ['resend_api_key', 'from_email', 'from_name'],
        'Stripe': ['stripe_secret_key', 'stripe_publishable_key', 'stripe_webhook_secret', 'stripe_pro_price_id', 'stripe_agency_price_id'],
        'Cloudflare R2': ['r2_access_key', 'r2_secret_key', 'r2_bucket_name', 'r2_public_url', 'r2_endpoint'],
        'ClickBank': ['clickbank_secret_key', 'clickbank_clerk_api_key'],
        'Tracking': ['default_ga4_id', 'default_gads_id', 'default_fb_pixel_id', 'default_tiktok_pixel_id', 'tiktok_events_api_token'],
        'AI (Gemini)': ['gemini_api_key'],
        'Application': ['app_base_url', 'physical_address'],
    };

    if (loading) return <div className="card animate-pulse h-96" />;

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">API Settings</h1>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
                </button>
            </div>

            <p className="text-sm text-gray-400">Configure your integrations. Sensitive values are encrypted at rest.</p>

            {Object.entries(groups).map(([group, keys]) => (
                <div key={group} className="card">
                    <h2 className="font-semibold text-white mb-4">{group}</h2>
                    <div className="space-y-4">
                        {keys.map(key => {
                            const setting = settings.find(s => s.key === key);
                            const isSecret = setting?.isEncrypted;
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-sm font-medium text-gray-300">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                                        {isSecret && (
                                            <button onClick={() => setRevealed(prev => ({ ...prev, [key]: !prev[key] }))} className="text-xs text-gray-500 flex items-center gap-1">
                                                {revealed[key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                {revealed[key] ? 'Hide' : 'Reveal'}
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type={(isSecret && !revealed[key]) ? 'password' : 'text'}
                                        value={rawValues[key] || ''}
                                        onChange={e => setRawValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="input-field"
                                        placeholder={setting?.description || ''}
                                    />
                                    {setting?.description && <p className="text-xs text-gray-600 mt-1">{setting.description}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* TikTok Test Button */}
            <div className="card">
                <h2 className="font-semibold text-white mb-2">Test Integrations</h2>
                <p className="text-xs text-gray-500 mb-4">Fire a test event to verify your TikTok Events API is connected.</p>
                <button
                    onClick={async () => {
                        setTesting(true);
                        try {
                            const r = await adminApi.testTikTok();
                            if (r.success) toast.success(r.message);
                            else toast.error(r.message || 'TikTok API error');
                        } catch (err) { toast.error(err.message); }
                        finally { setTesting(false); }
                    }}
                    disabled={testing}
                    className="btn-secondary flex items-center gap-2 text-sm"
                >
                    <Zap className="w-4 h-4" />
                    {testing ? 'Sending...' : 'Test TikTok Events API'}
                </button>
            </div>
        </div>
    );
}
