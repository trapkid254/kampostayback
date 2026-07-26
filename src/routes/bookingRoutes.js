'use strict';

const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', bookingController.list);
router.post('/', bookingController.create);
router.get('/:id', bookingController.getById);
router.patch('/:id/status', bookingController.updateStatus);

module.exports = router;
