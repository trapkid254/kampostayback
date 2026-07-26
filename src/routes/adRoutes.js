'use strict';

const express = require('express');
const adController = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/placement/:placement', adController.getByPlacement);
router.post('/:id/click', adController.trackClick);
router.get('/', protect, authorize('admin'), adController.list);
router.post('/', protect, authorize('admin'), adController.create);
router.patch('/:id', protect, authorize('admin'), adController.update);

module.exports = router;
