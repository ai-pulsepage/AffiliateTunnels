import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Layers, Mail, BarChart3, Image, Globe,
    Settings, Users, Shield, Activity, LogOut, ChevronDown, Menu, X, Bot, Briefcase, Store, Hash, Database, Sun, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Command Center', exact: true },
    { to: '/supplier-search', icon: Briefcase, label: 'Supplier Search' },
    { to: '/vendor-intel', icon: Database, label: 'Product Refiner' },
    { to: '/store-manager', icon: Store, label: 'Store Manager' },
    { to: '/content-network', icon: Globe, label: 'Content Network' },
    { to: '/keywords', icon: Hash, label: 'Keyword Ads' },
    { to: '/blogmaker', icon: Bot, label: 'BlogMaker' },
    { to: '/funnels', icon: Layers, label: 'Landing Pages' },
    { to: '/emails', icon: Mail, label: 'Campaigns' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/media', icon: Image, label: 'Media' },
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    // Handle theme changes
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-surface-900 transition-colors duration-200">
            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2 bg-surface-800 border border-white/10 rounded-lg shadow-lg"
            >
                <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 flex flex-col border-r border-white/5 bg-surface-850
                transform transition-transform duration-200 ease-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo + close */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-tight">DealFindAI</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Command Center</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-1.5 hover:bg-white/5 rounded-lg"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
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
                        <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-brand-400 transition-colors bg-white/5 rounded-lg" title="Toggle Theme">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button onClick={logout} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors bg-white/5 rounded-lg" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto md:animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
