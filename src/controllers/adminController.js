'use strict';

const analyticsService = require('../services/analyticsService');
const Property = require('../models/Property');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const dashboard = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  res.json({ success: true, data: stats });
});

const bookingTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getBookingTrends(Number(req.query.days) || 30);
  res.json({ success: true, data: trends });
});

const revenueTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getRevenueTrends(Number(req.query.days) || 30);
  res.json({ success: true, data: trends });
});

const verifyProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new AppError('Property not found.', 404);

  property.verification.status = req.body.status || 'verified';
  property.verification.verifiedAt = new Date();
  property.verification.verifiedBy = req.user._id;
  property.verification.notes = req.body.notes;
  if (req.body.status === 'verified' && property.status === 'draft') {
    property.status = 'published';
    property.publishedAt = new Date();
  }
  await property.save();

  res.json({ success: true, data: property });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort('-createdAt').limit(100).populate('user', 'profile email');
  res.json({ success: true, data: logs });
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  res.json({ success: true, data: settings });
});

const updateSetting = asyncHandler(async (req, res) => {
  const setting = await Setting.set(req.params.key, req.body.value, req.user._id);
  res.json({ success: true, data: setting });
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: user });
});

module.exports = {
  dashboard,
  bookingTrends,
  revenueTrends,
  verifyProperty,
  getAuditLogs,
  getSettings,
  updateSetting,
  suspendUser,
};
