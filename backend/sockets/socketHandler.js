/**
 * Socket.IO event handler
 * Sets up all real-time event listeners for chat and notifications
 *
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their own room (named by userId) for direct notifications
    socket.on('setup', (userId) => {
      socket.join(userId);
      socket.emit('connected');
      console.log(`User ${userId} joined their personal room`);
    });

    // User joins a specific chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
    });

    // New message sent — broadcast to the chat room (except the sender)
    socket.on('new-message', (data) => {
      const { chatId, message } = data;

      if (!chatId) return;

      socket.to(chatId).emit('message-received', message);
    });

    // Typing indicator — broadcast to chat room
    socket.on('typing', (chatId) => {
      socket.to(chatId).emit('typing', chatId);
    });

    // Stop typing indicator — broadcast to chat room
    socket.on('stop-typing', (chatId) => {
      socket.to(chatId).emit('stop-typing', chatId);
    });

    // New notification — send to the target user's personal room
    socket.on('new-notification', (data) => {
      const { userId, notification } = data;

      if (!userId) return;

      socket.to(userId).emit('notification', notification);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
