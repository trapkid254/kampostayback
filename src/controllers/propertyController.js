'use strict';

const propertyService = require('../services/propertyService');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const search = asyncHandler(async (req, res) => {
  const filters = { ...req.query };
  // Public callers may only browse published listings
  if (!req.user || req.user.role !== 'admin') {
    filters.status = 'published';
  }
  const result = await propertyService.searchProperties(filters);
  res.json({
    success: true,
    data: result.properties,
    properties: result.properties,
    pagination: result.pagination,
    total: result.pagination?.total ?? result.properties.length,
  });
});

const getFeatured = asyncHandler(async (req, res) => {
  const properties = await propertyService.getFeatured(Number(req.query.limit) || 6);
  res.json({ success: true, data: properties });
});

const getBySlug = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyBySlug(req.params.slug, req.user);
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: { property: property._id } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyViewed: { $each: [{ property: property._id }], $position: 0, $slice: 20 } },
    });
  }
  res.json({ success: true, data: property });
});

const getById = asyncHandler(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id, req.user);
  res.json({ success: true, data: property });
});

const getSimilar = asyncHandler(async (req, res) => {
  const properties = await propertyService.getSimilar(req.params.id);
  res.json({ success: true, data: properties });
});

const create = asyncHandler(async (req, res) => {
  let landlordId = req.user._id;
  if (req.user.role === 'admin' && req.body.landlord) {
    const landlord = await User.findById(req.body.landlord);
    if (!landlord || landlord.role !== 'landlord') {
      throw new AppError('Select a valid landlord account for this listing.', 400);
    }
    landlordId = landlord._id;
  }
  const property = await propertyService.createProperty(landlordId, req.body);
  res.status(201).json({ success: true, data: property });
});

const update = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const property = await propertyService.updateProperty(req.params.id, req.user._id, req.body, isAdmin);
  res.json({ success: true, data: property });
});

const remove = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  await propertyService.deleteProperty(req.params.id, req.user._id, isAdmin);
  res.json({ success: true, message: 'Property archived.' });
});

const getMyProperties = asyncHandler(async (req, res) => {
  const result = await propertyService.searchProperties({
    ...req.query,
    landlord: req.user._id,
    status: req.query.status || 'all',
  });
  res.json({
    success: true,
    data: result.properties,
    properties: result.properties,
    pagination: result.pagination,
  });
});

module.exports = { search, getFeatured, getBySlug, getById, getSimilar, create, update, remove, getMyProperties };
