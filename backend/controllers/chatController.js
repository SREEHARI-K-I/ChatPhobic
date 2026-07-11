const db = require('../config/db');
const Message = require('../models/messageModel');

// 1. Explicit Registration Flow (Sign Up)
exports.registerUser = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const trimmedUser = username.trim();

  // Check if username is already taken
  db.get(`SELECT * FROM users WHERE username = ?`, [trimmedUser], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database verification failure.' });
    if (user) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Insert new user
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [trimmedUser, password], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to create user account.' });
      return res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
    });
  });
};

// 2. Strict Login Flow (Log In)
exports.loginUser = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username.trim()], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database lookup failure.' });
    
    // If user does not exist
    if (!user) {
      return res.status(401).json({ error: 'Account does not exist. Please sign up first.' });
    }

    // Validate password match
    if (user.password === password) {
      return res.json({ success: true, username: user.username });
    } else {
      return res.status(401).json({ error: 'Incorrect password. Try again.' });
    }
  });
};

exports.getChatHistory = (req, res) => {
  Message.getAll((err, messages) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    res.json(messages);
  });
};