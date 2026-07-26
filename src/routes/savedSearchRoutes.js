'use strict';

const express = require('express');
const savedSearchController = require('../controllers/savedSearchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', savedSearchController.list);
router.post('/', savedSearchController.create);
router.get('/:id/preview', savedSearchController.preview);
router.patch('/:id', savedSearchController.update);
router.delete('/:id', savedSearchController.remove);

module.exports = router;
