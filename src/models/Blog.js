'use strict';

const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },
    coverImage: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, index: true },
    tags: [{ type: String, trim: true }],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    readTimeMinutes: { type: Number, default: 5 },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

blogSchema.pre('validate', function setSlug(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = slugify(this.title);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
