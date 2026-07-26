'use strict';

const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateTokenPair, hashToken, verifyRefreshToken, parseExpiryToMs } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const env = require('../config/env');
const { sanitizeEmail, sanitizePhone } = require('../utils/sanitize');

async function register(payload = {}) {
  const {
    email,
    password,
    role,
    profile,
    referralCode,
    firstName,
    lastName,
    phone,
    university,
  } = payload;

  const normalizedEmail = sanitizeEmail(email);
  if (!normalizedEmail) throw new AppError('Valid email is required.', 400);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError('Email already registered.', 409);

  let universityId = profile?.university || university;
  if (universityId && !String(universityId).match(/^[a-f\d]{24}$/i)) {
    const University = require('../models/University');
    const uni = await University.findOne({
      $or: [
        { name: new RegExp(String(universityId), 'i') },
        { aliases: new RegExp(String(universityId), 'i') },
      ],
    });
    universityId = uni?._id;
  }

  const userData = {
    email: normalizedEmail,
    password,
    role: ['student', 'landlord'].includes(role) ? role : 'student',
    profile: {
      firstName: profile?.firstName || firstName,
      lastName: profile?.lastName || lastName,
      phone: sanitizePhone(profile?.phone || phone),
      university: universityId || undefined,
    },
  };

  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) userData.referredBy = referrer._id;
  }

  const user = await User.create(userData);
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendVerificationEmail(user, verifyUrl);
  await sendWelcomeEmail(user);

  const tokens = generateTokenPair(user);
  await storeRefreshToken(user, tokens.refreshToken, {});

  const publicUser = await User.findById(user._id).select('-password');
  return { user: publicUser, ...tokens };
}

async function login({ email, password, userAgent, ipAddress }) {
  const normalizedEmail = sanitizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated.', 403);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateTokenPair(user);
  await storeRefreshToken(user, tokens.refreshToken, { userAgent, ipAddress });

  const publicUser = await User.findById(user._id).select('-password');
  return { user: publicUser, ...tokens };
}

async function storeRefreshToken(user, refreshToken, { userAgent, ipAddress }) {
  const hashed = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiryToMs(env.JWT_REFRESH_EXPIRES));

  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > new Date());
  user.refreshTokens.push({ token: hashed, expiresAt, userAgent, ipAddress });

  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save({ validateBeforeSave: false });
}

async function refreshAccessToken(refreshToken, meta = {}) {
  if (!refreshToken) throw new AppError('Refresh token required.', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token.', 401);
  }

  const hashed = hashToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) throw new AppError('User not found.', 401);

  const stored = user.refreshTokens.find((t) => t.token === hashed && t.expiresAt > new Date());
  if (!stored) throw new AppError('Refresh token revoked or expired.', 401);

  const tokens = generateTokenPair(user);
  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
  await storeRefreshToken(user, tokens.refreshToken, meta);

  return tokens;
}

async function logout(userId, refreshToken) {
  const user = await User.findById(userId);
  if (!user) return;

  if (refreshToken) {
    const hashed = hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
  } else {
    user.refreshTokens = [];
  }
  await user.save({ validateBeforeSave: false });
}

async function forgotPassword(email) {
  const normalizedEmail = sanitizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return { message: 'If that email exists, a reset link has been sent.' };

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(user, resetUrl);

  return { message: 'If that email exists, a reset link has been sent.' };
}

async function resetPassword(token, newPassword) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    'passwordReset.token': hashed,
    'passwordReset.expiresAt': { $gt: new Date() },
  }).select('+password');

  if (!user) throw new AppError('Invalid or expired reset token.', 400);

  user.password = newPassword;
  user.passwordReset = undefined;
  user.refreshTokens = [];
  await user.save();

  return generateTokenPair(user);
}

async function verifyEmail(token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    'verification.email.token': hashed,
    'verification.email.tokenExpires': { $gt: new Date() },
  });

  if (!user) throw new AppError('Invalid or expired verification token.', 400);

  user.verification.email.verified = true;
  user.verification.email.verifiedAt = new Date();
  user.verification.email.token = undefined;
  user.verification.email.tokenExpires = undefined;
  await user.save();

  return user;
}

async function getProfile(userId) {
  return User.findById(userId)
    .select('-password -refreshTokens')
    .populate('profile.university', 'name slug');
}

async function updateProfile(userId, updates) {
  const allowed = ['profile'];
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (updates.profile) {
    Object.assign(user.profile, updates.profile);
    if (updates.profile.phone) user.profile.phone = sanitizePhone(updates.profile.phone);
  }

  await user.save();
  return User.findById(userId).select('-password').populate('profile.university', 'name slug');
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
};
