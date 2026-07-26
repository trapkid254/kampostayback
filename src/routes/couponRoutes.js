'use strict';

const express = require('express');
const couponController = require('../controllers/couponController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/validate', optionalAuth, couponController.validate);
router.get('/', protect, authorize('admin'), couponController.list);
router.post('/', protect, authorize('admin'), couponController.create);
router.patch('/:id', protect, authorize('admin'), couponController.update);

module.exports = router;
