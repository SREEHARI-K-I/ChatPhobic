const Message = require('../models/messageModel');

exports.loginOrRegister = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const trimmedUser = username.trim();

  try {
    const authResult = Message.authValidate(trimmedUser, password);

    if (authResult.status === 'SUCCESS') {
      return res.json({ success: true, username: trimmedUser });
    } else if (authResult.status === 'INVALID') {
      return res.status(401).json({ error: 'Invalid password for this user.' });
    } else {
      // Automatically register new account
      Message.authRegister(trimmedUser, password);
      return res.status(201).json({ success: true, username: trimmedUser });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Authentication processing error.' });
  }
};

exports.getChatHistory = (req, res) => {
  Message.getAll((err, messages) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    res.json(messages);
  });
};