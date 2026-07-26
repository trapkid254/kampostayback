'use strict';

const SavedSearch = require('../models/SavedSearch');
const propertyService = require('../services/propertyService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const searches = await SavedSearch.find({ user: req.user._id, isActive: true }).sort('-createdAt');
  res.json({ success: true, data: searches });
});

const create = asyncHandler(async (req, res) => {
  const search = await SavedSearch.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: search });
});

const update = asyncHandler(async (req, res) => {
  const search = await SavedSearch.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!search) throw new AppError('Saved search not found.', 404);
  res.json({ success: true, data: search });
});

const remove = asyncHandler(async (req, res) => {
  await SavedSearch.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
  res.json({ success: true, message: 'Saved search removed.' });
});

const preview = asyncHandler(async (req, res) => {
  const search = await SavedSearch.findOne({ _id: req.params.id, user: req.user._id });
  if (!search) throw new AppError('Saved search not found.', 404);
  const result = await propertyService.searchProperties(search.filters);
  res.json({ success: true, ...result });
});

module.exports = { list, create, update, remove, preview };
