const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../chat.db');

// Initializes the SQLite connection synchronously
const db = new Database(dbPath, { verbose: console.log });

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;