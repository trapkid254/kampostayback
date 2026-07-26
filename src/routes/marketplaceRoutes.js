'use strict';

const express = require('express');
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', marketplaceController.list);
router.get('/:slug', marketplaceController.getBySlug);
router.post('/', protect, marketplaceController.create);
router.patch('/:id', protect, marketplaceController.update);

module.exports = router;
