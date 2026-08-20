'use strict';

const express = require('express');
const universityController = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', universityController.list);
router.get('/slug/:slug', universityController.getBySlug);
router.get('/:id', universityController.getById);
router.post('/', protect, authorize('admin'), universityController.create);
router.patch('/:id', protect, authorize('admin'), universityController.update);
router.delete('/:id', protect, authorize('admin'), universityController.remove);

module.exports = router;
