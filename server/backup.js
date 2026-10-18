const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * OrphionMC Automated Backup System
 * Copies .db files to a backup directory with timestamps.
 */

const DB_FILES = ['OrphionMC_forum.db', 'sessions.db'];
const BACKUP_DIR = path.resolve(__dirname, 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

DB_FILES.forEach(file => {
    const src = path.resolve(__dirname, file);
    const dest = path.resolve(BACKUP_DIR, `${file}.${timestamp}.bak`);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`[Backup] Exitoso: ${file} -> ${path.basename(dest)}`);
    } else {
        console.warn(`[Backup] Error: Archivo ${file} no encontrado.`);
    }
});

// Retention Policy: Delete backups older than 7 days
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
fs.readdirSync(BACKUP_DIR).forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    if (Date.now() - stats.mtimeMs > SEVEN_DAYS_MS) {
        fs.unlinkSync(filePath);
        console.log(`[Backup] Eliminado por antigüedad: ${file}`);
    }
});
