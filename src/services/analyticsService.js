'use strict';

const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Report = require('../models/Report');

async function getDashboardStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalStudents,
    totalLandlords,
    totalProperties,
    publishedProperties,
    pendingVerification,
    totalBookings,
    recentBookings,
    totalPayments,
    completedPayments,
    revenueResult,
    totalReviews,
    openReports,
    newUsersThisMonth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'landlord' }),
    Property.countDocuments(),
    Property.countDocuments({ status: 'published' }),
    Property.countDocuments({ 'verification.status': 'pending' }),
    Booking.countDocuments(),
    Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Payment.countDocuments(),
    Payment.countDocuments({ status: 'completed' }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Review.countDocuments(),
    Report.countDocuments({ status: { $in: ['open', 'investigating'] } }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  return {
    users: { total: totalUsers, students: totalStudents, landlords: totalLandlords, newThisMonth: newUsersThisMonth },
    properties: { total: totalProperties, published: publishedProperties, pendingVerification },
    bookings: { total: totalBookings, recent: recentBookings },
    payments: {
      total: totalPayments,
      completed: completedPayments,
      revenue: revenueResult[0]?.total || 0,
      currency: 'KES',
    },
    reviews: { total: totalReviews },
    reports: { open: openReports },
  };
}

async function getPropertyAnalytics(landlordId) {
  const properties = await Property.find({ landlord: landlordId }).select('title views impressions status rent');
  const totalViews = properties.reduce((s, p) => s + p.views, 0);
  const totalImpressions = properties.reduce((s, p) => s + p.impressions, 0);

  const bookings = await Booking.countDocuments({ landlord: landlordId });
  const confirmed = await Booking.countDocuments({ landlord: landlordId, status: 'confirmed' });

  return {
    properties: properties.length,
    totalViews,
    totalImpressions,
    bookings: { total: bookings, confirmed },
    topProperties: properties.sort((a, b) => b.views - a.views).slice(0, 5),
  };
}

async function getBookingTrends(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

async function getRevenueTrends(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Payment.aggregate([
    { $match: { status: 'completed', completedAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

module.exports = { getDashboardStats, getPropertyAnalytics, getBookingTrends, getRevenueTrends };
