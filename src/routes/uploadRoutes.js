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
const cors = require('cors');
const publicRouter = express.Router();

// Apply CORS to public router for cross-origin image access
publicRouter.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS preflight requests explicitly
publicRouter.options('/images/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

publicRouter.get('/images/:id', uploadController.getImage);

module.exports = { router, publicRouter };
