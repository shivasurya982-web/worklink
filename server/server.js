require('dotenv').config();
const http = require('http');
const { execSync } = require('child_process');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Automatically clear any zombie process locking port 5000 before starting
if (process.platform === 'win32') {
  try {
    execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`, { stdio: 'ignore' });
  } catch (e) {
    // Ignore
  }
}

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
    await connectDB();

    // 2. Start HTTP Server cleanly
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [SUCCESS]: Worklyn AI Server is LIVE on port ${PORT}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ [CRITICAL ERROR]:', error.message);
  }
};

startServer();
