'use strict';

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['viewing', 'reservation'], required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'expired'],
      default: 'pending',
      index: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'KES' },
    notes: { type: String, maxlength: 1000 },
    cancellationReason: String,
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ student: 1, status: 1, createdAt: -1 });
bookingSchema.index({ landlord: 1, scheduledDate: 1 });
bookingSchema.index({ property: 1, scheduledDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
