'use strict';

const Advertisement = require('../models/Advertisement');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getByPlacement = asyncHandler(async (req, res) => {
  const now = new Date();
  const ads = await Advertisement.find({
    placement: req.params.placement,
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).sort('-priority');

  await Advertisement.updateMany({ _id: { $in: ads.map((a) => a._id) } }, { $inc: { impressions: 1 } });
  res.json({ success: true, data: ads });
});

const trackClick = asyncHandler(async (req, res) => {
  await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
  res.json({ success: true });
});

const list = asyncHandler(async (req, res) => {
  const ads = await Advertisement.find().sort('-createdAt');
  res.json({ success: true, data: ads });
});

const create = asyncHandler(async (req, res) => {
  const ad = await Advertisement.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: ad });
});

const update = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ad) throw new AppError('Ad not found.', 404);
  res.json({ success: true, data: ad });
});

module.exports = { getByPlacement, trackClick, list, create, update };
