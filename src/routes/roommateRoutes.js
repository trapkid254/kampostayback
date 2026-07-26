'use strict';

const express = require('express');
const roommateController = require('../controllers/roommateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/profile', roommateController.getProfile);
router.put('/profile', roommateController.upsertProfile);
router.get('/matches', roommateController.findMatches);
router.get('/compare/:userId', roommateController.compare);

module.exports = router;
