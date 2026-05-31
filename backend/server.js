const dotenv = require('dotenv');

// Load environment variables before anything else
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const socketHandler = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  // Create HTTP server from Express app
  const server = http.createServer(app);

  // Create Socket.IO server with CORS config
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Register socket event handlers
  socketHandler(io);

  // Start listening
  server.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
    );
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });
});
