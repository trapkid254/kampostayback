'use strict';

const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    ...req.body,
    propertyId: req.body.propertyId || req.body.property,
    studentId: req.user._id,
  });
  res.status(201).json({ success: true, data: booking });
});

const list = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.user._id, req.user.role, req.query);
  res.json({ success: true, ...result });
});

const getById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user._id, req.user.role);
  res.json({ success: true, data: booking });
});

const updateStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body.status,
    req.body.reason
  );
  res.json({ success: true, data: booking });
});

module.exports = { create, list, getById, updateStatus };
