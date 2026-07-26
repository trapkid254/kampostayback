'use strict';

const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const query = { status: 'available' };
  if (req.query.category) query.category = req.query.category;
  if (req.query.university) query.university = req.query.university;
  if (req.query.q) query.$text = { $search: req.query.q };

  const items = await MarketplaceItem.find(query).populate('seller', 'profile').populate('university', 'name').sort('-createdAt').limit(30);
  res.json({ success: true, data: items });
});

const getBySlug = asyncHandler(async (req, res) => {
  const item = await MarketplaceItem.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } }, { new: true })
    .populate('seller', 'profile')
    .populate('university', 'name');
  if (!item) throw new AppError('Item not found.', 404);
  res.json({ success: true, data: item });
});

const create = asyncHandler(async (req, res) => {
  const item = await MarketplaceItem.create({ ...req.body, seller: req.user._id });
  res.status(201).json({ success: true, data: item });
});

const update = asyncHandler(async (req, res) => {
  const item = await MarketplaceItem.findOne({ _id: req.params.id, seller: req.user._id });
  if (!item && req.user.role !== 'admin') throw new AppError('Item not found.', 404);
  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, data: item });
});

module.exports = { list, getBySlug, create, update };
