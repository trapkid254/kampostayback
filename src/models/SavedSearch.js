'use strict';

const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true, maxlength: 100 },
    filters: {
      university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
      minRent: Number,
      maxRent: Number,
      roomType: String,
      amenities: mongoose.Schema.Types.Mixed,
      maxWalkingMinutes: Number,
      maxDistanceKm: Number,
      genderRestriction: String,
      furnished: Boolean,
      wifi: Boolean,
      query: String,
      coordinates: [Number],
    },
    notify: { type: Boolean, default: true },
    lastNotifiedAt: Date,
    matchCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

savedSearchSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
