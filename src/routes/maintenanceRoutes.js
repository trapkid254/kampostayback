'use strict';

const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', maintenanceController.list);
router.post('/', maintenanceController.create);
router.patch('/:id', maintenanceController.update);

module.exports = router;
