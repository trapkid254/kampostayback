'use strict';

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, maxlength: 5000 },
    category: { type: String, default: 'general', index: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
