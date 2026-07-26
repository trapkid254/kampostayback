'use strict';

const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const notificationService = require('../services/notificationService');

const create = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.propertyId || req.body.property);
  if (!property) throw new AppError('Property not found.', 404);

  const request = await MaintenanceRequest.create({
    ...req.body,
    property: property._id,
    tenant: req.user._id,
    landlord: property.landlord,
  });

  await notificationService.notify(property.landlord, {
    type: 'maintenance',
    title: 'New Maintenance Request',
    body: req.body.title,
    data: { requestId: request._id },
  });

  res.status(201).json({ success: true, data: request });
});

const list = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'student') query.tenant = req.user._id;
  else if (req.user.role === 'landlord') query.landlord = req.user._id;
  if (req.query.status) query.status = req.query.status;

  const requests = await MaintenanceRequest.find(query)
    .populate('property', 'title slug')
    .populate('tenant', 'profile')
    .sort('-createdAt');

  res.json({ success: true, data: requests });
});

const update = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) throw new AppError('Request not found.', 404);

  const canUpdate =
    req.user.role === 'admin' ||
    request.landlord.toString() === req.user._id.toString() ||
    (request.tenant.toString() === req.user._id.toString() && req.body.status === 'cancelled');

  if (!canUpdate) throw new AppError('Not authorized.', 403);

  Object.assign(request, req.body);
  if (req.body.status === 'resolved') request.resolvedAt = new Date();
  await request.save();

  res.json({ success: true, data: request });
});

module.exports = { create, list, update };
