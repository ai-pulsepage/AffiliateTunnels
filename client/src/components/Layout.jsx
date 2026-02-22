import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FunnelProvider } from './FunnelContext';
import FunnelSwitcher from './FunnelSwitcher';
import {
    LayoutDashboard, Layers, Mail, BarChart3, Image, Link2, Layout as LayoutIcon,
    Settings, Users, Shield, Activity, LogOut, ChevronDown, Zap
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/funnels', icon: Layers, label: 'Funnels' },
    { to: '/emails', icon: Mail, label: 'Emails' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/media', icon: Image, label: 'Media' },
    { to: '/affiliate', icon: Link2, label: 'Affiliate Tools' },
    { to: '/templates', icon: LayoutIcon, label: 'Templates' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminItems = [
    { to: '/admin/settings', icon: Shield, label: 'API Settings' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/stats', icon: Activity, label: 'System Stats' },
];

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [adminOpen, setAdminOpen] = useState(location.pathname.startsWith('/admin'));

    return (
        <FunnelProvider>
            <div className="flex h-screen overflow-hidden bg-surface-900">
                {/* Sidebar */}
                <aside className="w-64 flex flex-col border-r border-white/5 bg-surface-850">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-tight">AffiliateTunnels</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Funnel Builder</p>
                        </div>
                    </div>

                    {/* Funnel Switcher */}
                    <div className="px-3 py-3 border-b border-white/5">
                        <FunnelSwitcher />
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navItems.map(({ to, icon: Icon, label, exact }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={exact}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <Icon className="w-4.5 h-4.5 shrink-0" />
                                <span className="text-sm">{label}</span>
                            </NavLink>
                        ))}

                        {isAdmin && (
                            <>
                                <div className="pt-4 pb-1">
                                    <button
                                        onClick={() => setAdminOpen(!adminOpen)}
                                        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
                                    >
                                        Admin
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                {adminOpen && adminItems.map(({ to, icon: Icon, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className={({ isActive }) =>
                                            `sidebar-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <Icon className="w-4.5 h-4.5 shrink-0" />
                                        <span className="text-sm">{label}</span>
                                    </NavLink>
                                ))}
                            </>
                        )}
                    </nav>

                    {/* User */}
                    <div className="border-t border-white/5 px-3 py-3">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                {(user?.name || user?.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors" title="Logout">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </FunnelProvider>
    );
}
