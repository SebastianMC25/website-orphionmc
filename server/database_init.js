const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'OrphionMC_forum.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        init();
    }
});

function init() {
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema by semicolon to execute multiple statements if needed, 
    // but sqlite3's exec can handle multiple statements usually.
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error running schema:', err);
        } else {
            console.log('Database initialized successfully.');
        }
    });
}
