const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../OrphionMC_forum.db');

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Database connected (Shared).");
    }
});

module.exports = db;
