'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['scam', 'fraud', 'fake_listing', 'harassment', 'misleading_info', 'duplicate', 'other'],
      required: true,
      index: true,
    },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', index: true },
    description: { type: String, required: true, maxlength: 3000 },
    evidence: [{ url: String, type: String, description: String }],
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    adminActions: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: String,
        note: String,
        takenAt: { type: Date, default: Date.now },
      },
    ],
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
