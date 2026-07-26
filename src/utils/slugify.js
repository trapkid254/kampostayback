'use strict';

const slugifyLib = require('slugify');

function slugify(text, options = {}) {
  return slugifyLib(String(text || ''), {
    lower: true,
    strict: true,
    trim: true,
    ...options,
  });
}

function uniqueSlug(base, suffix) {
  const baseSlug = slugify(base);
  if (!suffix) return baseSlug;
  return `${baseSlug}-${suffix}`;
}

module.exports = { slugify, uniqueSlug };
