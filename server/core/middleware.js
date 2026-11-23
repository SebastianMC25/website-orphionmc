const path = require('path');
const { verifyAuthToken } = require('./auth_token');

/**
 * Función auxiliar para verificar si la petición espera respuesta en JSON
 */
function isJsonRequest(req) {
    if (req.xhr) return true;
    if (req.headers.accept && typeof req.headers.accept === 'string' && req.headers.accept.includes('json')) return true;
    if (req.headers['content-type'] && typeof req.headers['content-type'] === 'string' && req.headers['content-type'].includes('json')) return true;
    if (req.originalUrl && req.originalUrl.includes('/api/')) return true;
    return false;
}

/**
 * Intenta autenticar al usuario mediante token Bearer si no tiene sesión activa
 */
function resolveUser(req) {
    if (req.session && req.session.userId) {
        return true;
    }
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        const decoded = verifyAuthToken(token);
        if (decoded && decoded.id) {
            if (!req.session) req.session = {};
            req.session.userId = decoded.id;
            req.session.username = decoded.username;
            req.session.role = decoded.role || 'user';
            return true;
        }
    }
    return false;
}

/**
 * OrphionMC Centralized Middleware for RBAC and Auth
 */
const Middleware = {
    requireRole: (allowedRoles) => (req, res, next) => {
        resolveUser(req);

        if (!req.session || !req.session.userId) {
            if (isJsonRequest(req)) {
                return res.status(401).json({ error: "No autorizado. Inicia sesión." });
            }
            return res.redirect('/login.html');
        }

        const userRole = (req.session.role || 'user').toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
        if (normalizedAllowed.includes(userRole)) {
            return next();
        }

        console.warn(`[Security] Unauthorized access attempt: User ID: ${req.session.userId} Role: ${userRole} Path: ${req.originalUrl}`);

        if (isJsonRequest(req)) {
            return res.status(403).json({ 
                error: "Acceso denegado", 
                message: "No tienes los permisos necesarios para esta acción." 
            });
        }
        return res.status(403).sendFile(path.join(__dirname, '../../403.html'));
    }
};

module.exports = {
    requireAdmin: Middleware.requireRole(['admin']),
    requireModerator: Middleware.requireRole(['admin', 'moderator']),
    requireStaff: Middleware.requireRole(['admin', 'moderator', 'staff']),
    requireAuth: (req, res, next) => {
        resolveUser(req);

        if (!req.session || !req.session.userId) {
            if (isJsonRequest(req)) {
                return res.status(401).json({ error: "No autorizado. Inicia sesión." });
            }
            return res.redirect('/login.html');
        }
        next();
    }
};
