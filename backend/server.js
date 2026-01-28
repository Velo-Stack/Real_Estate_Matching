const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible globally
global.io = io;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
