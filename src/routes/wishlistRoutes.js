'use strict';

const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', wishlistController.getWishlist);
router.get('/recent', wishlistController.getRecentlyViewed);
router.get('/compare', wishlistController.getCompareList);
router.post('/compare/:propertyId', wishlistController.addToCompare);
router.delete('/compare/:propertyId', wishlistController.removeFromCompare);
router.post('/:propertyId', wishlistController.addToWishlist);
router.delete('/:propertyId', wishlistController.removeFromWishlist);

module.exports = router;
