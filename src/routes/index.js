'use strict';

const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const propertyRoutes = require('./propertyRoutes');
const universityRoutes = require('./universityRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const reportRoutes = require('./reportRoutes');
const notificationRoutes = require('./notificationRoutes');
const messageRoutes = require('./messageRoutes');
const roommateRoutes = require('./roommateRoutes');
const blogRoutes = require('./blogRoutes');
const faqRoutes = require('./faqRoutes');
const couponRoutes = require('./couponRoutes');
const adRoutes = require('./adRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const savedSearchRoutes = require('./savedSearchRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const adminRoutes = require('./adminRoutes');
const aiRoutes = require('./aiRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KampoStay API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/universities', universityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);
router.use('/roommates', roommateRoutes);
router.use('/blogs', blogRoutes);
router.use('/faqs', faqRoutes);
router.use('/coupons', couponRoutes);
router.use('/ads', adRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/saved-searches', savedSearchRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/uploads', uploadRoutes.router);
router.use(uploadRoutes.publicRouter);

module.exports = router;
