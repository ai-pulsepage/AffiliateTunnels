import { useState, useEffect } from 'react';
import { funnelApi } from '../../lib/api';
import { Save, Palette, Type, Globe, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Funnel-level settings panel — brand colors, fonts, SEO, tracking overrides
 */
export default function FunnelSettings({ funnel, onUpdate }) {
    const [form, setForm] = useState({
        name: '',
        slug: '',
        seo_title: '',
        seo_description: '',
        og_image_url: '',
        ga4_id: '',
        fb_pixel_id: '',
        brand_colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#10b981' },
        brand_fonts: { heading: 'Inter', body: 'Inter' },
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (funnel) {
            setForm({
                name: funnel.name || '',
                slug: funnel.slug || '',
                seo_title: funnel.seo_title || '',
                seo_description: funnel.seo_description || '',
                og_image_url: funnel.og_image_url || '',
                ga4_id: funnel.ga4_id || '',
                fb_pixel_id: funnel.fb_pixel_id || '',
                brand_colors: funnel.brand_colors || { primary: '#6366f1', secondary: '#8b5cf6', accent: '#10b981' },
                brand_fonts: funnel.brand_fonts || { heading: 'Inter', body: 'Inter' },
            });
        }
    }, [funnel]);

    async function handleSave() {
        setSaving(true);
        try {
            const data = await funnelApi.update(funnel.id, form);
            toast.success('Funnel settings saved');
            if (onUpdate) onUpdate(data.funnel);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    }

    function updateField(key, val) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    function updateBrandColor(key, val) {
        setForm(prev => ({ ...prev, brand_colors: { ...prev.brand_colors, [key]: val } }));
    }

    function updateBrandFont(key, val) {
        setForm(prev => ({ ...prev, brand_fonts: { ...prev.brand_fonts, [key]: val } }));
    }

    const fonts = ['Inter', 'Roboto', 'Poppins', 'Outfit', 'Space Grotesk', 'DM Sans', 'Montserrat', 'Open Sans', 'Lato', 'Playfair Display'];

    return (
        <div className="space-y-6 max-w-2xl">
            {/* General */}
            <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-400" /> General
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Funnel Name</label>
                        <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">URL Slug</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">/p/</span>
                            <input type="text" value={form.slug} onChange={e => updateField('slug', e.target.value)} className="input-field" placeholder="my-funnel" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand */}
            <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" /> Brand Colors
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {['primary', 'secondary', 'accent'].map(key => (
                        <div key={key}>
                            <label className="block text-xs text-gray-400 mb-1.5 capitalize">{key}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form.brand_colors[key] || '#6366f1'}
                                    onChange={e => updateBrandColor(key, e.target.value)}
                                    className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={form.brand_colors[key] || ''}
                                    onChange={e => updateBrandColor(key, e.target.value)}
                                    className="input-field text-xs font-mono"
                                    placeholder="#6366f1"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fonts */}
            <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-400" /> Typography
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {['heading', 'body'].map(key => (
                        <div key={key}>
                            <label className="block text-xs text-gray-400 mb-1.5 capitalize">{key} Font</label>
                            <select
                                value={form.brand_fonts[key] || 'Inter'}
                                onChange={e => updateBrandFont(key, e.target.value)}
                                className="input-field"
                            >
                                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEO */}
            <div className="card">
                <h3 className="font-semibold text-white mb-4">SEO Defaults</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Default SEO Title</label>
                        <input type="text" value={form.seo_title} onChange={e => updateField('seo_title', e.target.value)} className="input-field" placeholder="Funnel title for search engines" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">Default Meta Description</label>
                        <textarea value={form.seo_description} onChange={e => updateField('seo_description', e.target.value)} className="input-field h-20" placeholder="Funnel description for search results" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">OG Image URL</label>
                        <input type="text" value={form.og_image_url} onChange={e => updateField('og_image_url', e.target.value)} className="input-field" placeholder="https://..." />
                    </div>
                </div>
            </div>

            {/* Tracking */}
            <div className="card">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" /> Tracking Overrides
                </h3>
                <p className="text-xs text-gray-500 mb-4">Override global tracking IDs for this funnel. Leave blank to use system defaults.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">GA4 Measurement ID</label>
                        <input type="text" value={form.ga4_id} onChange={e => updateField('ga4_id', e.target.value)} className="input-field text-sm" placeholder="G-XXXXXXXXXX" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Facebook Pixel ID</label>
                        <input type="text" value={form.fb_pixel_id} onChange={e => updateField('fb_pixel_id', e.target.value)} className="input-field text-sm" placeholder="123456789" />
                    </div>
                </div>
            </div>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );
}
