'use strict';

const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, maxlength: 3000 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', index: true },
    category: {
      type: String,
      enum: ['furniture', 'electronics', 'books', 'appliances', 'clothing', 'other'],
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KES' },
    condition: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'poor'], default: 'good' },
    images: [{ url: String, publicId: String }],
    location: { city: String, county: String },
    status: { type: String, enum: ['available', 'sold', 'reserved', 'removed'], default: 'available', index: true },
    views: { type: Number, default: 0 },
    contactPhone: String,
  },
  { timestamps: true }
);

marketplaceItemSchema.index({ title: 'text', description: 'text' });

marketplaceItemSchema.pre('validate', function setSlug(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = `${slugify(this.title)}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
