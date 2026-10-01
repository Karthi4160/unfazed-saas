const ChatMessage = require('../models/ChatMessage');

const onlineUsers = new Map();

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('\n[Socket] Connected:', socket.id);

    socket.on('authenticate', (data) => {
      const { userId, userType } = data;
      socket.userId = userId;
      socket.userType = userType;

      const key = `${userType}_${userId}`;
      onlineUsers.set(key, socket.id);

      console.log('[Socket] Registered:', key);
      console.log('[Socket] All online:', Array.from(onlineUsers.keys()));

      socket.join(`user_${userId}`);
      socket.broadcast.emit('user_online', { userId, userType });
    });

    socket.on('send_message', async (data) => {
      try {
        const { toUserId, toUserType, message, type = 'text' } = data;
        const fromUserId = socket.userId;
        const fromUserType = socket.userType;

        console.log('\n[Socket] SEND MESSAGE');
        console.log('  From:', fromUserType, fromUserId);
        console.log('  To:', toUserType, toUserId);

        if (!fromUserId || !fromUserType) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
          return socket.emit('error', { message: 'Database unavailable' });
        }

        const chatMessage = new ChatMessage({
          fromUserId,
          fromUserModel: fromUserType,
          toUserId,
          toUserModel: toUserType,
          message,
          type
        });
        await chatMessage.save();
        console.log('  Saved:', chatMessage._id);

        const recipientKey = `${toUserType}_${toUserId}`;
        const recipientSocketId = onlineUsers.get(recipientKey);

        console.log('  Lookup:', recipientKey);
        console.log('  Online:', Array.from(onlineUsers.keys()));
        console.log('  Found socket:', recipientSocketId || 'NOT FOUND');

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', {
            ...chatMessage.toObject(),
            fromUserId,
            fromUserType
          });
          console.log('  Delivered to recipient');
        }

        socket.emit('message_sent', chatMessage);
      } catch (error) {
        console.error('[Socket] Error:', error.message);
        socket.emit('error', { message: 'Failed to send: ' + error.message });
      }
    });

    socket.on('typing', (data) => {
      const { toUserId, toUserType, isTyping } = data;
      const recipientKey = `${toUserType}_${toUserId}`;
      const recipientSocketId = onlineUsers.get(recipientKey);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          userId: socket.userId,
          userType: socket.userType,
          isTyping
        });
      }
    });

    socket.on('mark_read', async (data) => {
      const { messageIds } = data;
      await ChatMessage.updateMany(
        { _id: { $in: messageIds }, toUserId: socket.userId },
        { $set: { read: true, readAt: new Date() } }
      );
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        const key = `${socket.userType}_${socket.userId}`;
        onlineUsers.delete(key);
        console.log('[Socket] Disconnected:', key);
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          userType: socket.userType
        });
      }
    });
  });
}

function getOnlineUsers() {
  const users = [];
  onlineUsers.forEach((socketId, key) => {
    const [userType, userId] = key.split('_');
    users.push({ userId, userType });
  });
  return users;
}

module.exports = { setupSocket, getOnlineUsers };