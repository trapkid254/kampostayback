'use strict';

const University = require('../models/University');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const { featured, q, page = 1, limit = 50 } = req.query;
  const query = { isActive: true };
  if (featured === 'true') query.featured = true;
  if (q) query.$text = { $search: q };

  const [universities, total] = await Promise.all([
    University.find(query).sort('name').skip((page - 1) * limit).limit(Number(limit)),
    University.countDocuments(query),
  ]);

  res.json({ success: true, data: universities, pagination: { page: Number(page), total } });
});

const getBySlug = asyncHandler(async (req, res) => {
  const university = await University.findOne({ slug: req.params.slug });
  if (!university) throw new AppError('University not found.', 404);
  res.json({ success: true, data: university });
});

const getById = asyncHandler(async (req, res) => {
  const university = await University.findById(req.params.id);
  if (!university) throw new AppError('University not found.', 404);
  res.json({ success: true, data: university });
});

const create = asyncHandler(async (req, res) => {
  const university = await University.create(req.body);
  res.status(201).json({ success: true, data: university });
});

const update = asyncHandler(async (req, res) => {
  const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!university) throw new AppError('University not found.', 404);
  res.json({ success: true, data: university });
});

module.exports = { list, getBySlug, getById, create, update };
