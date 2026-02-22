import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Funnels from './pages/Funnels';
import FunnelDetail from './pages/FunnelDetail';
import PageBuilder from './pages/PageBuilder';
import EmailBuilder from './pages/EmailBuilder';
import DripBuilder from './pages/DripBuilder';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import MediaLibrary from './pages/MediaLibrary';
import AffiliateTools from './pages/AffiliateTools';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStats from './pages/admin/AdminStats';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-surface-900">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="funnels" element={<Funnels />} />
                <Route path="funnels/:id" element={<FunnelDetail />} />
                <Route path="emails" element={<EmailBuilder />} />
                <Route path="drip/:funnelId" element={<DripBuilder />} />
                <Route path="leads/:funnelId" element={<Leads />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="affiliate" element={<AffiliateTools />} />
                <Route path="templates" element={<Templates />} />
                <Route path="settings" element={<Settings />} />

                {/* Admin routes */}
                <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
            </Route>

            {/* Full-screen page builder (outside layout) */}
            <Route path="/builder/:funnelId/:pageId" element={<ProtectedRoute><PageBuilder /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
