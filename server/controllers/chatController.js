const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

// @desc    Get or create conversation between user & worker
// @route   POST /api/chat/conversations
exports.startConversation = async (req, res, next) => {
  try {
    const { recipientId, recipientModel, bookingId } = req.body;
    const userId = req.user._id;
    const userModel = req.userRole === 'customer' ? 'Customer' : 'Worker';

    if (!recipientId) {
      return ApiResponse.badRequest(res, 'Recipient ID is required');
    }

    const defaultRecipientModel = recipientModel || (userModel === 'Customer' ? 'Worker' : 'Customer');

    // Find existing conversation with both participants
    let conversation = await Conversation.findOne({
      'participants.user': { $all: [userId, recipientId] },
    }).populate('participants.user', 'name avatar profession role phone');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: userId, model: userModel },
          { user: recipientId, model: defaultRecipientModel },
        ],
        booking: bookingId || null,
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants.user',
        'name avatar profession role phone'
      );
    }

    ApiResponse.success(res, conversation);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for logged in user
exports.getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      'participants.user': userId,
      hiddenFrom: { $ne: userId },
    })
      .populate('participants.user', 'name avatar profession role phone')
      .populate('booking', 'status scheduledDate')
      .sort({ lastMessageAt: -1 });

    ApiResponse.success(res, conversations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Also mark related notifications as read
    await Notification.updateMany(
      {
        recipient: req.user._id,
        type: 'chat',
        isRead: false,
        $or: [
          { 'data.conversationId': conversationId },
          { 'data.conversationId': conversationId.toString() }
        ]
      },
      { isRead: true, readAt: new Date() }
    );

    // Emit notification refresh via socket
    const io = req.app.get('socketio');
    if (io) {
      io.to(`user:${req.user._id}`).emit('refresh_notifications');
    }

    ApiResponse.success(res, messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (HTTP API + Socket.io broadcast)
// @route   POST /api/chat/messages
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, type, image, location, bookingRef } = req.body;

    if (!conversationId) {
      return ApiResponse.badRequest(res, 'Conversation ID is required');
    }

    let imageUrl = image || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      senderModel: req.userRole === 'customer' ? 'Customer' : 'Worker',
      content: content || '',
      type: type || (imageUrl ? 'image' : 'text'),
      image: imageUrl,
      location,
      bookingRef,
    });

    // Update conversation lastMessage & timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content || (imageUrl ? '📷 Image' : 'Message'),
      lastMessageAt: new Date(),
      $set: { hiddenFrom: [] } // Show for everyone again on new message
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    // Create notification for recipient
    const conversation = await Conversation.findById(conversationId);
    const recipientObj = conversation.participants.find(
      (p) => p.user.toString() !== req.user._id.toString()
    );

    if (recipientObj) {
      await Notification.create({
        recipient: recipientObj.user,
        recipientModel: recipientObj.model,
        type: 'chat',
        title: `New message from ${req.user.name}`,
        message: content || (imageUrl ? '📷 Sent an image' : 'Sent a message'),
        link: recipientObj.model === 'Customer' ? '/customer/messages' : '/worker/messages',
        data: { conversationId, senderId: req.user._id },
      });

      // Emit notification via socket to recipient's personal room
      const io = req.app.get('socketio');
      if (io) {
        io.to(`user:${recipientObj.user}`).emit('notification', {
          title: `New message from ${req.user.name}`,
          message: content || 'Sent a message',
          type: 'chat',
          data: { conversationId }
        });
      }
    }

    // Broadcast message via socket.io to conversation room
    const io = req.app.get('socketio');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('new_message', populatedMessage);
    }

    ApiResponse.created(res, populatedMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Edit message
// @route   PUT /api/chat/messages/:id
exports.editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const messageId = req.params.id;

    const message = await Message.findOne({ _id: messageId, sender: req.user._id });

    if (!message) {
      return ApiResponse.notFound(res, 'Message not found or unauthorized');
    }

    if (message.type !== 'text') {
      return ApiResponse.badRequest(res, 'Only text messages can be edited');
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    // Broadcast edit via socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(`conversation:${message.conversation}`).emit('message_edited', populatedMessage);
    }

    ApiResponse.success(res, populatedMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findOne({ _id: messageId, sender: req.user._id });

    if (!message) {
      return ApiResponse.notFound(res, 'Message not found or unauthorized');
    }

    const conversationId = message.conversation;
    await Message.findByIdAndDelete(messageId);

    // Broadcast delete via socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(`conversation:${conversationId}`).emit('message_deleted', messageId);
    }

    // Update conversation last message if needed
    const lastMsg = await Message.findOne({ conversation: conversationId }).sort({ createdAt: -1 });
    if (lastMsg) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: lastMsg.content || (lastMsg.type === 'image' ? '📷 Image' : 'Message'),
        lastMessageAt: lastMsg.createdAt,
      });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: '',
        lastMessageAt: new Date(),
      });
    }

    ApiResponse.success(res, null, 'Message deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete conversation (hide for this user)
// @route   DELETE /api/chat/conversations/:id
exports.deleteConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, 'participants.user': userId },
      { $addToSet: { hiddenFrom: userId } },
      { new: true }
    );

    if (!conversation) {
      return ApiResponse.notFound(res, 'Conversation not found or unauthorized');
    }

    // If all participants have hidden it, we could delete it, but soft delete is enough for now.

    ApiResponse.success(res, null, 'Chat removed from your list');
  } catch (error) {
    next(error);
  }
};
