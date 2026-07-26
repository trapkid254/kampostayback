'use strict';

const express = require('express');
const propertyController = require('../controllers/propertyController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, propertyController.search);
router.get('/search', optionalAuth, propertyController.search);
router.get('/featured', propertyController.getFeatured);
router.get('/mine', protect, authorize('landlord', 'admin'), propertyController.getMyProperties);
router.get('/slug/:slug', optionalAuth, propertyController.getBySlug);
router.get('/:id/similar', propertyController.getSimilar);
router.get('/:id', optionalAuth, propertyController.getById);
router.post('/', protect, authorize('landlord', 'admin'), propertyController.create);
router.patch('/:id', protect, authorize('landlord', 'admin'), propertyController.update);
router.delete('/:id', protect, authorize('landlord', 'admin'), propertyController.remove);

module.exports = router;
