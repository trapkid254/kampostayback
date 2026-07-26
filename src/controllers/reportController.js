'use strict';

const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const create = asyncHandler(async (req, res) => {
  const report = await Report.create({
    ...req.body,
    reporter: req.user._id,
  });
  res.status(201).json({ success: true, data: report });
});

const list = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role !== 'admin') query.reporter = req.user._id;
  if (req.query.status) query.status = req.query.status;

  const reports = await Report.find(query)
    .populate('reporter', 'profile email')
    .populate('reportedUser', 'profile email')
    .populate('property', 'title slug')
    .sort('-createdAt')
    .limit(50);

  res.json({ success: true, data: reports });
});

const updateStatus = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new AppError('Report not found.', 404);

  report.status = req.body.status;
  report.resolution = req.body.resolution;
  if (['resolved', 'dismissed'].includes(req.body.status)) {
    report.resolvedAt = new Date();
    report.resolvedBy = req.user._id;
  }
  report.adminActions.push({
    admin: req.user._id,
    action: req.body.status,
    note: req.body.note,
  });

  await report.save();
  res.json({ success: true, data: report });
});

module.exports = { create, list, updateStatus };
