const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'OrphionMC_forum.db');
const db = new sqlite3.Database(dbPath);

console.log("--- Starting Migration: Discord Integration ---");

db.serialize(() => {
    // Add discord_id (First add column, then unique index)
    db.run("ALTER TABLE users ADD COLUMN discord_id TEXT", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("[Info] Column discord_id already exists.");
            } else {
                console.error("[Error] discord_id column:", err.message);
            }
        } else {
            console.log("[Success] Added discord_id column.");
            // Create unique index
            db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)");
            console.log("[Success] Created unique index for discord_id.");
        }
    });

    // Add discord_username
    db.run("ALTER TABLE users ADD COLUMN discord_username TEXT", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("[Info] Column discord_username already exists.");
            } else {
                console.error("[Error] discord_username:", err.message);
            }
        } else {
            console.log("[Success] Added discord_username column.");
        }
    });

    // Add discord_avatar
    db.run("ALTER TABLE users ADD COLUMN discord_avatar TEXT", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("[Info] Column discord_avatar already exists.");
            } else {
                console.error("[Error] discord_avatar:", err.message);
            }
        } else {
            console.log("[Success] Added discord_avatar column.");
        }
    });
});

db.close((err) => {
    if (err) console.error(err.message);
    else console.log("--- Migration Complete ---");
});
