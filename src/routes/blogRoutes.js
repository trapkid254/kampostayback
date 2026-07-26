'use strict';

const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', blogController.list);
router.get('/:slug', blogController.getBySlug);
router.post('/', protect, authorize('admin'), blogController.create);
router.patch('/:id', protect, authorize('admin'), blogController.update);

module.exports = router;
