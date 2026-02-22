import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            setSent(true);
            toast.success('Check your email for reset instructions');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-brand-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">AffiliateTunnels</h1>
                </div>

                <div className="card">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📧</span>
                            </div>
                            <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
                            <p className="text-gray-400 text-sm">If an account exists for {email}, you'll receive a password reset link.</p>
                            <Link to="/login" className="btn-secondary inline-flex items-center gap-2 mt-6">
                                <ArrowLeft className="w-4 h-4" /> Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-white mb-1">Reset password</h2>
                            <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required autoFocus />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full">
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                            <p className="text-center text-sm text-gray-500 mt-6">
                                <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                                    ← Back to login
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
