// In-Memory Fallback Store for Cloud Hosting Environments
let memoryMessages = [];
let memoryUsers = {};
let nextMessageId = 1;

let db = null;
let isNativeSqlite = false;

// Attempt to load better-sqlite3 locally, fallback gracefully if C compilers fail on Render
try {
  const Database = require('better-sqlite3');
  const path = require('path');
  const dbPath = path.resolve(__dirname, '../chat.db');
  db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, text TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
  `);
  isNativeSqlite = true;
  console.log("Using persistent local SQLite storage successfully.");
} catch (e) {
  console.log("Compiler tools missing (Render Environment). Falling back to JavaScript In-Memory Data Tier safely.");
}

const Message = {
  create: (username, text, callback) => {
    if (isNativeSqlite) {
      try {
        const insert = db.prepare('INSERT INTO messages (username, text) VALUES (?, ?)');
        const result = insert.run(username, text);
        const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
        return callback(null, newMessage);
      } catch (err) {
        return callback(err, null);
      }
    } else {
      // Memory execution path
      const newMessage = {
        id: nextMessageId++,
        username,
        text,
        timestamp: new Date().toISOString()
      };
      memoryMessages.push(newMessage);
      callback(null, newMessage);
    }
  },

  getAll: (callback) => {
    if (isNativeSqlite) {
      try {
        const rows = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
        callback(null, rows);
      } catch (err) {
        callback(err, null);
      }
    } else {
      callback(null, memoryMessages);
    }
  },

  // Helper auth handlers exposed directly out of data layer context
  authValidate: (username, password) => {
    if (isNativeSqlite) {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      if (!user) return { status: 'NOT_FOUND' };
      return user.password === password ? { status: 'SUCCESS', user } : { status: 'INVALID' };
    } else {
      if (!memoryUsers[username]) return { status: 'NOT_FOUND' };
      return memoryUsers[username] === password ? { status: 'SUCCESS', username } : { status: 'INVALID' };
    }
  },

  authRegister: (username, password) => {
    if (isNativeSqlite) {
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    } else {
      memoryUsers[username] = password;
    }
    return true;
  }
};

module.exports = Message;