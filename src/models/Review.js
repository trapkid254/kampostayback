'use strict';

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      landlord: { type: Number, min: 1, max: 5 },
      amenities: { type: Number, min: 1, max: 5 },
    },
    text: { type: String, required: true, maxlength: 2000 },
    photos: [{ url: String, publicId: String }],
    landlordReply: {
      text: String,
      repliedAt: Date,
    },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    abuseReports: [
      {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        reportedAt: { type: Date, default: Date.now },
      },
    ],
    verifiedTenant: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, createdAt: -1 });
reviewSchema.index({ author: 1, property: 1 }, { unique: true });

reviewSchema.virtual('helpfulCount').get(function helpfulCount() {
  return this.helpfulVotes?.length || 0;
});

module.exports = mongoose.model('Review', reviewSchema);
