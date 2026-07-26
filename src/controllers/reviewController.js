'use strict';

const Review = require('../models/Review');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const listByProperty = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ property: req.params.propertyId, isHidden: false })
    .populate('author', 'profile verification.studentVerificationBadge')
    .sort('-createdAt');
  res.json({ success: true, data: reviews });
});

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'landlord') {
    filter.landlord = req.user._id;
  }
  if (req.query.reported === 'true') {
    filter['abuseReports.0'] = { $exists: true };
  }
  const reviews = await Review.find(filter)
    .populate('author', 'profile email')
    .populate('property', 'title')
    .sort('-createdAt')
    .limit(Number(req.query.limit) || 50);
  res.json({ success: true, data: reviews });
});

const create = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.propertyId || req.body.property);
  if (!property) throw new AppError('Property not found.', 404);

  const review = await Review.create({
    property: property._id,
    author: req.user._id,
    landlord: property.landlord,
    ratings: req.body.ratings,
    text: req.body.text,
    photos: req.body.photos,
    verifiedTenant: req.body.verifiedTenant || false,
  });

  res.status(201).json({ success: true, data: review });
});

const reply = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found.', 404);
  if (review.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized.', 403);
  }

  review.landlordReply = { text: req.body.text, repliedAt: new Date() };
  await review.save();
  res.json({ success: true, data: review });
});

const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found.', 404);

  const userId = req.user._id.toString();
  const idx = review.helpfulVotes.findIndex((id) => id.toString() === userId);
  if (idx === -1) review.helpfulVotes.push(req.user._id);
  else review.helpfulVotes.splice(idx, 1);

  await review.save();
  res.json({ success: true, data: review });
});

const reportAbuse = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found.', 404);

  review.abuseReports.push({ reporter: req.user._id, reason: req.body.reason });
  await review.save();
  res.json({ success: true, message: 'Report submitted.' });
});

module.exports = { listByProperty, list, create, reply, markHelpful, reportAbuse };
