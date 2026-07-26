'use strict';

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    value: mongoose.Schema.Types.Mixed,
    type: { type: String, enum: ['string', 'number', 'boolean', 'json'], default: 'string' },
    description: String,
    isPublic: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

settingSchema.statics.get = async function get(key, defaultValue) {
  const setting = await this.findOne({ key });
  if (!setting) return defaultValue;
  return setting.value;
};

settingSchema.statics.set = async function set(key, value, updatedBy) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedBy },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema);
