'use strict';

const Booking = require('../models/Booking');
const Property = require('../models/Property');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');

async function createBooking({ type, propertyId, studentId, scheduledDate, endDate, notes, amount }) {
  const property = await Property.findById(propertyId).populate('landlord');
  if (!property) throw new AppError('Property not found.', 404);
  if (property.status !== 'published') throw new AppError('Property is not available for booking.', 400);

  const booking = await Booking.create({
    type: type || 'viewing',
    property: propertyId,
    student: studentId,
    landlord: property.landlord._id,
    scheduledDate: new Date(scheduledDate),
    endDate: endDate ? new Date(endDate) : undefined,
    notes,
    amount: amount || (type === 'reservation' ? property.deposit || property.rent : 0),
    status: 'pending',
  });

  await notificationService.notify(property.landlord._id, {
    type: 'booking',
    title: 'New Booking Request',
    body: `A student requested a ${booking.type} for ${property.title}.`,
    data: { bookingId: booking._id, propertyId },
    link: `/dashboard/bookings/${booking._id}`,
  });

  return Booking.findById(booking._id)
    .populate('property', 'title slug rent media.images')
    .populate('student', 'profile email')
    .populate('landlord', 'profile email');
}

async function getBookingById(id, userId, role) {
  const booking = await Booking.findById(id)
    .populate('property')
    .populate('student', 'profile email')
    .populate('landlord', 'profile email')
    .populate('payment');

  if (!booking) throw new AppError('Booking not found.', 404);

  const isParty =
    booking.student._id.toString() === userId.toString() ||
    booking.landlord._id.toString() === userId.toString() ||
    role === 'admin';

  if (!isParty) throw new AppError('Not authorized.', 403);
  return booking;
}

async function updateBookingStatus(id, userId, role, status, reason) {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found.', 404);

  const canUpdate =
    role === 'admin' ||
    booking.landlord.toString() === userId.toString() ||
    (booking.student.toString() === userId.toString() && status === 'cancelled');

  if (!canUpdate) throw new AppError('Not authorized.', 403);

  booking.status = status;
  if (status === 'confirmed') booking.confirmedAt = new Date();
  if (status === 'completed') booking.completedAt = new Date();
  if (status === 'cancelled') {
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
  }

  await booking.save();

  const notifyUser = booking.student.toString() === userId.toString() ? booking.landlord : booking.student;
  await notificationService.notify(notifyUser, {
    type: 'booking',
    title: `Booking ${status}`,
    body: `Your booking has been ${status}.`,
    data: { bookingId: booking._id },
  });

  return booking.populate('property', 'title slug');
}

async function listBookings(userId, role, filters = {}) {
  const query = {};
  if (role === 'student') query.student = userId;
  else if (role === 'landlord') query.landlord = userId;
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('property', 'title slug rent media.images')
      .populate('student', 'profile')
      .populate('landlord', 'profile')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  return { bookings, pagination: { page, limit, total } };
}

module.exports = { createBooking, getBookingById, updateBookingStatus, listBookings };
