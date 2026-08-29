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
  const labels = trends.map(t => t._id);
  const data = trends.map(t => t.count);
  res.json({ success: true, data: { labels, data, trends } });
});

const revenueTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getRevenueTrends(Number(req.query.days) || 30);
  const labels = trends.map(t => t._id);
  const data = trends.map(t => t.revenue);
  const count = trends.map(t => t.count);
  res.json({ success: true, data: { labels, data, count, trends } });
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

const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) throw new AppError('User not found.', 404);
  res.json({ success: true, data: user });
});

const getVerificationQueue = asyncHandler(async (req, res) => {
  const properties = await Property.find({ 'verification.status': 'pending' })
    .populate('landlord', 'profile email')
    .populate('university', 'name')
    .sort('-createdAt')
    .limit(50);
  res.json({ success: true, data: properties });
});

const getPropertyStatistics = asyncHandler(async (req, res) => {
  const stats = await Property.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byVerification: [
          { $group: { _id: '$verification.status', count: { $sum: 1 } } },
        ],
      },
    },
  ]);
  res.json({ success: true, data: stats[0] || {} });
});

const getReportStatistics = asyncHandler(async (req, res) => {
  const Report = require('../models/Report');
  const stats = await Report.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ],
      },
    },
  ]);
  res.json({ success: true, data: stats[0] || {} });
});

const getUserStatistics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = await User.aggregate([
    {
      $facet: {
        byRole: [
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ],
        newUsers: [
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ],
        verified: [
          { $group: { _id: '$verification.email.verified', count: { $sum: 1 } } },
        ],
      },
    },
  ]);
  res.json({ success: true, data: stats[0] || {} });
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
  unsuspendUser,
  getVerificationQueue,
  getPropertyStatistics,
  getReportStatistics,
  getUserStatistics,
};
