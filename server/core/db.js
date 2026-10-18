const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../OrphionMC_forum.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("[Database Error] Error conectando a SQLite:", err.message);
    } else {
        console.log("[Database] Conexión establecida con SQLite.");
        // Optimizaciones técnicas para producción y alta concurrencia:
        db.serialize(() => {
            // 1. WAL Mode: Permite lecturas y escrituras simultáneas sin bloquear la base de datos
            db.run("PRAGMA journal_mode = WAL;");
            // 2. Foreign Keys: Habilita integridad referencial y borrado en cascada (ON DELETE CASCADE)
            db.run("PRAGMA foreign_keys = ON;");
            // 3. Busy Timeout: Espera hasta 5000ms en lugar de arrojar SQLITE_BUSY de inmediato
            db.run("PRAGMA busy_timeout = 5000;");
            // 4. Synchronous Normal: Rendimiento óptimo en disco preservando integridad en modo WAL
            db.run("PRAGMA synchronous = NORMAL;");

            // 5. Índices de alto rendimiento para consultas concurrentes
            db.run("CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category_id);");
            db.run("CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);");
            db.run("CREATE INDEX IF NOT EXISTS idx_threads_created ON threads(created_at);");
            db.run("CREATE INDEX IF NOT EXISTS idx_posts_thread ON posts(thread_id);");
            db.run("CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);");
            db.run("CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);");
            db.run("CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id);");
            db.run("CREATE INDEX IF NOT EXISTS idx_users_minecraft ON users(minecraft_uuid);");
            db.run("CREATE INDEX IF NOT EXISTS idx_audit_logs_staff ON audit_logs(staff_id);");
        });
    }
});

module.exports = db;
