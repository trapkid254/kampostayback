'use strict';

const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/mpesa/callback', paymentController.mpesaCallback);
router.post('/stk-push', protect, paymentLimiter, paymentController.initiateSTK);
router.get('/', protect, paymentController.list);
router.get('/:id', protect, paymentController.getById);

module.exports = router;
