'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', userController.getUsers);
router.get('/landlords', userController.getLandlords);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', userController.updateUserStatus);
router.patch('/:id/verify', userController.approveVerification);

module.exports = router;
