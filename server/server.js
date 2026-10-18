require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

// Modular Routers (Sub-apps)
const apiRouter = require('./core/api');
const forumRouter = require('./core/forum');
const mainRouter = require('./core/main');

const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// trust proxy is REQUIRED when behind Cloudflare/Nginx to get real IP for rate limiting
app.set('trust proxy', 1);

// Helmet adds essential security headers with Content Security Policy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://mc-heads.net", "https://cdn.discordapp.com"],
            connectSrc: ["'self'", "https://api.mcsrvstat.us", "https://*.orphionmc.net", "http://*.orphionmc.local:3000", "http://localhost:3000", "http://127.0.0.1:3000"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Additional Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    next();
});

// Global Rate Limiting - Slightly more restrictive for production
const rateLimit = require('express-rate-limit');
const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // Limit each IP to 200 requests per 10 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas peticiones desde esta IP. Inténtalo más tarde." },
    skip: (req) => req.ip === '127.0.0.1' // Optional: bypass local dev speed tests
});
app.use(globalLimiter);

// Domain configuration (Change per environment)
// For production: orphionmc.net
// For local dev: set DOMAIN=OrphionMC.local in .env
const DOMAIN = process.env.DOMAIN || 'orphionmc.net';

// Session Configuration (Shared across subdomains)
const isProduction = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
const sessionSecret = process.env.SESSION_SECRET || (
    isProduction 
        ? (() => { console.warn('[Security Warning] Generando SESSION_SECRET aleatorio en memoria.'); return crypto.randomBytes(32).toString('hex'); })()
        : 'OrphionMC_secret_key_subdomains'
);

const sessionConfig = {
    store: new SQLiteStore({ db: 'sessions.db', dir: path.resolve(__dirname) }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction, // Set to true if using HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
};

// Only set domain if we are using the official domain (not localhost)
if (DOMAIN !== 'localhost' && !DOMAIN.includes('local')) {
    sessionConfig.cookie.domain = `.${DOMAIN}`;
}

app.use(session(sessionConfig));

// Session Security: IP & User-Agent Fingerprinting
app.use((req, res, next) => {
    if (req.session.userId) {
        const currentFingerprint = {
            ip: req.ip,
            ua: req.get('User-Agent')
        };

        if (!req.session.fingerprint) {
            req.session.fingerprint = currentFingerprint;
        } else {
            // Check for significant changes (IP or UA)
            // Note: In some mobile networks IPs change frequently, but for a premium platform,
            // we should at least log or be cautious. 
            if (req.session.fingerprint.ua !== currentFingerprint.ua) {
                console.warn(`[Security] Session fingerprint mismatch for user ${req.session.userId}: UA changed.`);
                return req.session.destroy(() => res.status(401).json({ error: "Sesión invalidada por seguridad." }));
            }
        }
    }
    next();
});

app.use(express.json());

// ================= SUBDOMAIN DISPATCHER =================

app.use((req, res, next) => {
    const host = req.headers.host || '';
    const hostname = req.hostname;
    const requestPath = req.path;

    console.log(`[Dispatcher] Full Host (header): ${host} | Hostname: ${hostname} | Path: ${requestPath}`);

    // 1. API Subdomain or Path
    if (hostname.startsWith('api.') || requestPath.startsWith('/api')) {
        console.log(`  -> Dispatching to API Router`);
        // Remove /api prefix if present before passing to router
        if (requestPath.startsWith('/api')) {
            req.url = req.url.replace('/api', '') || '/';
        }
        return apiRouter(req, res, next);
    }

    // 2. Foro Subdomain or Path
    if (hostname.startsWith('foro.') || requestPath.startsWith('/foro')) {
        console.log(`  -> Dispatching to Forum Router`);
        // Remove /foro prefix if present
        if (requestPath.startsWith('/foro')) {
            req.url = req.url.replace('/foro', '') || '/';
        }
        return forumRouter(req, res, next);
    }

    // 3. Everything else (Main Site / IP access)
    console.log(`  -> Falling through to Main Router (IP or root domain)`);
    next();
});

// The Main Router handles the landing page and root assets
app.use(mainRouter);

// Custom 403 error handler
app.use((err, req, res, next) => {
    if (err.status === 403 || res.statusCode === 403) {
        if (req.xhr || req.headers.accept && req.headers.accept.includes('json')) {
            return res.status(403).json({ error: "Acceso denegado" });
        }
        return res.status(403).sendFile(path.join(__dirname, '../403.html'));
    }
    next(err);
});

// Default 404 handler
app.use((req, res) => {
    console.warn(`[404] Not Found: ${req.hostname}${req.path}`);
    res.status(404).send('Subdominio o ruta no encontrada.');
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`OrphionMC Multitask Server Running`);
    console.log(`Port: ${PORT}`);
    console.log(`Main Site: http://play.${DOMAIN}:${PORT}`);
    console.log(`Forum: http://foro.${DOMAIN}:${PORT}`);
    console.log(`API Engine: http://api.${DOMAIN}:${PORT}`);
    console.log(`-------------------------------------------`);
});

// Graceful Shutdown Handler (Production/PM2/Docker)
function gracefulShutdown(signal) {
    console.log(`\n[Server] Señal ${signal} recibida. Cerrando conexiones limpiamente...`);
    server.close(() => {
        console.log('[Server] Servidor HTTP detenido.');
        const db = require('./core/db');
        db.close((err) => {
            if (err) console.error('[Database] Error cerrando conexión SQLite:', err.message);
            else console.log('[Database] Base de datos cerrada correctamente.');
            process.exit(0);
        });
    });

    // Forzar cierre si no termina en 5 segundos
    setTimeout(() => {
        console.error('[Server] Cierre forzado tras tiempo de espera agotado.');
        process.exit(1);
    }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

