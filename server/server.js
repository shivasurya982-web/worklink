require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
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

    // 2. Start listening
    server.listen(PORT, () => {
      console.log(`🚀 [SUCCESS]: WorkLink AI is LIVE on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ [CRITICAL ERROR]:', error.message);
    process.exit(1);
  }
};

startServer();
