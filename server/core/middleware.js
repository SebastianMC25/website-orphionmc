const path = require('path');

/**
 * OrphionMC Centralized Middleware for RBAC and Error Handling
 */
const Middleware = {
    /**
     * Role-Based Authorization Factory
     * @param {string[]} allowedRoles - List of roles that can access the route
     */
    requireRole: (allowedRoles) => (req, res, next) => {
        // 1. Check if user is authenticated
        if (!req.session.userId) {
            if (req.xhr || req.headers.accept.includes('json')) {
                return res.status(401).json({ error: "No autorizado. Inicia sesión." });
            }
            return res.redirect('/login.html');
        }

        // 2. Check Role
        const userRole = req.session.role || 'user';
        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // 3. Handle Unauthorized (403)
        console.warn(`[Security] Unauthorized access attempt: 
            User ID: ${req.session.userId} 
            Role: ${userRole} 
            Path: ${req.originalUrl} 
            IP: ${req.ip}`);

        // Decide based on Accept header (HTML vs JSON)
        if (req.xhr || req.headers.accept && req.headers.accept.includes('json')) {
            return res.status(403).json({ 
                error: "Acceso denegado", 
                message: "No tienes los permisos necesarios para esta acción." 
            });
        } else {
            // Serve the custom 403 page
            return res.status(403).sendFile(path.join(__dirname, '../../403.html'));
        }
    }
};

module.exports = {
    requireAdmin: Middleware.requireRole(['admin']),
    requireModerator: Middleware.requireRole(['admin', 'moderator']),
    requireStaff: Middleware.requireRole(['admin', 'moderator', 'staff']),
    requireAuth: (req, res, next) => {
        if (!req.session.userId) {
            if (req.xhr || req.headers.accept.includes('json')) {
                return res.status(401).json({ error: "No autorizado" });
            }
            return res.redirect('/login.html');
        }
        next();
    }
};
