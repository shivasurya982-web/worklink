const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const setupSockets = (io) => {
  // Store connected users: userId -> socketId
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User authentication / Join personal room
    socket.on('authenticate', ({ userId, role }) => {
      if (userId) {
        socket.userId = userId;
        socket.userRole = role;
        onlineUsers.set(userId.toString(), socket.id);
        socket.join(`user:${userId}`);
        console.log(`👤 User authenticated: ${userId} (${role})`);

        // Broadcast online status to relevant clients
        io.emit('user_online', { userId });
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`💬 Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    // Handle real-time messaging
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, senderModel, content, type, image, location } = data;

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          senderModel,
          content: content || '',
          type: type || 'text',
          image: image || '',
          location: location || null,
        });

        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content || (type === 'image' ? '📷 Image' : 'Message'),
          lastMessageAt: new Date(),
        });

        // Create notification for recipient
        const conversation = await Conversation.findById(conversationId);
        const recipientObj = conversation.participants.find(
          (p) => p.user.toString() !== senderId.toString()
        );

        if (recipientObj) {
          // Check if recipient is online and in the conversation room
          // (Actually, creating a notification is safer even if they are online)
          await Notification.create({
            recipient: recipientObj.user,
            recipientModel: recipientObj.model,
            type: 'chat',
            title: `New message`,
            message: content || (type === 'image' ? '📷 Sent an image' : 'Sent a message'),
            link: recipientObj.model === 'Customer' ? '/customer/messages' : '/worker/messages',
            data: { conversationId, senderId },
          });

          // Emit notification via socket to recipient's personal room
          io.to(`user:${recipientObj.user}`).emit('notification', {
            title: `New message`,
            message: content || 'Sent a message',
            type: 'chat',
            data: { conversationId }
          });
        }

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', populatedMessage);
      } catch (error) {
        console.error('Socket message error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle read receipts
    socket.on('mark_read', async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, isRead: false },
          { isRead: true, readAt: new Date() }
        );

        // Also mark related notifications as read
        await Notification.updateMany(
          {
            recipient: userId,
            type: 'chat',
            isRead: false,
            $or: [
              { 'data.conversationId': conversationId },
              { 'data.conversationId': conversationId.toString() }
            ]
          },
          { isRead: true, readAt: new Date() }
        );

        // Notify client to refresh notification state
        io.to(`user:${userId}`).emit('refresh_notifications');

        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: userId,
        });
      } catch (error) {
        console.error('Socket mark_read error:', error.message);
      }
    });

    // Manually clear all chat notifications for a specific conversation
    socket.on('clear_notifications', async ({ conversationId, userId }) => {
      try {
        await Notification.updateMany(
          {
            recipient: userId,
            type: 'chat',
            isRead: false,
            $or: [
              { 'data.conversationId': conversationId },
              { 'data.conversationId': conversationId.toString() }
            ]
          },
          { isRead: true, readAt: new Date() }
        );
        // Notify client to refresh notification state
        io.to(`user:${userId}`).emit('refresh_notifications');
      } catch (error) {
        console.error('Socket clear_notifications error:', error.message);
      }
    });

    // Clear ALL chat notifications for the user
    socket.on('clear_all_chat_notifications', async ({ userId }) => {
      try {
        await Notification.updateMany(
          {
            recipient: userId,
            type: 'chat',
            isRead: false
          },
          { isRead: true, readAt: new Date() }
        );
        // Notify client to refresh notification state
        io.to(`user:${userId}`).emit('refresh_notifications');
      } catch (error) {
        console.error('Socket clear_all_chat_notifications error:', error.message);
      }
    });

    // Handle message editing
    socket.on('edit_message', ({ conversationId, messageId, content }) => {
      io.to(`conversation:${conversationId}`).emit('message_edited', { _id: messageId, content, isEdited: true });
    });

    // Handle message deletion
    socket.on('delete_message', ({ conversationId, messageId }) => {
      io.to(`conversation:${conversationId}`).emit('message_deleted', messageId);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      if (socket.userId) {
        onlineUsers.delete(socket.userId.toString());
        io.emit('user_offline', { userId: socket.userId });
      }
    });
  });
};

module.exports = setupSockets;
