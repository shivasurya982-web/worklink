require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.io in development/initial deploy
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup WebSocket event handlers
setupSockets(io);

// Make io accessible in controllers via req.app.get('socketio')
app.set('socketio', io);

// Start server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start Listening
    server.listen(PORT, () => {
      console.log(`
      🚀 ===================================================
      ⚡ WorkLink AI Server is running on port ${PORT}
      🌍 Environment: ${process.env.NODE_ENV || 'development'}
      🔗 API URL: http://localhost:${PORT}/api
      ===================================================
      `);
    });
  } catch (error) {
    console.error(`❌ Server start error: ${error.message}`);
    process.exit(1);
  }
};

// Check if running on Vercel (Serverless)
if (process.env.VERCEL) {
  // On Vercel, we export the app and don't start the listener manually
  module.exports = server;
} else {
  // On persistent servers (Render, Railway, Local), we start the listener
  startServer();
}
