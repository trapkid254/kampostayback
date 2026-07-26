'use strict';

const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/property/:propertyId', reviewController.listByProperty);
router.get('/', protect, authorize('landlord', 'admin'), reviewController.list);
router.post('/', protect, authorize('student'), reviewController.create);
router.post('/:id/helpful', protect, reviewController.markHelpful);
router.post('/:id/report', protect, reviewController.reportAbuse);
router.post('/:id/reply', protect, authorize('landlord', 'admin'), reviewController.reply);

module.exports = router;
