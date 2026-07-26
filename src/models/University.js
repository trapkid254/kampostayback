'use strict';

const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    aliases: [{ type: String, trim: true }],
    location: {
      address: String,
      city: String,
      county: String,
      country: { type: String, default: 'Kenya' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [36.8219, -1.2921] },
      },
    },
    logo: String,
    website: String,
    studentCount: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

universitySchema.index({ 'location.coordinates': '2dsphere' });
universitySchema.index({ name: 'text', aliases: 'text' });

universitySchema.pre('validate', function setSlug(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = slugify(this.name);
  }
  next();
});

module.exports = mongoose.model('University', universitySchema);
