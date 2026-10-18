const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const crypto = require('crypto');
const db = require('./db');

const SecurityLogic = {
    // ================= 2FA (TOTP) =================

    /**
     * Generates a new TOTP secret and a QR code data URL for a user.
     */
    generate2FASecret: async (username) => {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(username, 'OrphionMC RPG', secret);
        const qrCodeUrl = await qrcode.toDataURL(otpauth);
        return { secret, qrCodeUrl };
    },

    /**
     * Verifies a TOTP token against a secret.
     */
    verify2FAToken: (token, secret) => {
        return authenticator.check(token, secret);
    },

    // ================= ACCOUNT RECOVERY =================

    /**
     * Creates a secure password reset token for a user.
     * Tokens expire in 1 hour.
     */
    createResetToken: (userId) => {
        return new Promise((resolve, reject) => {
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

            db.run(
                "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
                [userId, token, expiresAt],
                function (err) {
                    if (err) reject(err);
                    else resolve(token);
                }
            );
        });
    },

    /**
     * Verifies if a reset token is valid and not used/expired.
     */
    verifyResetToken: (token) => {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            db.get(
                "SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?",
                [token, now],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // ================= NOTIFICATIONS =================

    /**
     * Adds a notification for a user.
     */
    addNotification: (userId, type, data) => {
        db.run(
            "INSERT INTO notifications (user_id, type, data) VALUES (?, ?, ?)",
            [userId, type, JSON.stringify(data)],
            (err) => {
                if (err) console.error("[Security] Error adding notification:", err);
            }
        );
    }
};

module.exports = SecurityLogic;
