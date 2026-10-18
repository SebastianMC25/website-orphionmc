const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'OrphionMC_forum.db');
const db = new sqlite3.Database(DB_PATH);

const CATEGORY_ID = 2; // Discusión General

db.serialize(() => {
    // 1. Delete Votes associated with threads in this category
    db.run(`DELETE FROM thread_votes WHERE thread_id IN (SELECT id FROM threads WHERE category_id = ?)`, [CATEGORY_ID], function (err) {
        if (err) console.error("Error deleting votes:", err);
        else console.log(`Deleted ${this.changes} votes.`);
    });

    // 2. Delete Posts associated with threads in this category
    db.run(`DELETE FROM posts WHERE thread_id IN (SELECT id FROM threads WHERE category_id = ?)`, [CATEGORY_ID], function (err) {
        if (err) console.error("Error deleting posts:", err);
        else console.log(`Deleted ${this.changes} posts.`);
    });

    // 3. Delete Threads in this category
    db.run(`DELETE FROM threads WHERE category_id = ?`, [CATEGORY_ID], function (err) {
        if (err) console.error("Error deleting threads:", err);
        else console.log(`Deleted ${this.changes} threads.`);
    });
});

db.close();
