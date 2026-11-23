const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('./db');

const discordAuth = express.Router();

const OAUTH_SECRET = process.env.SESSION_SECRET || 'OrphionMC_Discord_OAuth_Secret_Key';

/**
 * Genera un token state firmado criptográficamente para proteger contra CSRF
 * sin depender exclusivamente de cookies que puedan ser bloqueadas por el navegador.
 */
function generateSignedState() {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(8).toString('hex');
    const payload = `${timestamp}:${nonce}`;
    const sig = crypto.createHmac('sha256', OAUTH_SECRET).update(payload).digest('hex');
    return `${payload}:${sig}`;
}

/**
 * Verifica la firma HMAC del token state (válido por 30 minutos)
 */
function verifySignedState(state) {
    if (!state || typeof state !== 'string') return false;
    const parts = state.split(':');
    if (parts.length !== 3) return false;
    const [timestamp, nonce, sig] = parts;
    const payload = `${timestamp}:${nonce}`;
    const expected = crypto.createHmac('sha256', OAUTH_SECRET).update(payload).digest('hex');
    if (sig !== expected) return false;
    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age < 0 || age > 30 * 60 * 1000) return false;
    return true;
}

/**
 * Obtiene la URL de redirección configurada o fallback según el host
 */
function getRedirectUri(req) {
    if (process.env.DISCORD_REDIRECT_URI) {
        return process.env.DISCORD_REDIRECT_URI;
    }
    const host = req.get('host') || 'orphionmc.net';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || (!isLocal && !host.includes(':'));
    const protocol = isHttps ? 'https' : 'http';
    return `${protocol}://${host}/api/auth/discord/callback`;
}

/**
 * Determina el destino final del usuario tras autenticarse con éxito
 */
function getPostLoginRedirect(req) {
    if (req.session && req.session.returnTo && (req.session.returnTo.startsWith('/') || req.session.returnTo.startsWith('http'))) {
        const dest = req.session.returnTo;
        delete req.session.returnTo;
        return dest;
    }

    const host = req.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

    if (isLocal) {
        return `http://${host}/forum.html`;
    }

    return 'https://orphionmc.net/forum.html';
}

/**
 * Redirecciona al frontend adjuntando los parámetros de usuario para sincronización
 */
function redirectWithAuth(res, baseUrl, user) {
    try {
        const u = new URL(baseUrl);
        u.searchParams.set('discord_login', '1');
        u.searchParams.set('uid', user.id);
        u.searchParams.set('uname', user.username);
        u.searchParams.set('urole', user.role || 'user');
        return res.redirect(u.toString());
    } catch (e) {
        return res.redirect(baseUrl);
    }
}

/**
 * GET /auth/discord
 * Redirige al usuario al consentimiento de OAuth2 de Discord
 */
discordAuth.get('/auth/discord', (req, res) => {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = getRedirectUri(req);

    // Validación amigable de credenciales
    if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID === 'tu_client_id_aqui' || CLIENT_ID === 'your_client_id_here') {
        return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Discord OAuth2 no configurado - OrphionMC</title>
                <style>
                    body { background: #0f0f0f; color: #eee; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
                    .card { background: #1a1a1a; border: 1px solid #333; border-top: 4px solid #5865F2; padding: 40px; border-radius: 8px; max-width: 520px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                    h2 { color: #5865F2; margin-top: 0; }
                    code { background: #222; padding: 3px 6px; border-radius: 4px; color: #d4af37; font-size: 0.9em; }
                    a { color: #5865F2; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    .btn-back { display: inline-block; margin-top: 25px; padding: 10px 20px; background: #333; color: #fff; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Discord OAuth2 Pendiente de Configuración</h2>
                    <p>Faltan las credenciales de tu aplicación en el archivo <code>server/.env</code>:</p>
                    <p style="text-align: left; background: #111; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 0.85em;">
                        DISCORD_CLIENT_ID=tu_client_id<br>
                        DISCORD_CLIENT_SECRET=tu_client_secret<br>
                        DISCORD_REDIRECT_URI=${redirectUri}
                    </p>
                    <p>Regístralas en el <a href="https://discord.com/developers/applications" target="_blank" rel="noopener">Discord Developer Portal</a>.</p>
                    <a href="javascript:history.back()" class="btn-back">← Volver</a>
                </div>
            </body>
            </html>
        `);
    }

    const state = generateSignedState();
    if (req.session) {
        req.session.oauthState = state;
    }

    // Guardar referencia de origen si está disponible
    const referer = req.get('referer');
    if (referer && !referer.includes('discord.com')) {
        if (req.session) req.session.returnTo = referer;
    }

    const scope = encodeURIComponent('identify email');
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

    if (req.session) {
        req.session.save(() => {
            res.redirect(url);
        });
    } else {
        res.redirect(url);
    }
});

/**
 * GET /auth/discord/callback
 * Procesa el callback de autorización de Discord
 */
discordAuth.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = getRedirectUri(req);
    const postLoginUrl = getPostLoginRedirect(req);

    // 1. Verificación de State contra CSRF (Session match OR HMAC cryptographically valid)
    const sessionMatch = req.session && req.session.oauthState && req.session.oauthState === state;
    const hmacValid = verifySignedState(state);

    if (!sessionMatch && !hmacValid) {
        return res.status(403).send(`
            <div style="background:#111; color:#fff; font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:#ff5555;">Estado de seguridad inválido o expirado</h2>
                <p>Por motivos de seguridad, la solicitud fue rechazada. Intenta iniciar sesión de nuevo.</p>
                <a href="https://orphionmc.net/login.html" style="color:#d4af37;">← Volver al login</a>
            </div>
        `);
    }
    if (req.session) {
        delete req.session.oauthState;
    }

    if (!code) {
        return res.status(400).send('Código de autorización no proporcionado por Discord.');
    }

    try {
        // 2. Canjear código por Access Token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        // 3. Obtener información de usuario de Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const discordUser = userResponse.data;
        const { id: discord_id, username, avatar, email } = discordUser;

        // Construir URL oficial de avatar CDN de Discord
        const avatarUrl = avatar
            ? `https://cdn.discordapp.com/avatars/${discord_id}/${avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${(BigInt(discord_id) >> 22n) % 6n}.png`;

        // 4. Integrar con la Base de Datos (Búsqueda por discord_id o por email para vincular cuentas existentes)
        const searchQuery = 'SELECT * FROM users WHERE discord_id = ? OR (email IS NOT NULL AND email != "" AND email = ?)';
        db.get(searchQuery, [discord_id, email || ''], async (err, user) => {
            if (err) {
                console.error('[Discord DB Error]', err);
                return res.status(500).send('Error interno de base de datos.');
            }

            if (user) {
                // El usuario ya existe -> Vincula y actualiza datos de Discord
                db.run(
                    'UPDATE users SET discord_id = ?, discord_username = ?, discord_avatar = ?, avatar_url = COALESCE(avatar_url, ?), last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?',
                    [discord_id, username, avatar, avatarUrl, req.ip, user.id]
                );

                const saveSessionAndRedirect = () => {
                    req.session.userId = user.id;
                    req.session.username = user.username;
                    req.session.role = user.role;
                    req.session.fingerprint = { ip: req.ip, ua: req.get('User-Agent') };
                    req.session.save(() => {
                        return redirectWithAuth(res, postLoginUrl, user);
                    });
                };

                if (req.session.regenerate) {
                    req.session.regenerate((regErr) => {
                        saveSessionAndRedirect();
                    });
                } else {
                    saveSessionAndRedirect();
                }
            } else {
                // Usuario nuevo -> Registro automático con username seguro y contraseña cifrada
                let cleanBase = (username || 'user').replace(/[^a-zA-Z0-9_]/g, '').substring(0, 15);
                if (cleanBase.length < 3) cleanBase = 'User';
                const defaultUsername = `${cleanBase}_${discord_id.substring(discord_id.length - 4)}`;

                const randomPassword = crypto.randomBytes(32).toString('hex');
                const passwordHash = await bcrypt.hash(randomPassword, 10);

                db.run(
                    'INSERT INTO users (username, email, password_hash, discord_id, discord_username, discord_avatar, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [defaultUsername, email || null, passwordHash, discord_id, username, avatar, avatarUrl, 'user'],
                    function (insertErr) {
                        if (insertErr) {
                            console.error('[Discord User Create Error]', insertErr);
                            return res.status(500).send('Error al registrar usuario de Discord.');
                        }

                        const newUserId = this.lastID;
                        const newUser = { id: newUserId, username: defaultUsername, role: 'user' };

                        const saveSessionAndRedirect = () => {
                            req.session.userId = newUserId;
                            req.session.username = defaultUsername;
                            req.session.role = 'user';
                            req.session.fingerprint = { ip: req.ip, ua: req.get('User-Agent') };
                            req.session.save(() => {
                                return redirectWithAuth(res, postLoginUrl, newUser);
                            });
                        };

                        if (req.session.regenerate) {
                            req.session.regenerate((regErr) => {
                                saveSessionAndRedirect();
                            });
                        } else {
                            saveSessionAndRedirect();
                        }
                    }
                );
            }
        });

    } catch (error) {
        console.error('[Discord OAuth Error]', error.response?.data || error.message);
        res.status(500).send(`
            <div style="background:#111; color:#fff; font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:#ff5555;">Error durante la autenticación con Discord</h2>
                <p>Verifica que el Client Secret y Redirect URI coincidan en el portal de Discord Developers.</p>
                <a href="https://orphionmc.net/login.html" style="color:#d4af37;">← Volver al login</a>
            </div>
        `);
    }
});

module.exports = discordAuth;
