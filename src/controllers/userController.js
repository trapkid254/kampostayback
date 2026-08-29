'use strict';

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;

  const [users, total] = await Promise.all([
    User.find(query).select('-password -refreshTokens').skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total } });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens').populate('profile.university', 'name');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: user });
});

const approveVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);

  user.verification.adminApproved = true;
  user.verification.adminApprovedAt = new Date();
  user.verification.adminApprovedBy = req.user._id;
  if (user.role === 'student') {
    user.studentVerificationBadge = { active: true, issuedAt: new Date(), expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
  }
  await user.save();

  res.json({ success: true, data: user });
});

const getLandlords = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const query = { role: 'landlord', isActive: true };

  const [landlords, total] = await Promise.all([
    User.find(query).select('-password -refreshTokens').skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: landlords, pagination: { page: Number(page), limit: Number(limit), total } });
});

const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const query = { role: 'student', isActive: true };

  const [students, total] = await Promise.all([
    User.find(query).select('-password -refreshTokens').skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: students, pagination: { page: Number(page), limit: Number(limit), total } });
});

module.exports = { getUsers, getUserById, updateUserStatus, approveVerification, getLandlords, getStudents };
