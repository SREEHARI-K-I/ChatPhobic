const db = require('../config/db');

const Message = {
  create: (username, text, callback) => {
    try {
      const insert = db.prepare('INSERT INTO messages (username, text) VALUES (?, ?)');
      const result = insert.run(username, text);

      const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
      callback(null, newMessage);
    } catch (err) {
      callback(err, null);
    }
  },

  getAll: (callback) => {
    try {
      const rows = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
      callback(null, rows);
    } catch (err) {
      callback(err, null);
    }
  }
};

module.exports = Message;