'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validate({
    body: {
      email: { required: true, type: 'email' },
      password: { required: true, type: 'string', minLength: 8 },
      role: { enum: ['student', 'landlord'] },
    },
  }),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate({
    body: {
      email: { required: true, type: 'email' },
      password: { required: true, type: 'string' },
    },
  }),
  authController.login
);

router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', authLimiter, validate({ body: { email: { required: true, type: 'email' } } }), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: { token: { required: true, type: 'string' }, password: { required: true, minLength: 8 } } }), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);

module.exports = router;
