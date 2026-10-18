const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const db = require('./db');

const discordAuth = express.Router();

// Discord Config (Should be in .env)
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

/**
 * GET /auth/discord
 * Redirects the user to Discord's authorize page.
 */
discordAuth.get('/auth/discord', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state; // Store state to prevent CSRF

    const scope = encodeURIComponent('identify email');
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&state=${state}`;

    res.redirect(url);
});

/**
 * GET /auth/discord/callback
 * Handles the callback from Discord after authorization.
 */
discordAuth.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;

    // 1. Verify state (CRSF protection)
    if (!state || state !== req.session.oauthState) {
        return res.status(403).send('Estado inválido. Inténtalo de nuevo.');
    }
    delete req.session.oauthState;

    if (!code) {
        return res.status(400).send('Código no proporcionado.');
    }

    try {
        // 2. Exchange code for access token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        // 3. Fetch user info from Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const discordUser = userResponse.data;
        const { id: discord_id, username, avatar, email } = discordUser;

        // 4. Integrate with OrphionMC DB
        db.get('SELECT * FROM users WHERE discord_id = ?', [discord_id], (err, user) => {
            if (err) return res.status(500).send('Error de base de datos');

            if (user) {
                // User exists, update and login
                db.run('UPDATE users SET discord_username = ?, discord_avatar = ?, last_login = CURRENT_TIMESTAMP, last_ip = ? WHERE id = ?',
                    [username, avatar, req.ip, user.id]);

                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.fingerprint = { ip: req.ip, ua: req.get('User-Agent') };

                return res.redirect('/');
            } else {
                // User doesn't exist, register automatically
                // Best practice: Use Discord username, but check for collision
                const defaultUsername = `${username}_${discord_id.substring(0, 4)}`;
                const randomPassword = crypto.randomBytes(32).toString('hex'); // High entropy random pass

                db.run('INSERT INTO users (username, email, password_hash, discord_id, discord_username, discord_avatar, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [defaultUsername, email, randomPassword, discord_id, username, avatar, 'user'], function (err) {
                        if (err) return res.status(500).send('Error al crear usuario');

                        req.session.userId = this.lastID;
                        req.session.username = defaultUsername;
                        req.session.role = 'user';
                        req.session.fingerprint = { ip: req.ip, ua: req.get('User-Agent') };

                        return res.redirect('/');
                    });
            }
        });

    } catch (error) {
        console.error('[Discord OAuth Error]', error.response?.data || error.message);
        res.status(500).send('Error durante la autenticación con Discord.');
    }
});

module.exports = discordAuth;
