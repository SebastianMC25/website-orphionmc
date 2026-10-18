const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'OrphionMC_forum.db');
const db = new sqlite3.Database(dbPath);

const migrations = [
    // Users table updates
    "ALTER TABLE users ADD COLUMN email TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "ALTER TABLE users ADD COLUMN two_factor_secret TEXT",
    "ALTER TABLE users ADD COLUMN two_factor_enabled INTEGER DEFAULT 0",
    "ALTER TABLE users ADD COLUMN minecraft_uuid TEXT",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mc_uuid ON users(minecraft_uuid)",
    "ALTER TABLE users ADD COLUMN last_login DATETIME",
    "ALTER TABLE users ADD COLUMN last_ip TEXT",

    // New tables
    "CREATE TABLE IF NOT EXISTS password_reset_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT UNIQUE NOT NULL, expires_at DATETIME NOT NULL, used INTEGER DEFAULT 0, FOREIGN KEY (user_id) REFERENCES users(id))",
    "CREATE TABLE IF NOT EXISTS link_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, code TEXT UNIQUE NOT NULL, expires_at DATETIME NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))",
    "CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, data TEXT, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
    "ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0",
    "CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, staff_id INTEGER NOT NULL, action TEXT NOT NULL, target_id INTEGER, target_type TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (staff_id) REFERENCES users(id))"
];

db.serialize(() => {
    console.log("Starting migrations...");
    migrations.forEach(sql => {
        db.run(sql, (err) => {
            if (err) {
                if (err.message.includes("duplicate column name") || err.message.includes("already exists")) {
                    console.log("Skipping (already exists): " + sql.substring(0, 50) + "...");
                } else {
                    console.error("Error running migration [" + sql.substring(0, 50) + "...]: ", err.message);
                }
            } else {
                console.log("Success: " + sql.substring(0, 50) + "...");
            }
        });
    });
});

db.close(() => {
    console.log("Migrations finished.");
});
