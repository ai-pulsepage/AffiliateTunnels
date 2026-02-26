const API_BASE = '/api';

let accessToken = localStorage.getItem('at_access_token');
let refreshToken = localStorage.getItem('at_refresh_token');

export function setTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    if (access) {
        localStorage.setItem('at_access_token', access);
        localStorage.setItem('at_refresh_token', refresh);
    } else {
        localStorage.removeItem('at_access_token');
        localStorage.removeItem('at_refresh_token');
    }
}

export function getAccessToken() {
    return accessToken;
}

async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
            setTokens(null, null);
            window.location.href = '/login';
            return null;
        }

        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    } catch {
        setTokens(null, null);
        window.location.href = '/login';
        return null;
    }
}

export async function api(path, options = {}) {
    const { body, method = body ? 'POST' : 'GET', headers = {}, raw = false } = options;

    const reqHeaders = {
        ...headers,
    };

    if (accessToken) {
        reqHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    if (body && !(body instanceof FormData)) {
        reqHeaders['Content-Type'] = 'application/json';
    }

    let res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: reqHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    // Token expired — try refresh
    if (res.status === 401 && refreshToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            reqHeaders['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(`${API_BASE}${path}`, {
                method,
                headers: reqHeaders,
                body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            });
        }
    }

    if (raw) return res;

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Auth helpers
export const authApi = {
    login: (email, password) => api('/auth/login', { body: { email, password } }),
    signup: (email, password, name) => api('/auth/signup', { body: { email, password, name } }),
    me: () => api('/auth/me'),
    updateProfile: (data) => api('/auth/profile', { body: data, method: 'PUT' }),
    forgotPassword: (email) => api('/auth/forgot-password', { body: { email } }),
    resetPassword: (token, password) => api('/auth/reset-password', { body: { token, password } }),
};

// Funnel helpers
export const funnelApi = {
    list: () => api('/funnels'),
    get: (id) => api(`/funnels/${id}`),
    create: (data) => api('/funnels', { body: data }),
    update: (id, data) => api(`/funnels/${id}`, { body: data, method: 'PUT' }),
    delete: (id) => api(`/funnels/${id}`, { method: 'DELETE' }),
    duplicate: (id) => api(`/funnels/${id}/duplicate`, { body: {} }),
    // Pages
    getPages: (funnelId) => api(`/funnels/${funnelId}/pages`),
    getPage: (funnelId, pageId) => api(`/funnels/${funnelId}/pages/${pageId}`),
    createPage: (funnelId, data) => api(`/funnels/${funnelId}/pages`, { body: data }),
    updatePage: (funnelId, pageId, data) => api(`/funnels/${funnelId}/pages/${pageId}`, { body: data, method: 'PUT' }),
    deletePage: (funnelId, pageId) => api(`/funnels/${funnelId}/pages/${pageId}`, { method: 'DELETE' }),
    duplicatePage: (funnelId, pageId, suffix) => api(`/funnels/${funnelId}/pages/${pageId}/duplicate`, { body: { suffix } }),
    getVersions: (funnelId, pageId) => api(`/funnels/${funnelId}/pages/${pageId}/versions`),
    rollback: (funnelId, pageId, versionId) => api(`/funnels/${funnelId}/pages/${pageId}/rollback/${versionId}`, { body: {}, method: 'PUT' }),
    // Custom templates
    listCustomTemplates: () => api('/funnels/templates/custom'),
    saveCustomTemplate: (data) => api('/funnels/templates/custom', { body: data }),
    deleteCustomTemplate: (id) => api(`/funnels/templates/custom/${id}`, { method: 'DELETE' }),
};

// Publish helpers
export const publishApi = {
    publishPage: (funnelId, pageId) => api(`/publish/${funnelId}/${pageId}`, { body: {} }),
    publishAll: (funnelId) => api(`/publish/${funnelId}`, { body: {} }),
    unpublish: (funnelId) => api(`/publish/${funnelId}/unpublish`, { body: {}, method: 'PUT' }),
};

// Analytics
export const analyticsApi = {
    getFunnel: (funnelId, params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api(`/analytics/funnel/${funnelId}${qs ? '?' + qs : ''}`);
    },
};

// Media
export const mediaApi = {
    list: ({ page = 1, folder_id, funnel_id } = {}) => {
        const params = new URLSearchParams({ page });
        if (folder_id) params.set('folder_id', folder_id);
        if (funnel_id) params.set('funnel_id', funnel_id);
        return api(`/media?${params}`);
    },
    /**
     * Upload a file. Tries presigned (direct to R2) first, falls back to server-side.
     */
    upload: async (file, folder_id) => {
        // If passed a FormData, extract the file from it
        let actualFile = file;
        let actualFolderId = folder_id;
        if (file instanceof FormData) {
            actualFile = file.get('file');
            actualFolderId = file.get('folder_id') || folder_id;
        }

        // Try presigned URL first (direct to R2, no server RAM used)
        try {
            const presign = await api('/media/presign', {
                method: 'POST',
                body: {
                    filename: actualFile.name,
                    mimetype: actualFile.type,
                    folder_id: actualFolderId,
                },
            });

            const r2Res = await fetch(presign.presignedUrl, {
                method: 'PUT',
                body: actualFile,
                headers: { 'Content-Type': actualFile.type },
            });

            if (!r2Res.ok) throw new Error('R2 PUT failed');

            return api('/media/confirm', {
                method: 'POST',
                body: {
                    filename: actualFile.name,
                    key: presign.key,
                    publicUrl: presign.publicUrl,
                    fileSize: actualFile.size,
                    mimetype: actualFile.type,
                    folder_id: actualFolderId,
                },
            });
        } catch (e) {
            console.warn('Presigned upload failed, falling back to server upload:', e.message);
        }

        // Fallback: upload through server (uses server RAM but reliable)
        const form = new FormData();
        form.append('file', actualFile);
        if (actualFolderId) form.append('folder_id', actualFolderId);
        return api('/media/upload', { body: form, method: 'POST' });
    },
    delete: (id) => api(`/media/${id}`, { method: 'DELETE' }),
    listFolders: () => api('/media/folders'),
    createFolder: (name, funnel_id) => api('/media/folders', { method: 'POST', body: { name, funnel_id } }),
    updateFolder: (id, data) => api(`/media/folders/${id}`, { method: 'PUT', body: data }),
    deleteFolder: (id) => api(`/media/folders/${id}`, { method: 'DELETE' }),
};

// Email
export const emailApi = {
    listTemplates: (funnel_id) => api(`/emails/templates${funnel_id ? `?funnel_id=${funnel_id}` : ''}`),
    createTemplate: (data) => api('/emails/templates', { body: data }),
    updateTemplate: (id, data) => api(`/emails/templates/${id}`, { body: data, method: 'PUT' }),
    deleteTemplate: (id) => api(`/emails/templates/${id}`, { method: 'DELETE' }),
    getDrip: (funnelId) => api(`/emails/drips/${funnelId}`),
    createDrip: (funnelId, data) => api(`/emails/drips/${funnelId}`, { body: data }),
    activateDrip: (id, active) => api(`/emails/drips/${id}/activate`, { body: { is_active: active }, method: 'PUT' }),
    addDripEmail: (id, data) => api(`/emails/drips/${id}/emails`, { body: data }),
    updateDripEmail: (dripId, emailId, data) => api(`/emails/drips/${dripId}/emails/${emailId}`, { body: data, method: 'PUT' }),
    deleteDripEmail: (dripId, emailId) => api(`/emails/drips/${dripId}/emails/${emailId}`, { method: 'DELETE' }),
    getMetrics: (funnelId) => api(`/emails/metrics/${funnelId}`),
    getLeads: (funnelId, page = 1) => api(`/emails/leads/${funnelId}?page=${page}`),
};

// Admin
export const adminApi = {
    getSettings: () => api('/admin/settings'),
    updateSettings: (settings) => api('/admin/settings', { body: { settings }, method: 'PUT' }),
    getUsers: (page = 1, search = '') => api(`/admin/users?page=${page}&search=${search}`),
    suspendUser: (id) => api(`/admin/users/${id}/suspend`, { body: {}, method: 'PUT' }),
    deleteUser: (id) => api(`/admin/users/${id}`, { method: 'DELETE' }),
    getStats: () => api('/admin/stats'),
    getHealth: () => api('/admin/health'),
    getBilling: () => api('/admin/billing'),
};

// Templates
export const templateApi = {
    list: (category) => api(`/templates${category ? '?category=' + category : ''}`),
    get: (id) => api(`/templates/${id}`),
    save: (data) => api('/templates', { body: data }),
    delete: (id) => api(`/templates/${id}`, { method: 'DELETE' }),
    apply: (templateId, pageId) => api(`/templates/${templateId}/apply/${pageId}`, { body: {} }),
};

// Affiliate
export const affiliateApi = {
    listContent: (type) => api(`/affiliate/content${type ? '?content_type=' + type : ''}`),
    uploadContent: (data) => {
        if (data instanceof FormData) return api('/affiliate/content', { body: data, method: 'POST' });
        return api('/affiliate/content', { body: data });
    },
    deleteContent: (id) => api(`/affiliate/content/${id}`, { method: 'DELETE' }),
    listHopLinks: () => api('/affiliate/hoplinks'),
    createHopLink: (data) => api('/affiliate/hoplinks', { body: data }),
    deleteHopLink: (id) => api(`/affiliate/hoplinks/${id}`, { method: 'DELETE' }),
    listCloakedLinks: () => api('/affiliate/cloaked-links'),
    createCloakedLink: (data) => api('/affiliate/cloaked-links', { body: data }),
    deleteCloakedLink: (id) => api(`/affiliate/cloaked-links/${id}`, { method: 'DELETE' }),
};

// ClickBank
export const clickbankApi = {
    getSales: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api(`/clickbank/sales${qs ? '?' + qs : ''}`);
    },
};

// Billing / Stripe
export const billingApi = {
    createCheckout: (priceId) => api('/stripe/checkout', { body: { priceId } }),
    openPortal: () => api('/stripe/portal', { body: {} }),
    getSubscription: () => api('/stripe/subscription'),
};

// AI
export const aiApi = {
    generatePage: (data) => api('/ai/generate-page', { body: data }),
    scrapeProduct: (url) => api('/ai/scrape-product', { body: { url } }),
    clonePage: (data) => api('/ai/clone-page', { body: data }),
    generateSeo: (content) => api('/ai/generate-seo', { body: { content } }),
};

// Blog
export const blogApi = {
    list: (params = {}) => { const qs = new URLSearchParams(params).toString(); return api(`/blog${qs ? '?' + qs : ''}`); },
    get: (id) => api(`/blog/${id}`),
    create: (data) => api('/blog', { body: data }),
    update: (id, data) => api(`/blog/${id}`, { method: 'PUT', body: data }),
    delete: (id) => api(`/blog/${id}`, { method: 'DELETE' }),
    publish: (id) => api(`/blog/${id}/publish`, { body: {} }),
    unpublish: (id) => api(`/blog/${id}/unpublish`, { method: 'PUT' }),
    categories: () => api('/blog/categories'),
};
