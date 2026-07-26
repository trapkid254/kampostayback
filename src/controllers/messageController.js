'use strict';

const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const notificationService = require('../services/notificationService');

const send = asyncHandler(async (req, res) => {
  const { recipientId, content, propertyId } = req.body;
  const conversationId = Message.buildConversationId(req.user._id, recipientId, propertyId);

  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    recipient: recipientId,
    property: propertyId,
    content,
    attachments: req.body.attachments,
  });

  await notificationService.notify(recipientId, {
    type: 'message',
    title: 'New Message',
    body: content.slice(0, 100),
    data: { conversationId, messageId: message._id },
    link: `/messages/${conversationId}`,
  });

  res.status(201).json({ success: true, data: message });
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const messages = await Message.aggregate([
    { $match: { $or: [{ sender: userId }, { recipient: userId }], isDeleted: false } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] }, 1, 0] },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  res.json({ success: true, data: messages });
});

const getConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversationId: req.params.conversationId, isDeleted: false })
    .populate('sender', 'profile')
    .populate('recipient', 'profile')
    .sort('createdAt');

  const userId = req.user._id.toString();
  const isParticipant = messages.some(
    (m) => m.sender._id.toString() === userId || m.recipient._id.toString() === userId
  );
  if (!isParticipant && req.user.role !== 'admin') throw new AppError('Not authorized.', 403);

  await Message.updateMany(
    { conversationId: req.params.conversationId, recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ success: true, data: messages });
});

module.exports = { send, getConversations, getConversation };
