'use strict';

const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const availabilityEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    available: { type: Boolean, default: true },
    priceOverride: Number,
    note: String,
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, maxlength: 5000 },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
    rent: { type: Number, required: true, min: 0, index: true },
    deposit: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'KES' },
    roomType: {
      type: String,
      enum: ['single', 'shared', 'bedsitter', 'one_bedroom', 'two_bedroom', 'studio', 'hostel_bed'],
      required: true,
      index: true,
    },
    roomSize: { type: Number, min: 0 },
    roomSizeUnit: { type: String, enum: ['sqm', 'sqft'], default: 'sqm' },
    distanceFromCampus: { type: Number, min: 0 },
    walkingTimeMinutes: { type: Number, min: 0, index: true },
    amenities: {
      water: { type: Boolean, default: true },
      wifi: { type: Boolean, default: false },
      electricityType: { type: String, enum: ['prepaid', 'postpaid', 'included'], default: 'prepaid' },
      bathrooms: { type: Number, default: 1, min: 0 },
      furnished: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: true },
      pets: { type: Boolean, default: false },
      wheelchair: { type: Boolean, default: false },
      genderRestriction: { type: String, enum: ['none', 'male', 'female'], default: 'none' },
    },
    location: {
      address: String,
      estate: String,
      city: String,
      county: String,
      country: { type: String, default: 'Kenya' },
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }, // Made optional - will be auto-populated from university if not provided
      },
    },
    media: {
      images: [{ url: String, publicId: String, caption: String, isPrimary: Boolean }],
      videos: [{ url: String, publicId: String, caption: String }],
      virtualTour: String,
      tour360: String,
    },
    availabilityCalendar: [availabilityEntrySchema],
    houseRules: [{ type: String, trim: true }],
    verification: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: String,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'suspended'],
      default: 'draft',
      index: true,
    },
    views: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    nearbyFacilities: [
      {
        name: String,
        type: { type: String },
        distanceMeters: Number,
        walkingMinutes: Number,
      },
    ],
    emergencyContacts: [{ name: String, phone: String, relation: String }],
    featured: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    imageHashes: [String],
    fraudScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ title: 'text', description: 'text', 'location.estate': 'text' });
propertySchema.index({ university: 1, status: 1, rent: 1 });
propertySchema.index({ featured: -1, publishedAt: -1 });

propertySchema.virtual('primaryImage').get(function primaryImage() {
  const primary = this.media?.images?.find((img) => img.isPrimary);
  return primary?.url || this.media?.images?.[0]?.url || null;
});

propertySchema.virtual('monthlyTotal').get(function monthlyTotal() {
  return this.rent + (this.deposit > 0 ? 0 : 0);
});

propertySchema.pre('validate', function setSlug(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    const base = slugify(this.title);
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  next();
});

propertySchema.methods.incrementViews = async function incrementViews() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

propertySchema.methods.isAvailableOn = function isAvailableOn(date) {
  const entry = this.availabilityCalendar.find(
    (e) => e.date.toDateString() === new Date(date).toDateString()
  );
  if (entry) return entry.available;
  return this.status === 'published';
};

module.exports = mongoose.model('Property', propertySchema);
