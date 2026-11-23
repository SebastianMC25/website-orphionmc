const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcrypt');
const db = require('./core/db');

async function createAdminUser(username = 'admin', password = 'adminpassword123', email = 'admin@orphionmc.net') {
    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(
            "INSERT INTO users (username, password_hash, role, email, is_banned) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'",
            [username, hash, 'admin', email, 0],
            function (err) {
                if (err) {
                    console.error("Error creating user:", err.message);
                } else {
                    console.log(`¡Usuario Administrador creado exitosamente en MariaDB!`);
                    console.log(`Usuario: ${username}`);
                    console.log(`Contraseña: ${password}`);
                }
                setTimeout(() => db.close(() => process.exit(0)), 500);
            }
        );
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

createAdminUser();
