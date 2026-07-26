'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
    content: { type: String, required: true, maxlength: 5000 },
    attachments: [{ url: String, type: String, name: String }],
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

messageSchema.statics.buildConversationId = function buildConversationId(userId1, userId2, propertyId) {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return propertyId ? `${ids[0]}_${ids[1]}_${propertyId}` : `${ids[0]}_${ids[1]}`;
};

module.exports = mongoose.model('Message', messageSchema);
