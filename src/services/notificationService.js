'use strict';

const Notification = require('../models/Notification');

async function notify(recipientId, { type, title, body, data, link }) {
  return Notification.create({
    recipient: recipientId,
    type,
    title,
    body,
    data,
    link,
  });
}

async function notifyMany(recipientIds, payload) {
  const docs = recipientIds.map((id) => ({ recipient: id, ...payload }));
  return Notification.insertMany(docs);
}

async function getNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, limit };
}

async function markAsRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
}

async function markAllAsRead(userId) {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
}

async function deleteNotification(userId, notificationId) {
  return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
}

module.exports = { notify, notifyMany, getNotifications, markAsRead, markAllAsRead, deleteNotification };
