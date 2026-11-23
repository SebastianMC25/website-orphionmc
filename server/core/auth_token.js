const crypto = require('crypto');

const TOKEN_SECRET = process.env.SESSION_SECRET || 'OrphionMC_auth_token_secret_key_2026';

/**
 * Crea un token JWT-like firmado con HMAC SHA-256
 */
function createAuthToken(user) {
    if (!user || !user.id) return null;
    const payload = Buffer.from(JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role || 'user',
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 días
    })).toString('base64url');
    const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

/**
 * Verifica la firma y expiración del token
 */
function verifyAuthToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    if (sig !== expected) return null;
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (data.exp && Date.now() > data.exp) return null;
        return data;
    } catch (e) {
        return null;
    }
}

module.exports = {
    createAuthToken,
    verifyAuthToken
};
