/**
 * Cloudflare Worker — Wildcard Subdomain Router for DealFindAI
 *
 * Routes *.dealfindai.com traffic to Railway via the main domain,
 * passing the original subdomain in a header so the server knows
 * which microsite to serve.
 *
 * Reserved subdomains (app, www, etc.) pass through unchanged.
 */

const ORIGIN = 'https://dealfindai.com';
const RESERVED = ['app', 'www', 'mail', 'api', 'admin', 'ftp', 'smtp', 'pop', 'imap', 'ns1', 'ns2'];

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const host = url.hostname.toLowerCase();
        const parts = host.split('.');

        // Only process subdomains of dealfindai.com (e.g. spas.dealfindai.com)
        const subdomain = parts.length >= 3 ? parts[0] : null;

        // Skip reserved subdomains — let them go directly to Railway
        if (!subdomain || RESERVED.includes(subdomain)) {
            return fetch(request);
        }

        // Rewrite the URL to go through the main domain
        const originUrl = new URL(url.pathname + url.search, ORIGIN);

        // Clone headers and add the original host
        const headers = new Headers(request.headers);
        headers.set('X-Original-Host', host);

        // Proxy the request to Railway via the main domain
        const response = await fetch(originUrl.toString(), {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
            redirect: 'follow',
        });

        // Return the response with CORS headers for the original domain
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('X-Served-By', 'dealfindai-worker');
        return newResponse;
    },
};
