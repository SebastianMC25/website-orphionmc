const path = require('path');
const fs = require('fs');

// Cargar variables de entorno si aún no están cargadas
const envServer = path.resolve(__dirname, '../.env');
const envRoot = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envServer)) {
    require('dotenv').config({ path: envServer });
} else if (fs.existsSync(envRoot)) {
    require('dotenv').config({ path: envRoot });
}

// Detectar si se debe usar MySQL (Bot-Hosting) o SQLite (fallback local)
const isMySQL = Boolean(process.env.DB_HOST || process.env.DB_USER || process.env.DB_TYPE === 'mysql');

let db;

if (isMySQL) {
    const mysql = require('mysql2');

    console.log('[Database] Modo MySQL / MariaDB activado para Bot-Hosting.');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'orphionmc_forum',
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        charset: 'utf8mb4'
    });

    // Helper para normalizar sintaxis entre SQLite y MySQL
    function normalizeQuery(sql) {
        if (!sql || typeof sql !== 'string') return sql;
        let converted = sql;
        // date('now', '-1 day') -> DATE_SUB(NOW(), INTERVAL 1 DAY)
        converted = converted.replace(/date\s*\(\s*['"]now['"]\s*,\s*['"]-1 day['"]\s*\)/gi, "DATE_SUB(NOW(), INTERVAL 1 DAY)");
        // ON CONFLICT(...) DO UPDATE -> ON DUPLICATE KEY UPDATE
        converted = converted.replace(/ON\s+CONFLICT\s*\([^)]+\)\s*DO\s+UPDATE\s+SET\s+vote_value\s*=\s*excluded\.vote_value/gi, "ON DUPLICATE KEY UPDATE vote_value = VALUES(vote_value)");
        return converted;
    }

    // Inicializar tablas automáticamente al conectar
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('[Database Error] Error conectando a MySQL en Bot-Hosting:', err.message);
            console.warn('[Database] Verifica que DB_HOST, DB_USER, DB_PASSWORD y DB_NAME estén bien configurados en server/.env');
        } else {
            console.log('[Database] Conexión establecida con la base de datos MySQL de Bot-Hosting.');
            connection.release();

            const schemaFile = path.resolve(__dirname, '../schema_mysql.sql');
            if (fs.existsSync(schemaFile)) {
                const schemaSql = fs.readFileSync(schemaFile, 'utf8');
                const statements = schemaSql
                    .split(/;\s*[\r\n]+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));

                statements.forEach(stmt => {
                    pool.query(stmt, (qErr) => {
                        if (qErr && !qErr.message.includes('already exists') && !qErr.message.includes('Duplicate key')) {
                            // Ignorar si ya existen índices o tablas
                        }
                    });
                });
            }
        }
    });

    db = {
        isMySQL: true,
        pool: pool,
        query: (sql, params, cb) => pool.query(normalizeQuery(sql), params, cb),

        all: (sql, params, cb) => {
            if (typeof params === 'function') { cb = params; params = []; }
            pool.query(normalizeQuery(sql), params || [], (err, rows) => {
                if (cb) cb(err, rows || []);
            });
        },

        get: (sql, params, cb) => {
            if (typeof params === 'function') { cb = params; params = []; }
            pool.query(normalizeQuery(sql), params || [], (err, rows) => {
                if (cb) cb(err, rows && rows.length > 0 ? rows[0] : null);
            });
        },

        run: function (sql, params, cb) {
            if (typeof params === 'function') { cb = params; params = []; }
            pool.query(normalizeQuery(sql), params || [], function (err, result) {
                const ctx = {
                    lastID: result ? result.insertId : null,
                    changes: result ? result.affectedRows : 0
                };
                if (cb) cb.call(ctx, err);
            });
        },

        serialize: (fn) => {
            if (typeof fn === 'function') fn();
        },

        close: (cb) => {
            pool.end(cb);
        }
    };

} else {
    // SQLite Fallback (para desarrollo local sin MySQL)
    const sqlite3 = require('sqlite3').verbose();
    const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../OrphionMC_forum.db');

    const sqliteDb = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error("[Database Error] Error conectando a SQLite:", err.message);
        } else {
            console.log("[Database] Conexión establecida con SQLite (Modo Local).");
            sqliteDb.serialize(() => {
                sqliteDb.run("PRAGMA journal_mode = WAL;");
                sqliteDb.run("PRAGMA foreign_keys = ON;");
                sqliteDb.run("PRAGMA busy_timeout = 5000;");
                sqliteDb.run("PRAGMA synchronous = NORMAL;");

                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category_id);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_threads_created ON threads(created_at);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_users_minecraft ON users(minecraft_uuid);");
                sqliteDb.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_staff ON audit_logs(staff_id);");
            });
        }
    });

    db = sqliteDb;
}

module.exports = db;
