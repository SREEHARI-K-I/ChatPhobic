const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/auth/register', chatController.registerUser);
router.post('/auth/login', chatController.loginUser);
router.get('/messages', chatController.getChatHistory);

module.exports = router;