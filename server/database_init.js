require('dotenv').config();
const fs = require('fs');
const path = require('path');

const isMySQL = Boolean(process.env.DB_HOST || process.env.DB_USER || process.env.DB_TYPE === 'mysql');

if (isMySQL) {
    const mysql = require('mysql2');
    console.log('[Init] Inicializando base de datos MySQL en Bot-Hosting...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'orphionmc_forum',
        multipleStatements: true,
        charset: 'utf8mb4'
    });

    const schemaPath = path.resolve(__dirname, 'schema_mysql.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error('[Init Error] No se encontró schema_mysql.sql');
        process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    pool.query(schema, (err) => {
        if (err) {
            console.error('[Init Error] Error al ejecutar el esquema MySQL:', err.message);
        } else {
            console.log('[Init] ¡Base de datos MySQL inicializada correctamente con todas las tablas e índices!');
        }
        pool.end();
    });

} else {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, 'OrphionMC_forum.db');
    const schemaPath = path.resolve(__dirname, 'schema.sql');

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database ' + dbPath + ': ' + err.message);
        } else {
            console.log('Connected to the SQLite database.');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error running schema:', err);
                } else {
                    console.log('Database initialized successfully.');
                }
                db.close();
            });
        }
    });
}
