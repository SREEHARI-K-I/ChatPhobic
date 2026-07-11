const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');
const Message = require('./models/messageModel');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with dynamic CORS configuration matching production or local development
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ==========================================
// 1. FRONTEND STATIC ASSET HOSTING MAPPING
// ==========================================
// Serves the compiled production React UI files directly out of the server runtime path
app.use(express.static(path.join(__dirname, 'dist')));

// ==========================================
// 2. REST API ROUTING
// ==========================================
app.use('/api', chatRoutes);

// ==========================================
// 3. SOCKET.IO EVENT ARCHITECTURE
// ==========================================
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user broadcasts a message via socket
  socket.on('send_message', (data) => {
    const { username, text } = data;
    
    // Save to DB so it persists on page refresh
    Message.create(username, text, (err, savedMessage) => {
      if (!err && savedMessage) {
        // Broadcast the real-time payload to EVERY connected user instantly
        io.emit('receive_message', savedMessage);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ==========================================
// 4. WILDCARD FALLBACK FOR SINGLE PAGE APP (SPA)
// ==========================================
// Directs any web browser page routing directly into the React SPA loader layer
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ==========================================
// 5. BOOTSTRAP PROCESS LISTENER
// ==========================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running smoothly on port ${PORT}`);
});