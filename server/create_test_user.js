const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'OrphionMC_forum.db'));

async function createTestUser() {
    const hash = await bcrypt.hash('password123', 10);
    db.run("INSERT INTO users (username, password_hash, role, email, is_banned) VALUES (?, ?, ?, ?, ?)",
        ['testuser', hash, 'admin', 'test@example.com', 0], (err) => {
            if (err) {
                console.error("Error creating test user:", err.message);
            } else {
                console.log("Test user created: testuser / password123");
            }
            db.close();
        });
}

createTestUser();
