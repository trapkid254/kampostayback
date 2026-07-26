'use strict';

const express = require('express');
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/search', optionalAuth, aiController.search);
router.post('/search', optionalAuth, aiController.search);
router.post('/chat', optionalAuth, aiController.chat);
router.post('/assist', optionalAuth, aiController.chat);

module.exports = router;
