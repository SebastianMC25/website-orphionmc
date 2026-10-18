const express = require('express');
const db = require('./db');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const antiBot = require('./antibot');
const SecurityLogic = require('./security_logic');
const { requireAuth, requireAdmin, requireModerator, requireStaff } = require('./middleware');
const discordAuth = require('./discord_auth');

const api = express.Router(); // Using router to mount on the main app easily

// Mount Discord Auth
api.use(discordAuth);

// Simple In-Memory Cache
const cache = {
    categories: { data: null, expires: 0 }
};

// CORS for API (Only allow subdomains)
// In production, Cloudflare should also enforce Origin checks.
const allowedOrigins = [
    'https://orphionmc.net',
    'https://play.orphionmc.net',
    'https://foro.orphionmc.net',
    'https://api.orphionmc.net',
    'http://orphionmc.local:3000',
    'http://play.orphionmc.local:3000',
    'http://foro.orphionmc.local:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

api.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const lowerOrigin = origin.toLowerCase();
        if (allowedOrigins.includes(lowerOrigin)) {
            callback(null, true);
        } else {
            console.warn(`[Security] Blocked CORS attempt from: ${origin}`);
            callback(new Error('CORS no permitido para este origen'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key']
}));

// General Rate Limiting (100 per 15 min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Demasiadas peticiones. Inténtalo más tarde." }
});
api.use(limiter);

// Strict Rate Limiting for Auth (5 per 15 min)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Demasiados intentos de acceso. Inténtalo en 15 minutos." }
});

// Post creation limiting (10 per 15 min)
const postLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Estás publicando demasiado rápido. Espera un momento." }
});

// RBAC Middlewares (Moved to middleware.js)

// ================= API ROUTES =================

api.get('/categories', (req, res) => {
    // Check Cache
    if (cache.categories.data && cache.categories.expires > Date.now()) {
        return res.json(cache.categories.data);
    }

    const sql = `
        SELECT c.*, 
        (SELECT COUNT(*) FROM threads WHERE category_id = c.id) as thread_count,
        (SELECT COUNT(*) FROM posts p JOIN threads t ON p.thread_id = t.id WHERE t.category_id = c.id) + 
        (SELECT COUNT(*) FROM threads WHERE category_id = c.id) as post_count
        FROM categories c 
        ORDER BY view_order ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Update Cache (5 minutes)
        cache.categories = {
            data: rows,
            expires: Date.now() + 5 * 60 * 1000
        };

        res.json(rows);
    });
});

api.get('/categories/:id/threads', (req, res) => {
    const sql = `
        SELECT t.*, u.username as author_name, u.avatar_url,
        (SELECT COUNT(*) FROM posts WHERE thread_id = t.id) as reply_count,
        (SELECT MAX(created_at) FROM posts WHERE thread_id = t.id) as last_post_at
        FROM threads t
        JOIN users u ON t.user_id = u.id
        WHERE t.category_id = ?
        ORDER BY t.is_pinned DESC, last_post_at DESC
    `;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Global Stats (Static routes first)
api.get('/stats', (req, res) => {
    db.get(`SELECT (SELECT COUNT(*) FROM users) as user_count, (SELECT COUNT(*) FROM posts) + (SELECT COUNT(*) FROM threads) as message_count`, [], (err, row) => {
        res.json(row);
    });
});

// Recent Threads (Static routes first)
api.get('/threads/recent', (req, res) => {
    const sql = `
        SELECT t.id, t.title, t.created_at, u.username, u.avatar_url
        FROM threads t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 5
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

api.post('/threads', requireAuth, postLimiter, (req, res) => {
    const { category_id, title, content, prefix } = req.body;
    if (!category_id || !title || !content) return res.status(400).json({ error: "Faltan campos requeridos" });

    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 120) {
        return res.status(400).json({ error: "El título debe tener entre 3 y 120 caracteres" });
    }
    if (typeof content !== 'string' || content.trim().length < 5 || content.trim().length > 10000) {
        return res.status(400).json({ error: "El contenido debe tener entre 5 y 10,000 caracteres" });
    }

    db.get('SELECT type FROM categories WHERE id = ?', [category_id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Categoría no encontrada" });
        if (row.type === 'announcement' && req.session.role !== 'admin') {
            return res.status(403).json({ error: "Permiso denegado" });
        }
        db.run(`INSERT INTO threads (category_id, user_id, title, content, prefix) VALUES (?, ?, ?, ?, ?)`,
            [category_id, req.session.userId, title.trim(), content.trim(), (prefix && typeof prefix === 'string') ? prefix.substring(0, 20) : ''], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, message: "Tema creado" });
            });
    });
});

api.get('/threads/:id', (req, res) => {
    const userId = req.session.userId || 0;
    db.run(`UPDATE threads SET views = views + 1 WHERE id = ?`, [req.params.id]);

    const sql = `
        SELECT t.*, u.username as author_name, u.role as author_role, u.avatar_url, c.name as category_name, c.type as category_type,
        (SELECT SUM(vote_value) FROM thread_votes WHERE thread_id = t.id) as vote_score,
        (SELECT vote_value FROM thread_votes WHERE thread_id = t.id AND user_id = ?) as user_vote
        FROM threads t JOIN users u ON t.user_id = u.id JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
    `;
    db.get(sql, [userId, req.params.id], (err, thread) => {
        if (err || !thread) return res.status(404).json({ error: "No encontrado" });
        db.all(`SELECT p.*, u.username, u.role, u.avatar_url FROM posts p JOIN users u ON p.user_id = u.id WHERE p.thread_id = ? ORDER BY p.created_at ASC`,
            [req.params.id], (err, posts) => {
                res.json({ thread, posts });
            });
    });
});

api.post('/threads/:id/posts', requireAuth, postLimiter, (req, res) => {
    if (!req.body.content || typeof req.body.content !== 'string' || req.body.content.trim().length === 0) {
        return res.status(400).json({ error: "Mensaje vacío" });
    }
    if (req.body.content.trim().length > 5000) {
        return res.status(400).json({ error: "El mensaje no puede exceder los 5,000 caracteres" });
    }

    const userId = req.session.userId;
    const threadId = req.params.id;

    // 1. Anti-Spam: Cooldown Check (60 seconds)
    db.get("SELECT created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId], (err, lastPost) => {
        if (lastPost) {
            const lastTime = new Date(lastPost.created_at).getTime();
            if (Date.now() - lastTime < 60000) {
                return res.status(429).json({ error: "Debes esperar 60 segundos entre mensajes." });
            }
        }

        // 2. Insert Post
        db.run(`INSERT INTO posts (thread_id, user_id, content) VALUES (?, ?, ?)`,
            [threadId, userId, req.body.content.trim()], function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const postId = this.lastID;

                // 3. Create Notification for Thread Owner
                db.get("SELECT user_id, title FROM threads WHERE id = ?", [threadId], (err, thread) => {
                    if (thread && thread.user_id !== userId) {
                        SecurityLogic.addNotification(thread.user_id, 'reply', {
                            threadId: threadId,
                            threadTitle: thread.title,
                            senderName: req.session.username
                        });
                    }
                });

                res.json({ id: postId, message: "Respuesta enviada" });
            });
    });
});

api.post('/threads/:id/vote', requireAuth, (req, res) => {
    const { vote } = req.body;
    if (![1, -1].includes(vote)) return res.status(400).json({ error: "Voto inválido" });
    db.run(`INSERT INTO thread_votes (thread_id, user_id, vote_value) VALUES (?, ?, ?) ON CONFLICT(thread_id, user_id) DO UPDATE SET vote_value = excluded.vote_value`,
        [req.params.id, req.session.userId, vote], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Voto registrado" });
        });
});

api.put('/threads/:id/status', requireAuth, (req, res) => {
    const { status, pinned, locked } = req.body;
    db.get('SELECT user_id FROM threads WHERE id = ?', [req.params.id], (err, row) => {
        if (!row) return res.status(404).json({ error: "No encontrado" });

        const isOwner = row.user_id === req.session.userId;
        const isStaff = ['admin', 'moderator', 'staff'].includes(req.session.role);

        let updates = [];
        let params = [];

        if (status && (isStaff || (isOwner && status === 'solved'))) {
            updates.push("status = ?");
            params.push(status);
        }

        if (pinned !== undefined && isStaff) {
            updates.push("is_pinned = ?");
            params.push(pinned ? 1 : 0);
        }

        if (locked !== undefined && isStaff) {
            updates.push("is_locked = ?");
            params.push(locked ? 1 : 0);
        }

        if (updates.length === 0) return res.status(403).json({ error: "Sin permiso para estas acciones" });

        params.push(req.params.id);
        db.run(`UPDATE threads SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Tema actualizado correctamente" });
        });
    });
});

// DELETED ROUTES (Moved up)

// Anti-Bot Token Initialization
api.get('/auth/init', (req, res) => {
    antiBot.initSession(req, res);
});

// Auth Routes
api.post('/auth/register', authLimiter, antiBot.verify, async (req, res) => {
    const { username, password, email } = req.body;

    // Strict input validation
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
        return res.status(400).json({ error: "El usuario debe tener entre 3 y 20 caracteres alfanuméricos o guion bajo." });
    }

    if (password.length < 6 || password.length > 100) {
        return res.status(400).json({ error: "La contraseña debe tener entre 6 y 100 caracteres." });
    }

    if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
        return res.status(400).json({ error: "El correo electrónico no es válido." });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)`,
            [cleanUsername, hash, email ? email.trim() : null], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.username')) {
                        return res.status(409).json({ error: "El nombre de usuario ya existe" });
                    }
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return res.status(409).json({ error: "El email ya está registrado" });
                    }
                    return res.status(500).json({ error: "Error en el registro" });
                }

                // Rotation on register too (best practice)
                req.session.regenerate((err) => {
                    req.session.userId = this.lastID;
                    req.session.username = cleanUsername;
                    req.session.role = 'user';
                    req.session.fingerprint = { ip: req.ip, ua: req.get('User-Agent') };

                    res.json({ id: this.lastID, username: cleanUsername, role: 'user' });
                });
            });
    } catch (e) { res.status(500).json({ error: "Error interno" }); }
});

api.post('/auth/login', authLimiter, antiBot.verify, (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
        if (!row || !(await bcrypt.compare(password, row.password_hash))) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // 1. Check if banned
        if (row.is_banned) {
            return res.status(403).json({
                error: "Tu cuenta ha sido suspendida permanentemente.",
                reason: "Violación de los términos de servicio."
            });
        }

        // 2. Update last login info
        db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?", [req.ip, row.id]);

        // Professional Session Rotation
        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: "Error de sesión" });

            // Store user data in the NEW session
            req.session.userId = row.id;
            req.session.username = row.username;
            req.session.role = row.role;

            // Initial fingerprint
            req.session.fingerprint = {
                ip: req.ip,
                ua: req.get('User-Agent')
            };

            // Log security event (last login & IP)
            db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?", [req.ip, row.id]);

            // If 2FA is enabled, we don't return the full success yet or return a flag
            if (row.two_factor_enabled) {
                // Here we would normally mark session as "awaiting 2fa"
                req.session.needs2FA = true;
                return res.json({
                    requires2FA: true,
                    user: { id: row.id, username: row.username }
                });
            }

            res.json({ user: { id: row.id, username: row.username, role: row.role } });
        });
    });
});

api.post('/auth/logout', (req, res) => {
    const domain = (process.env.DOMAIN && !process.env.DOMAIN.includes('local') && process.env.DOMAIN !== 'localhost')
        ? `.${process.env.DOMAIN}`
        : undefined;

    req.session.destroy((err) => {
        const cookieOptions = { path: '/' };
        if (domain) cookieOptions.domain = domain;
        res.clearCookie('connect.sid', cookieOptions);
        res.json({ message: "Sesión cerrada correctamente" });
    });
});

api.get('/auth/me', (req, res) => {
    if (req.session.userId && !req.session.needs2FA) {
        res.json({ user: { id: req.session.userId, username: req.session.username, role: req.session.role } });
    } else {
        res.status(401).json({ error: "Sin sesión activa o requiere 2FA" });
    }
});

// ================= ADVANCED SECURITY ENDPOINTS =================

// 2FA Setup
api.get('/auth/2fa/setup', requireAuth, async (req, res) => {
    try {
        const { secret, qrCodeUrl } = await SecurityLogic.generate2FASecret(req.session.username);
        // Store technical secret in session TEMPORARILY until verified
        req.session.tempSecret = secret;
        res.json({ qrCodeUrl });
    } catch (e) { res.status(500).json({ error: "Error al generar 2FA" }); }
});

api.post('/auth/2fa/verify', requireAuth, (req, res) => {
    const { token } = req.body;
    const secret = req.session.tempSecret;
    if (!secret || !token) return res.status(400).json({ error: "Datos incompletos" });

    if (SecurityLogic.verify2FAToken(token, secret)) {
        db.run("UPDATE users SET two_factor_secret = ?, two_factor_enabled = 1 WHERE id = ?",
            [secret, req.session.userId], (err) => {
                delete req.session.tempSecret;
                res.json({ message: "2FA activado correctamente" });
            });
    } else {
        res.status(400).json({ error: "Código incorrecto" });
    }
});

// 2FA Verification during Login
api.post('/auth/login/verify-2fa', (req, res) => {
    const { userId, token } = req.body;
    if (!req.session.needs2FA || req.session.userId !== userId) {
        return res.status(403).json({ error: "Acción no permitida" });
    }

    db.get("SELECT two_factor_secret FROM users WHERE id = ?", [userId], (err, row) => {
        if (!row || !SecurityLogic.verify2FAToken(token, row.two_factor_secret)) {
            return res.status(400).json({ error: "Código 2FA incorrecto" });
        }

        // 2FA success
        delete req.session.needs2FA;
        res.json({ user: { id: req.session.userId, username: req.session.username, role: req.session.role } });
    });
});

// Account Recovery
api.post('/auth/recovery/request', authLimiter, (req, res) => {
    const { email } = req.body;
    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
        if (!row) {
            // Security Best Practice: Don't reveal if email exists
            return res.json({ message: "Si el correo está registrado, recibirás instrucciones." });
        }

        try {
            const token = await SecurityLogic.createResetToken(row.id);
            // In production, send email here. For now, we log it.
            console.log(`[RECOVERY] Token for user ${row.id}: ${token}`);
            SecurityLogic.addNotification(row.id, 'system', { message: "Se ha solicitado un restablecimiento de contraseña." });
            res.json({ message: "Si el correo está registrado, recibirás instrucciones." });
        } catch (e) { res.status(500).json({ error: "Error interno" }); }
    });
});

api.post('/auth/recovery/reset', authLimiter, async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const resetData = await SecurityLogic.verifyResetToken(token);
        if (!resetData) return res.status(400).json({ error: "Token inválido o expirado" });

        const hash = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, resetData.user_id], (err) => {
            db.run("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [resetData.id]);
            res.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
        });
    } catch (e) { res.status(500).json({ error: "Error interno" }); }
});

// ================= MINECRAFT INTEGRATION =================

// 1. User requests a link code from the web
api.post('/minecraft/link/request', requireAuth, (req, res) => {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.run("INSERT INTO link_codes (user_id, code, expires_at) VALUES (?, ?, ?)",
        [req.session.userId, code, expiresAt], (err) => {
            if (err) return res.status(500).json({ error: "Error al generar código" });
            res.json({ code, expiresAt });
        });
});

/**
 * 2. API for the Minecraft Server Plugin
 * This endpoint should be protected by an API Key or IP whitelist in production.
 * It verifies a link code given by a player in-game.
 */
api.post('/minecraft/link/verify', (req, res) => {
    const apiKey = req.header('x-api-key') || req.body.apiKey;
    const configuredKey = process.env.MINECRAFT_API_KEY;

    if (!configuredKey || apiKey !== configuredKey) {
        return res.status(401).json({ error: "Acceso no autorizado: API Key inválida o no configurada." });
    }

    const { code, uuid, ign } = req.body;
    if (!code || !uuid || !ign) {
        return res.status(400).json({ error: "Faltan parámetros requeridos (code, uuid, ign)" });
    }

    const now = new Date().toISOString();
    db.get("SELECT user_id FROM link_codes WHERE code = ? AND expires_at > ?", [code, now], (err, row) => {
        if (!row) return res.status(404).json({ error: "Código inválido o expirado" });

        const userId = row.user_id;

        // Perform the link
        db.run("UPDATE users SET minecraft_uuid = ?, minecraft_ign = ? WHERE id = ?",
            [uuid, ign, userId], (err) => {
                if (err) return res.status(500).json({ error: "Error al vincular cuenta" });

                // Delete the used code
                db.run("DELETE FROM link_codes WHERE code = ?", [code]);

                SecurityLogic.addNotification(userId, 'system', {
                    message: `Cuenta vinculada exitosamente con el personaje: ${ign}`
                });

                res.json({ success: true, message: "Vinculación exitosa", userId });
            });
    });
});
// ================= STAFF / INTERNAL TOOLS =================

api.get('/staff/stats', requireAuth, requireStaff, (req, res) => {
    const stats = {};
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        stats.totalUsers = row.count;
        db.get("SELECT COUNT(*) as count FROM threads WHERE created_at > date('now','-1 day')", (err, row) => {
            stats.threadsToday = row.count;
            db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
                stats.totalPosts = row.count;
                res.json(stats);
            });
        });
    });
});

api.get('/staff/users', requireAuth, requireStaff, (req, res) => {
    db.all("SELECT id, username, role, minecraft_ign, last_ip, is_banned, created_at FROM users ORDER BY created_at DESC LIMIT 50", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update User (Role/Ban) - Protected against Privilege Escalation
api.put('/staff/users/:id', requireAuth, requireStaff, (req, res) => {
    const { role, is_banned } = req.body;
    const targetId = parseInt(req.params.id, 10);
    const callerId = req.session.userId;
    const callerRole = req.session.role;

    if (isNaN(targetId)) return res.status(400).json({ error: "ID de usuario inválido" });

    db.get("SELECT id, role, is_banned FROM users WHERE id = ?", [targetId], (err, targetUser) => {
        if (err || !targetUser) return res.status(404).json({ error: "Usuario no encontrado" });

        // Privilege Check: Only 'admin' can change roles or modify another admin/staff
        if (role) {
            if (callerRole !== 'admin') {
                return res.status(403).json({ error: "Solo los administradores pueden cambiar rangos de usuarios." });
            }
            const allowedRoles = ['user', 'moderator', 'staff', 'admin'];
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ error: "Rango especificado no válido." });
            }
        }

        // Non-admins cannot ban or modify admins or moderators
        if (callerRole !== 'admin' && ['admin', 'moderator', 'staff'].includes(targetUser.role)) {
            return res.status(403).json({ error: "No tienes permisos para modificar a miembros del Staff." });
        }

        // Prevent self-demotion or banning oneself
        if (callerId === targetId && is_banned) {
            return res.status(400).json({ error: "No puedes banearte a ti mismo." });
        }

        let updates = [];
        let params = [];

        if (role) { updates.push("role = ?"); params.push(role); }
        if (is_banned !== undefined) { updates.push("is_banned = ?"); params.push(is_banned ? 1 : 0); }

        if (updates.length === 0) return res.status(400).json({ error: "Nada que actualizar" });

        params.push(targetId);
        db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Log the action
            db.run("INSERT INTO audit_logs (staff_id, action, target_id, target_type, details) VALUES (?, ?, ?, ?, ?)",
                [callerId, 'update_user', targetId, 'user', JSON.stringify(req.body)]);

            res.json({ message: "Usuario actualizado" });
        });
    });
});

// Fetch Audit Logs
api.get('/staff/logs', requireAuth, requireStaff, (req, res) => {
    db.all(`
        SELECT l.*, u.username as staff_name 
        FROM audit_logs l 
        JOIN users u ON l.staff_id = u.id 
        ORDER BY l.created_at DESC LIMIT 50
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Moderation: Recent Threads to Manage
api.get('/staff/moderation/threads', requireAuth, requireStaff, (req, res) => {
    db.all("SELECT id, title, status, created_at FROM threads ORDER BY created_at DESC LIMIT 20", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Delete Thread (Strict Moderation)
api.delete('/staff/threads/:id', requireAuth, requireStaff, (req, res) => {
    const threadId = req.params.id;
    db.run("DELETE FROM threads WHERE id = ?", [threadId], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Log action
        db.run("INSERT INTO audit_logs (staff_id, action, target_id, target_type, details) VALUES (?, ?, ?, ?, ?)",
            [req.session.userId, 'delete_thread', threadId, 'thread', 'Moderator deletion']);

        res.json({ message: "Tema eliminado" });
    });
});

api.get('/notifications', requireAuth, (req, res) => {
    db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        [req.session.userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

api.post('/notifications/read', requireAuth, (req, res) => {
    db.run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.session.userId], (err) => {
        res.json({ message: "OK" });
    });
});

// ================= USER PROFILES =================

// Public Profile Data
api.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get(`
        SELECT id, username, role, avatar_url, last_login as last_activity, created_at, minecraft_ign
        FROM users WHERE id = ?
    `, [userId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    });
});

// User Created Threads
api.get('/users/:id/posts', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT t.*, c.name as category_name,
        (SELECT COUNT(*) FROM posts p WHERE p.thread_id = t.id AND p.user_id IN (SELECT id FROM users WHERE role IN ('admin', 'moderator', 'staff'))) as staff_replies
        FROM threads t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC LIMIT 20
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// User Replies
api.get('/users/:id/replies', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT p.*, t.title as thread_title
        FROM posts p
        JOIN threads t ON p.thread_id = t.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC LIMIT 20
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Endpoint de usuario actual (Real-time role & info)
// Cumple con el requerimiento de GET /api/me
api.get('/me', requireAuth, (req, res) => {
    db.get('SELECT id, username, role, avatar_url, two_factor_enabled FROM users WHERE id = ?', [req.session.userId], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(row);
    });
});

module.exports = api;
