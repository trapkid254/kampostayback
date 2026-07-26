'use strict';

const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const list = asyncHandler(async (req, res) => {
  const query = { status: 'published' };
  if (req.query.category) query.category = req.query.category;
  if (req.query.q) query.$text = { $search: req.query.q };

  const blogs = await Blog.find(query).populate('author', 'profile').sort('-publishedAt').limit(20);
  res.json({ success: true, data: blogs });
});

const getBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'profile');
  if (!blog) throw new AppError('Blog post not found.', 404);
  res.json({ success: true, data: blog });
});

const create = asyncHandler(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user._id, publishedAt: req.body.status === 'published' ? new Date() : undefined });
  res.status(201).json({ success: true, data: blog });
});

const update = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!blog) throw new AppError('Blog not found.', 404);
  res.json({ success: true, data: blog });
});

module.exports = { list, getBySlug, create, update };
