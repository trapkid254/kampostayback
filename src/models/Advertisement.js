'use strict';

const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    imageUrl: String,
    linkUrl: String,
    placement: {
      type: String,
      enum: ['homepage_banner', 'search_sidebar', 'property_detail', 'footer', 'popup'],
      required: true,
      index: true,
    },
    targetAudience: { type: String, enum: ['all', 'students', 'landlords'], default: 'all' },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    budget: Number,
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

advertisementSchema.index({ placement: 1, isActive: 1, priority: -1 });

module.exports = mongoose.model('Advertisement', advertisementSchema);
