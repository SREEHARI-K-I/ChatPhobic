const db = require('../config/db');
const Message = require('../models/messageModel');

exports.loginOrRegister = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const trimmedUser = username.trim();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(trimmedUser);

    if (user) {
      if (user.password === password) {
        return res.json({ success: true, username: user.username });
      } else {
        return res.status(401).json({ error: 'Invalid password for this user.' });
      }
    } else {
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(trimmedUser, password);
      return res.status(201).json({ success: true, username: trimmedUser });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Authentication internal error.' });
  }
};

// (Keep your getChatHistory function exactly as it was below)
exports.getChatHistory = (req, res) => {
  Message.getAll((err, messages) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    res.json(messages);
  });
};