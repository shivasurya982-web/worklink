require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup WebSocket event handlers
setupSockets(io);

// Make io accessible in controllers via req.app.get('socketio')
app.set('socketio', io);

// Start server
server.listen(PORT, () => {
  console.log(`
  🚀 ===================================================
  ⚡ WorkLink AI Server is running on port ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 API URL: http://localhost:${PORT}/api
  ===================================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Keep server running in development
});
