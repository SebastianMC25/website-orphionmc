// OrphionMC Frontend Config
const CONFIG = {
    // URL de la API oficial con HTTPS vía Cloudflare
    CUSTOM_API: 'https://api.orphionmc.net/api',

    // Dynamic API discovery
    get API_BASE() {
        if (this.CUSTOM_API) {
            return this.CUSTOM_API.replace(/\/$/, '');
        }
        if (window.FORUM_API_URL) {
            return window.FORUM_API_URL.replace(/\/$/, '');
        }

        const host = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';

        // Detect if the host is an IP address (IPv4)
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host);

        // If we are on localhost or ip, use path-based API or port 3000 if frontend is on another dev port
        if (host === 'localhost' || isIP || !host.includes('.')) {
            if (window.location.port && window.location.port !== '3000') {
                return `http://${host}:3000/api`;
            }
            return `${window.location.origin}/api`;
        }

        // If we are on a subdomain (foro.OrphionMC.net), the API is on api.OrphionMC.net
        const parts = host.split('.');
        const domain = parts.slice(-2).join('.');
        return `${window.location.protocol}//api.${domain}${port}`;
    },
    DOMAIN: (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname)) ? window.location.hostname : (window.location.hostname.includes('.') ? window.location.hostname.split('.').slice(-2).join('.') : 'localhost')
};

window.CONFIG = CONFIG;

// Universal HTML sanitizer to prevent XSS attacks across all views
window.escapeHTML = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
