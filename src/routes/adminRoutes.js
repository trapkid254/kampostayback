'use strict';

const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.dashboard);
router.get('/trends/bookings', adminController.bookingTrends);
router.get('/trends/revenue', adminController.revenueTrends);
router.patch('/properties/:id/verify', adminController.verifyProperty);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/settings', adminController.getSettings);
router.put('/settings/:key', adminController.updateSetting);
router.patch('/users/:id/suspend', adminController.suspendUser);

module.exports = router;
