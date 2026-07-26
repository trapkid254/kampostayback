'use strict';

const mongoose = require('mongoose');
const Property = require('../models/Property');
const University = require('../models/University');
const AppError = require('../utils/AppError');
const { haversineDistanceKm, estimateWalkingTimeMinutes } = require('../utils/geo');
const fraudService = require('./fraudService');
const { slugify } = require('../utils/slugify');

function buildFilterQuery(filters = {}) {
  const query = {};
  if (filters.status && filters.status !== 'all' && filters.status !== '*') {
    query.status = filters.status;
  } else if (!filters.status) {
    query.status = 'published';
  }

  if (filters.university) query.university = filters.university;
  if (filters.landlord) query.landlord = filters.landlord;
  if (filters.roomType) query.roomType = filters.roomType;
  if (filters.featured !== undefined) query.featured = filters.featured === true || filters.featured === 'true';
  if (filters.verificationStatus) query['verification.status'] = filters.verificationStatus;
  if (filters.verified === true || filters.verified === 'true') {
    query['verification.status'] = 'verified';
  }

  if (filters.minRent || filters.maxRent) {
    query.rent = {};
    if (filters.minRent) query.rent.$gte = Number(filters.minRent);
    if (filters.maxRent) query.rent.$lte = Number(filters.maxRent);
  }

  if (filters.maxWalkingMinutes) {
    query.walkingTimeMinutes = { $lte: Number(filters.maxWalkingMinutes) };
  }

  const amenityMap = {
    wifi: 'amenities.wifi',
    water: 'amenities.water',
    furnished: 'amenities.furnished',
    parking: 'amenities.parking',
    laundry: 'amenities.laundry',
    kitchen: 'amenities.kitchen',
    pets: 'amenities.pets',
    wheelchair: 'amenities.wheelchair',
  };

  Object.entries(amenityMap).forEach(([key, path]) => {
    if (filters[key] === true || filters[key] === 'true') query[path] = true;
  });

  if (filters.electricityType) query['amenities.electricityType'] = filters.electricityType;
  if (filters.genderRestriction && filters.genderRestriction !== 'none') {
    query['amenities.genderRestriction'] = { $in: [filters.genderRestriction, 'none'] };
  }

  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  return query;
}

async function searchProperties(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 12));
  const skip = (page - 1) * limit;

  let query = buildFilterQuery(filters);
  let sort = filters.sort || '-featured,-publishedAt';
  let useGeo = false;

  if (filters.lat && filters.lng) {
    const maxDistanceKm = parseFloat(filters.maxDistanceKm) || 5;
    useGeo = true;
    query = {
      ...query,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(filters.lng), parseFloat(filters.lat)],
          },
          $maxDistance: maxDistanceKm * 1000,
        },
      },
    };
  } else if (filters.university && filters.maxDistanceKm) {
    const uni = await University.findById(filters.university);
    if (uni?.location?.coordinates?.coordinates) {
      const [lng, lat] = uni.location.coordinates.coordinates;
      useGeo = true;
      query = {
        ...query,
        'location.coordinates': {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: parseFloat(filters.maxDistanceKm) * 1000,
          },
        },
      };
    }
  }

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate('university', 'name slug location')
      .populate('landlord', 'profile.firstName profile.lastName verification.adminApproved')
      .sort(useGeo ? undefined : sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(query),
  ]);

  if (filters.lat && filters.lng) {
    properties.forEach((p) => {
      const [plng, plat] = p.location?.coordinates?.coordinates || [];
      if (plat && plng) {
        const dist = haversineDistanceKm(parseFloat(filters.lat), parseFloat(filters.lng), plat, plng);
        p._distanceKm = Math.round(dist * 100) / 100;
        p._walkingMinutes = estimateWalkingTimeMinutes(dist);
      }
    });
  }

  return {
    properties,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getPropertyById(id, userId) {
  const property = await Property.findById(id)
    .populate('university', 'name slug location logo')
    .populate('landlord', 'profile email verification');

  if (!property) throw new AppError('Property not found.', 404);

  property.impressions += 1;
  await property.save({ validateBeforeSave: false });

  return property;
}

async function getPropertyBySlug(slug, incrementView = true) {
  const property = await Property.findOne({ slug })
    .populate('university', 'name slug location logo')
    .populate('landlord', 'profile verification');

  if (!property) throw new AppError('Property not found.', 404);
  if (incrementView) await property.incrementViews();
  return property;
}

async function createProperty(landlordId, data) {
  // Resolve university when a string (e.g., "JKUAT" or a name) is provided
  if (data.university && typeof data.university === 'string') {
    if (!mongoose.isValidObjectId(data.university)) {
      const lookup = String(data.university).trim();
      const uniSlug = slugify(lookup);
      let uni = await University.findOne({ $or: [{ slug: uniSlug }, { name: lookup }, { aliases: lookup }] });
      if (!uni) {
        uni = await University.create({ name: lookup });
      }
      data.university = uni._id;
    }
  }

  const fraudCheck = await fraudService.analyzeListing(data, landlordId);
  const property = await Property.create({
    ...data,
    landlord: landlordId,
    fraudScore: fraudCheck.score,
    verification: { status: fraudCheck.score > 60 ? 'pending' : 'pending' },
  });
  return Property.findById(property._id).populate('university', 'name slug');
}

async function updateProperty(id, landlordId, data, isAdmin = false) {
  const property = await Property.findById(id);
  if (!property) throw new AppError('Property not found.', 404);
  if (!isAdmin && property.landlord.toString() !== landlordId.toString()) {
    throw new AppError('Not authorized to update this property.', 403);
  }

  Object.assign(property, data);
  if (data.status === 'published' && !property.publishedAt) {
    property.publishedAt = new Date();
  }

  const fraudCheck = await fraudService.analyzeListing(property.toObject(), landlordId);
  property.fraudScore = fraudCheck.score;

  await property.save();
  return property.populate('university', 'name slug');
}

async function deleteProperty(id, landlordId, isAdmin = false) {
  const property = await Property.findById(id);
  if (!property) throw new AppError('Property not found.', 404);
  if (!isAdmin && property.landlord.toString() !== landlordId.toString()) {
    throw new AppError('Not authorized.', 403);
  }
  property.status = 'archived';
  await property.save();
  return property;
}

async function getFeatured(limit = 6) {
  return Property.find({ status: 'published', featured: true })
    .populate('university', 'name slug')
    .sort('-publishedAt')
    .limit(limit);
}

async function getSimilar(propertyId, limit = 4) {
  const property = await Property.findById(propertyId);
  if (!property) return [];

  return Property.find({
    _id: { $ne: propertyId },
    university: property.university,
    status: 'published',
    roomType: property.roomType,
    rent: { $gte: property.rent * 0.7, $lte: property.rent * 1.3 },
  })
    .limit(limit)
    .populate('university', 'name slug');
}

module.exports = {
  searchProperties,
  getPropertyById,
  getPropertyBySlug,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeatured,
  getSimilar,
  buildFilterQuery,
};
