const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const db = require('./core/db');

// Script administrativo para crear o actualizar usuario desde consola
async function createUser(username, password, role = 'admin', email = null) {
    if (!username || !password) {
        console.log("Uso: node create_test_user.js <usuario> <contraseña> [rol] [email]");
        process.exit(1);
    }
    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(
            "INSERT INTO users (username, password_hash, role, email, is_banned) VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)",
            [username, hash, role, email],
            function (err) {
                if (err) {
                    console.error("Error al guardar usuario:", err.message);
                } else {
                    console.log(`Usuario '${username}' con rango '${role}' guardado correctamente.`);
                }
                setTimeout(() => db.close(() => process.exit(0)), 500);
            }
        );
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length >= 2) {
    createUser(args[0], args[1], args[2] || 'admin', args[3] || null);
} else {
    console.log("Para crear o actualizar un usuario ejecuta: node create_test_user.js <usuario> <contraseña> [rol]");
    process.exit(0);
}
