'use strict';

const express = require('express');
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', reportController.create);
router.get('/', reportController.list);
router.patch('/:id', authorize('admin'), reportController.updateStatus);

module.exports = router;
