const db = require('../config/db');

const Message = {
  create: (username, text, callback) => {
    const query = `INSERT INTO messages (username, text) VALUES (?, ?)`;
    db.run(query, [username, text], function (err) {
      if (err) return callback(err);
      // Fetch the newly created message to get the default timestamp
      db.get(`SELECT * FROM messages WHERE id = ?`, [this.lastID], (err, row) => {
        callback(err, row);
      });
    });
  },

  getAll: (callback) => {
    const query = `SELECT * FROM messages ORDER BY timestamp ASC`;
    db.all(query, [], (err, rows) => {
      callback(err, rows);
    });
  }
};

module.exports = Message;