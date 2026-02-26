import { useState, useEffect, useCallback } from 'react';
import {
    X, Type, AlignLeft, AlignCenter, AlignRight, Palette,
    Square, Maximize2, Copy, Settings, ChevronDown, ChevronUp,
    Link2, Image, ArrowUpDown
} from 'lucide-react';

// ─── COLOR PRESETS ────────────────────────────
const COLOR_PRESETS = [
    '#ffffff', '#f8f9fa', '#f1f5f9', '#e2e8f0',
    '#111827', '#1f2937', '#374151', '#4b5563',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#0ea5e9', '#14b8a6', '#84cc16', '#f43f5e',
];

const FONT_SIZES = ['12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '42', '48', '56', '64'];

// ─── SETTINGS PANEL COMPONENT ────────────────
export default function BlockSettingsPanel({ block, blockIdx, onUpdateStyles, onDuplicate, onClose }) {
    const styles = block?.styles || {};

    function updateStyle(key, value) {
        onUpdateStyles(blockIdx, { ...styles, [key]: value });
    }

    function updateStyles(updates) {
        onUpdateStyles(blockIdx, { ...styles, ...updates });
    }

    // Always render the panel container to prevent layout bounce
    return (
        <div
            data-settings-panel
            className="w-72 bg-[#13151e] border-l border-white/5 flex-shrink-0 flex flex-col overflow-hidden"
            onMouseDown={e => {
                // Prevent focus steal from contentEditable blocks
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
                    e.preventDefault();
                }
            }}
        >
            {!block ? (
                /* No block selected — placeholder */
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <Settings className="w-6 h-6 text-gray-600 mb-3" />
                    <p className="text-xs text-gray-500">Click a block to edit its settings</p>
                </div>
            ) : (() => {
                const isTextBlock = ['heading', 'text', 'quote', 'list'].includes(block.type);
                const isButtonBlock = ['button', 'product', 'banner'].includes(block.type);
                const isMediaBlock = ['image', 'video'].includes(block.type);
                return (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Settings className="w-3.5 h-3.5 text-brand-400" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    {block.type} Settings
                                </span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md transition-colors">
                                <X className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

                            {/* ─── BACKGROUND ───────────────────── */}
                            <SettingsSection title="Background" icon={<Palette className="w-3 h-3" />}>
                                <ColorPicker
                                    label="Color"
                                    value={styles.backgroundColor || ''}
                                    onChange={val => updateStyle('backgroundColor', val)}
                                    placeholder="transparent"
                                />
                                <div className="mt-2">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Border Radius</label>
                                    <div className="flex gap-1">
                                        {['0', '4', '8', '12', '16', '24'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => updateStyle('borderRadius', r === '0' ? '' : `${r}px`)}
                                                className={`px-2 py-1 text-[11px] rounded transition-all ${(styles.borderRadius || '') === (r === '0' ? '' : `${r}px`)
                                                    ? 'bg-brand-500/30 text-brand-300 ring-1 ring-brand-500/50'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >{r === '0' ? '□' : `${r}`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Border</label>
                                    <div className="flex gap-1 items-center">
                                        <select
                                            value={styles.borderWidth || ''}
                                            onChange={e => updateStyle('borderWidth', e.target.value)}
                                            className="bg-white/5 text-gray-300 text-[11px] rounded px-1.5 py-1 border-none outline-none w-16"
                                        >
                                            <option value="">None</option>
                                            <option value="1px">1px</option>
                                            <option value="2px">2px</option>
                                            <option value="3px">3px</option>
                                        </select>
                                        {styles.borderWidth && (
                                            <ColorPicker
                                                value={styles.borderColor || '#e5e7eb'}
                                                onChange={val => updateStyle('borderColor', val)}
                                                compact
                                            />
                                        )}
                                    </div>
                                </div>
                            </SettingsSection>

                            {/* ─── SPACING ──────────────────────── */}
                            <SettingsSection title="Spacing" icon={<ArrowUpDown className="w-3 h-3" />}>
                                <div className="bg-white/5 rounded-lg p-3 relative">
                                    <div className="text-[9px] text-gray-500 text-center mb-1 uppercase">Padding</div>
                                    {/* top */}
                                    <div className="flex justify-center mb-1">
                                        <SpacingInput
                                            value={styles.paddingTop || ''}
                                            onChange={val => updateStyle('paddingTop', val)}
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* left + box + right */}
                                    <div className="flex items-center justify-center gap-2">
                                        <SpacingInput
                                            value={styles.paddingLeft || ''}
                                            onChange={val => updateStyle('paddingLeft', val)}
                                            placeholder="0"
                                        />
                                        <div className="w-16 h-10 bg-white/10 rounded border border-dashed border-white/20 flex items-center justify-center">
                                            <span className="text-[8px] text-gray-500">content</span>
                                        </div>
                                        <SpacingInput
                                            value={styles.paddingRight || ''}
                                            onChange={val => updateStyle('paddingRight', val)}
                                            placeholder="0"
                                        />
                                    </div>
                                    {/* bottom */}
                                    <div className="flex justify-center mt-1">
                                        <SpacingInput
                                            value={styles.paddingBottom || ''}
                                            onChange={val => updateStyle('paddingBottom', val)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-[9px] text-gray-500 uppercase mb-1">Margin Top / Bottom</div>
                                    <div className="flex gap-2">
                                        <SpacingInput
                                            value={styles.marginTop || ''}
                                            onChange={val => updateStyle('marginTop', val)}
                                            placeholder="0"
                                            label="Top"
                                        />
                                        <SpacingInput
                                            value={styles.marginBottom || ''}
                                            onChange={val => updateStyle('marginBottom', val)}
                                            placeholder="0"
                                            label="Bottom"
                                        />
                                    </div>
                                </div>
                            </SettingsSection>

                            {/* ─── TYPOGRAPHY (text blocks) ──────── */}
                            {isTextBlock && (
                                <SettingsSection title="Typography" icon={<Type className="w-3 h-3" />}>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Font Size</label>
                                            <select
                                                value={styles.fontSize || ''}
                                                onChange={e => updateStyle('fontSize', e.target.value ? `${e.target.value}px` : '')}
                                                className="bg-white/5 text-gray-300 text-[11px] rounded px-2 py-1.5 border-none outline-none w-full"
                                            >
                                                <option value="">Default</option>
                                                {FONT_SIZES.map(s => (
                                                    <option key={s} value={s}>{s}px</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Text Color</label>
                                            <ColorPicker
                                                value={styles.color || ''}
                                                onChange={val => updateStyle('color', val)}
                                                placeholder="default"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Text Align</label>
                                            <div className="flex gap-1">
                                                {[
                                                    { val: '', icon: <AlignLeft className="w-3 h-3" />, label: 'Left' },
                                                    { val: 'center', icon: <AlignCenter className="w-3 h-3" />, label: 'Center' },
                                                    { val: 'right', icon: <AlignRight className="w-3 h-3" />, label: 'Right' },
                                                ].map(a => (
                                                    <button
                                                        key={a.val}
                                                        onClick={() => updateStyle('textAlign', a.val)}
                                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] transition-all ${(styles.textAlign || '') === a.val
                                                            ? 'bg-brand-500/30 text-brand-300 ring-1 ring-brand-500/50'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                            }`}
                                                        title={a.label}
                                                    >{a.icon}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Line Height</label>
                                            <select
                                                value={styles.lineHeight || ''}
                                                onChange={e => updateStyle('lineHeight', e.target.value)}
                                                className="bg-white/5 text-gray-300 text-[11px] rounded px-2 py-1.5 border-none outline-none w-full"
                                            >
                                                <option value="">Default</option>
                                                <option value="1">Tight (1.0)</option>
                                                <option value="1.25">Snug (1.25)</option>
                                                <option value="1.5">Normal (1.5)</option>
                                                <option value="1.75">Relaxed (1.75)</option>
                                                <option value="2">Loose (2.0)</option>
                                            </select>
                                        </div>
                                    </div>
                                </SettingsSection>
                            )}

                            {/* ─── BUTTON STYLES ─────────────────── */}
                            {isButtonBlock && (
                                <SettingsSection title="Button Style" icon={<Square className="w-3 h-3" />}>
                                    <div className="space-y-2">
                                        <ColorPicker
                                            label="Button Color"
                                            value={styles.buttonColor || ''}
                                            onChange={val => updateStyle('buttonColor', val)}
                                            placeholder="default"
                                        />
                                        <ColorPicker
                                            label="Text Color"
                                            value={styles.buttonTextColor || ''}
                                            onChange={val => updateStyle('buttonTextColor', val)}
                                            placeholder="default"
                                        />
                                    </div>
                                </SettingsSection>
                            )}

                            {/* ─── VISIBILITY ────────────────────── */}
                            <SettingsSection title="Visibility" icon={<Maximize2 className="w-3 h-3" />}>
                                <div className="flex gap-2">
                                    {[
                                        { val: '', label: 'All Devices' },
                                        { val: 'desktop', label: 'Desktop Only' },
                                        { val: 'mobile', label: 'Mobile Only' },
                                    ].map(v => (
                                        <button
                                            key={v.val}
                                            onClick={() => updateStyle('visibility', v.val)}
                                            className={`flex-1 py-1.5 rounded text-[10px] transition-all ${(styles.visibility || '') === v.val
                                                ? 'bg-brand-500/30 text-brand-300 ring-1 ring-brand-500/50'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >{v.label}</button>
                                    ))}
                                </div>
                            </SettingsSection>

                            {/* ─── ACTIONS ───────────────────────── */}
                            <SettingsSection title="Actions">
                                <button
                                    onClick={() => onDuplicate(blockIdx)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Duplicate Block
                                </button>
                            </SettingsSection>

                        </div>
                    </>
                );
            })()}
        </div>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────

function SettingsSection({ title, icon, children }) {
    const [open, setOpen] = useState(true);
    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 w-full text-left mb-2 group"
            >
                {icon && <span className="text-gray-500">{icon}</span>}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-1">{title}</span>
                {open
                    ? <ChevronUp className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                    : <ChevronDown className="w-3 h-3 text-gray-600 group-hover:text-gray-400" />
                }
            </button>
            {open && <div>{children}</div>}
        </div>
    );
}

function ColorPicker({ label, value, onChange, placeholder, compact }) {
    const [showPresets, setShowPresets] = useState(false);

    return (
        <div className="relative">
            {label && <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>}
            <div className="flex items-center gap-1.5">
                <div
                    className="w-7 h-7 rounded-md border border-white/10 cursor-pointer flex-shrink-0 transition-transform hover:scale-110"
                    style={{ background: value || 'transparent', backgroundImage: !value ? 'linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%)' : undefined, backgroundSize: !value ? '8px 8px' : undefined, backgroundPosition: !value ? '0 0, 4px 4px' : undefined }}
                    onClick={() => setShowPresets(!showPresets)}
                    title="Pick color"
                />
                {!compact && (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder || '#hex'}
                        className="bg-white/5 text-gray-300 text-[11px] rounded px-2 py-1.5 border-none outline-none flex-1 min-w-0"
                    />
                )}
                {value && (
                    <button
                        onClick={() => { onChange(''); setShowPresets(false); }}
                        className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white"
                        title="Clear"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
            {showPresets && (
                <div className="absolute z-50 mt-1 p-2 bg-[#1a1d27] border border-white/10 rounded-lg shadow-2xl grid grid-cols-5 gap-1.5 w-48">
                    {COLOR_PRESETS.map(c => (
                        <button
                            key={c}
                            onClick={() => { onChange(c); setShowPresets(false); }}
                            className="w-7 h-7 rounded-md border border-white/10 hover:scale-110 transition-transform"
                            style={{ background: c }}
                            title={c}
                        />
                    ))}
                    <div className="col-span-5 mt-1">
                        <input
                            type="color"
                            value={value || '#ffffff'}
                            onChange={e => { onChange(e.target.value); setShowPresets(false); }}
                            className="w-full h-6 rounded cursor-pointer bg-transparent"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function SpacingInput({ value, onChange, placeholder, label }) {
    return (
        <div className="flex flex-col items-center">
            {label && <span className="text-[8px] text-gray-600 mb-0.5">{label}</span>}
            <input
                type="text"
                value={value ? parseInt(value) || '' : ''}
                onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    onChange(v ? `${v}px` : '');
                }}
                placeholder={placeholder}
                className="w-10 h-6 bg-white/5 text-gray-300 text-[10px] text-center rounded border border-white/10 outline-none focus:border-brand-500/50"
            />
        </div>
    );
}
