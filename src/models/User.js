'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const env = require('../config/env');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
    ipAddress: String,
  },
  { _id: false }
);

const wishlistItemSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'landlord', 'admin'],
      default: 'student',
      index: true,
    },
    profile: {
      firstName: { type: String, trim: true, maxlength: 50 },
      lastName: { type: String, trim: true, maxlength: 50 },
      phone: { type: String, trim: true },
      avatar: String,
      bio: { type: String, maxlength: 500 },
      university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
      dateOfBirth: Date,
      county: String,
      city: String,
    },
    verification: {
      email: { verified: { type: Boolean, default: false }, verifiedAt: Date, token: String, tokenExpires: Date },
      phone: { verified: { type: Boolean, default: false }, verifiedAt: Date, otp: String, otpExpires: Date },
      nationalId: {
        verified: { type: Boolean, default: false },
        number: String,
        documentUrl: String,
        verifiedAt: Date,
      },
      selfie: { verified: { type: Boolean, default: false }, url: String, verifiedAt: Date },
      adminApproved: { type: Boolean, default: false, index: true },
      adminApprovedAt: Date,
      adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    studentVerificationBadge: {
      active: { type: Boolean, default: false },
      issuedAt: Date,
      expiresAt: Date,
    },
    refreshTokens: [refreshTokenSchema],
    passwordReset: {
      token: String,
      expiresAt: Date,
    },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    wishlist: [wishlistItemSchema],
    recentlyViewed: [
      {
        property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    compareList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ 'profile.phone': 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual('fullName').get(function fullName() {
  return [this.profile?.firstName, this.profile?.lastName].filter(Boolean).join(' ') || this.email;
});

userSchema.virtual('isVerified').get(function isVerified() {
  return Boolean(
    this.verification?.email?.verified &&
      this.verification?.phone?.verified &&
      this.verification?.adminApproved
  );
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
  next();
});

userSchema.pre('save', function generateReferralCode(next) {
  if (this.referralCode) return next();
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  this.referralCode = `KS-${code}`;
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordReset.token = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordReset.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verification.email.token = crypto.createHash('sha256').update(token).digest('hex');
  this.verification.email.tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

userSchema.methods.addToRecentlyViewed = function addToRecentlyViewed(propertyId) {
  this.recentlyViewed = this.recentlyViewed.filter(
    (item) => item.property.toString() !== propertyId.toString()
  );
  this.recentlyViewed.unshift({ property: propertyId, viewedAt: new Date() });
  if (this.recentlyViewed.length > 20) this.recentlyViewed = this.recentlyViewed.slice(0, 20);
};

module.exports = mongoose.model('User', userSchema);
