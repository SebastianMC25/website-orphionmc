const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/**
 * OrphionMC Automated & Atomic Backup System
 * Uses SQLite VACUUM INTO for zero-downtime, fully consistent WAL backups.
 */

const BACKUP_DIR = path.resolve(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const DB_FILES = [
    { name: 'OrphionMC_forum.db', path: path.resolve(__dirname, 'OrphionMC_forum.db') },
    { name: 'sessions.db', path: path.resolve(__dirname, 'sessions.db') }
];

async function runBackup() {
    console.log(`[Backup] Iniciando respaldo atómico: ${new Date().toISOString()}`);

    for (const dbInfo of DB_FILES) {
        if (!fs.existsSync(dbInfo.path)) {
            console.warn(`[Backup] Omitido: ${dbInfo.name} no existe aún.`);
            continue;
        }

        const destBak = path.resolve(BACKUP_DIR, `${dbInfo.name}.${timestamp}.bak`);

        await new Promise((resolve) => {
            const db = new sqlite3.Database(dbInfo.path, sqlite3.OPEN_READONLY, (openErr) => {
                if (openErr) {
                    console.error(`[Backup Error] No se pudo abrir ${dbInfo.name}:`, openErr.message);
                    return resolve();
                }

                // VACUUM INTO genera una copia completa, compacta e incluye los cambios en WAL
                db.run("VACUUM INTO ?", [destBak], (vacErr) => {
                    db.close();
                    if (vacErr) {
                        // Fallback a copia de archivo regular si VACUUM INTO no es compatible
                        try {
                            fs.copyFileSync(dbInfo.path, destBak);
                            console.log(`[Backup Fallback] Copiado regular: ${dbInfo.name} -> ${path.basename(destBak)}`);
                        } catch (copyErr) {
                            console.error(`[Backup Error] Falló respaldo de ${dbInfo.name}:`, copyErr.message);
                        }
                    } else {
                        console.log(`[Backup Exitoso] Respaldo atómico: ${dbInfo.name} -> ${path.basename(destBak)}`);
                    }
                    resolve();
                });
            });
        });
    }

    // Política de retención: Eliminar respaldos mayores a 7 días
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    try {
        fs.readdirSync(BACKUP_DIR).forEach((file) => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filePath);
            if (Date.now() - stats.mtimeMs > SEVEN_DAYS_MS) {
                fs.unlinkSync(filePath);
                console.log(`[Backup Limpieza] Eliminado respaldo antiguo: ${file}`);
            }
        });
    } catch (e) {
        console.error("[Backup Error] Error en limpieza de respaldos:", e.message);
    }
}

if (require.main === module) {
    runBackup();
}

module.exports = { runBackup };

