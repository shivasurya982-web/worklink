require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  },
});

setupSockets(io);
app.set('socketio', io);

const startServer = async () => {
  try {
    console.log('⏳ [STARTUP]: System initializing...');

    // 1. Connect to DB
    const db = await connectDB();

    if (!db) {
        console.error('❌ [FATAL]: Database connection failed. Server will not start.');
        process.exit(1);
    }

    // 2. Start listening on 0.0.0.0 for better reachability
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [SUCCESS]: WorkLink AI is LIVE on port ${PORT}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
      console.log(`🔗 Network: http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error('❌ [CRITICAL ERROR]:', error.message);
    process.exit(1);
  }
};

startServer();
