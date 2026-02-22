import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setTokens } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('at_access_token');
        if (token) {
            authApi.me()
                .then(data => setUser(data.user))
                .catch(() => {
                    setTokens(null, null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    async function login(email, password) {
        const data = await authApi.login(email, password);
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        return data.user;
    }

    async function signup(email, password, name) {
        const data = await authApi.signup(email, password, name);
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        return data.user;
    }

    function logout() {
        setTokens(null, null);
        setUser(null);
        window.location.href = '/login';
    }

    async function refreshUser() {
        const data = await authApi.me();
        setUser(data.user);
    }

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
