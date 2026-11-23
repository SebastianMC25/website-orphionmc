const session = require('express-session');
const db = require('./db');

/**
 * Tienda de sesiones persistente para MariaDB / MySQL
 * Permite que las sesiones no se borren cuando el servidor de Node se reinicie en Bot-Hosting
 */
class MySQLSessionStore extends session.Store {
    constructor() {
        super();
        this.db = db;
    }

    get(sid, callback) {
        const now = Math.floor(Date.now() / 1000);
        this.db.get('SELECT data FROM sessions WHERE session_id = ? AND expires > ?', [sid, now], (err, row) => {
            if (err) return callback(err);
            if (!row || !row.data) return callback(null, null);
            try {
                const sessionData = JSON.parse(row.data);
                return callback(null, sessionData);
            } catch (e) {
                return callback(e);
            }
        });
    }

    set(sid, sessionData, callback) {
        let maxAge = 30 * 24 * 60 * 60; // 30 días
        if (sessionData && sessionData.cookie && sessionData.cookie.maxAge) {
            maxAge = Math.floor(sessionData.cookie.maxAge / 1000);
        }
        const expires = Math.floor(Date.now() / 1000) + maxAge;
        const dataStr = JSON.stringify(sessionData);

        this.db.run(
            'INSERT INTO sessions (session_id, expires, data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)',
            [sid, expires, dataStr],
            (err) => {
                if (callback) callback(err);
            }
        );
    }

    destroy(sid, callback) {
        this.db.run('DELETE FROM sessions WHERE session_id = ?', [sid], (err) => {
            if (callback) callback(err);
        });
    }

    touch(sid, sessionData, callback) {
        let maxAge = 30 * 24 * 60 * 60;
        if (sessionData && sessionData.cookie && sessionData.cookie.maxAge) {
            maxAge = Math.floor(sessionData.cookie.maxAge / 1000);
        }
        const expires = Math.floor(Date.now() / 1000) + maxAge;
        this.db.run('UPDATE sessions SET expires = ? WHERE session_id = ?', [expires, sid], (err) => {
            if (callback) callback(err);
        });
    }
}

module.exports = MySQLSessionStore;
