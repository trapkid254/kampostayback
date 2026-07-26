'use strict';

const express = require('express');
const faqController = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', faqController.list);
router.post('/', protect, authorize('admin'), faqController.create);
router.patch('/:id', protect, authorize('admin'), faqController.update);
router.delete('/:id', protect, authorize('admin'), faqController.remove);

module.exports = router;
