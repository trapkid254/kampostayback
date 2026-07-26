'use strict';

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'KES' },
    phoneNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    method: { type: String, enum: ['mpesa_stk', 'manual', 'sandbox'], default: 'mpesa_stk' },
    mpesa: {
      merchantRequestId: String,
      checkoutRequestId: String,
      responseCode: String,
      responseDescription: String,
      resultCode: String,
      resultDesc: String,
      receiptNumber: String,
      transactionDate: String,
      callbackPayload: mongoose.Schema.Types.Mixed,
    },
    receipt: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    completedAt: Date,
    failedAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

paymentSchema.index({ 'mpesa.checkoutRequestId': 1 }, { sparse: true });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
