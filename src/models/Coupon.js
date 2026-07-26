'use strict';

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KES' },
    minAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom: { type: Date, default: Date.now },
    validUntil: Date,
    isActive: { type: Boolean, default: true, index: true },
    applicableTo: { type: String, enum: ['booking', 'all'], default: 'booking' },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function isValid(userId, amount) {
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (this.validFrom && new Date() < this.validFrom) return { valid: false, reason: 'Coupon not yet valid' };
  if (this.validUntil && new Date() > this.validUntil) return { valid: false, reason: 'Coupon expired' };
  if (this.usageLimit > 0 && this.usageCount >= this.usageLimit) return { valid: false, reason: 'Usage limit reached' };
  if (amount < this.minAmount) return { valid: false, reason: `Minimum amount is KSh ${this.minAmount}` };
  if (userId) {
    const userUses = this.usedBy.filter((id) => id.toString() === userId.toString()).length;
    if (userUses >= this.perUserLimit) return { valid: false, reason: 'You have already used this coupon' };
  }
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function calculateDiscount(amount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return Math.min(discount, amount);
};

module.exports = mongoose.model('Coupon', couponSchema);
