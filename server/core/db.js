const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../OrphionMC_forum.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("[Database Error] Error conectando a SQLite:", err.message);
    } else {
        console.log("[Database] Conexión establecida con SQLite.");
        // Optimizaciones técnicas para producción y alta concurrencia:
        // 1. WAL Mode: Permite lecturas y escrituras simultáneas sin bloquear la base de datos
        db.run("PRAGMA journal_mode = WAL;");
        // 2. Foreign Keys: Habilita integridad referencial y borrado en cascada (ON DELETE CASCADE)
        db.run("PRAGMA foreign_keys = ON;");
        // 3. Busy Timeout: Espera hasta 5000ms en lugar de arrojar SQLITE_BUSY de inmediato
        db.run("PRAGMA busy_timeout = 5000;");
        // 4. Synchronous Normal: Rendimiento óptimo en disco preservando integridad en modo WAL
        db.run("PRAGMA synchronous = NORMAL;");
    }
});

module.exports = db;
