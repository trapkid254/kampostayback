'use strict';

const FAQ = require('../models/FAQ');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const query = { isPublished: true };
  if (req.query.category) query.category = req.query.category;
  const faqs = await FAQ.find(query).sort({ category: 1, order: 1 });
  res.json({ success: true, data: faqs });
});

const create = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, data: faq });
});

const update = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) throw new AppError('FAQ not found.', 404);
  res.json({ success: true, data: faq });
});

const remove = asyncHandler(async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'FAQ deleted.' });
});

module.exports = { list, create, update, remove };
