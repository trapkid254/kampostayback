'use strict';

const User = require('../models/User');
const Property = require('../models/Property');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist.property', 'title slug rent media.images university');
  res.json({ success: true, data: user.wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw new AppError('Property not found.', 404);

  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((w) => w.property.toString() === property._id.toString());
  if (!exists) user.wishlist.push({ property: property._id });
  await user.save();

  res.json({ success: true, message: 'Added to wishlist.' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: { property: req.params.propertyId } } });
  res.json({ success: true, message: 'Removed from wishlist.' });
});

const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('recentlyViewed.property', 'title slug rent media.images');
  res.json({ success: true, data: user.recentlyViewed });
});

const getCompareList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('compareList', 'title slug rent deposit amenities roomType walkingTimeMinutes media.images university');
  res.json({ success: true, data: user.compareList });
});

const addToCompare = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const propertyId = req.params.propertyId;
  if (user.compareList.length >= 4) throw new AppError('Compare list limited to 4 properties.', 400);
  if (!user.compareList.some((id) => id.toString() === propertyId)) {
    user.compareList.push(propertyId);
    await user.save();
  }
  res.json({ success: true, message: 'Added to compare list.' });
});

const removeFromCompare = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { compareList: req.params.propertyId } });
  res.json({ success: true, message: 'Removed from compare list.' });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getRecentlyViewed,
  getCompareList,
  addToCompare,
  removeFromCompare,
};
