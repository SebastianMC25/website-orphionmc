// OrphionMC Frontend Config
const CONFIG = {
    // Dynamic API discovery
    get API_BASE() {
        const host = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';

        // Detect if the host is an IP address (IPv4)
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host);

        // If we are on localhost or ip, use path-based API (/api)
        if (host === 'localhost' || isIP || !host.includes('.')) {
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
