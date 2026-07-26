'use strict';

const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'wifi', 'security', 'appliance', 'structural', 'other'],
      required: true,
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
      default: 'open',
      index: true,
    },
    photos: [{ url: String, publicId: String }],
    assignedTo: String,
    resolution: String,
    resolvedAt: Date,
    estimatedCost: Number,
    actualCost: Number,
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ landlord: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
