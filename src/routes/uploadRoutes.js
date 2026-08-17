'use strict';

const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect, uploadLimiter);

router.post('/image', uploadSingle('file'), uploadController.uploadImage);
router.post('/images', uploadMultiple('files', 10), uploadController.uploadImages);
router.delete('/', uploadController.deleteAsset);

// Public route for serving images (no auth required)
const publicRouter = express.Router();

publicRouter.get('/images/:id', uploadController.getImage);

module.exports = { router, publicRouter };
