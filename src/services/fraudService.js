'use strict';

const Property = require('../models/Property');
const Report = require('../models/Report');
const User = require('../models/User');

const MARKET_RATES = {
  single: { min: 3000, max: 25000 },
  shared: { min: 2000, max: 12000 },
  bedsitter: { min: 4000, max: 18000 },
  one_bedroom: { min: 8000, max: 35000 },
  studio: { min: 6000, max: 25000 },
  hostel_bed: { min: 1500, max: 8000 },
  two_bedroom: { min: 12000, max: 50000 },
};

async function analyzeListing(data, landlordId) {
  const flags = [];
  let score = 0;

  const rent = data.rent || 0;
  const roomType = data.roomType || 'single';
  const market = MARKET_RATES[roomType] || MARKET_RATES.single;

  if (rent < market.min * 0.3) {
    score += 35;
    flags.push({ type: 'unrealistic_low_price', severity: 'high', message: `Rent KSh ${rent} is unusually low for ${roomType}` });
  }
  if (rent > market.max * 2) {
    score += 20;
    flags.push({ type: 'unrealistic_high_price', severity: 'medium', message: `Rent KSh ${rent} is unusually high for ${roomType}` });
  }

  if (landlordId) {
    const duplicateQuery = {
      landlord: landlordId,
      status: { $in: ['published', 'draft'] },
      rent,
      roomType,
    };
    if (data.location?.estate) duplicateQuery['location.estate'] = data.location.estate;
    if (data._id) duplicateQuery._id = { $ne: data._id };

    const duplicates = await Property.countDocuments(duplicateQuery);
    if (duplicates > 0) {
      score += 25;
      flags.push({ type: 'duplicate_listing', severity: 'medium', message: 'Similar listing already exists' });
    }

    const landlordReports = await Report.countDocuments({
      reportedUser: landlordId,
      status: { $in: ['open', 'investigating'] },
    });
    if (landlordReports > 0) {
      score += landlordReports * 15;
      flags.push({ type: 'reported_landlord', severity: 'high', message: `${landlordReports} open report(s) against landlord` });
    }

    const landlordListings = await Property.countDocuments({ landlord: landlordId, status: 'published' });
    if (landlordListings > 20) {
      score += 10;
      flags.push({ type: 'excessive_listings', severity: 'low', message: 'Landlord has many active listings' });
    }
  }

  const images = data.media?.images || [];
  if (images.length === 0) {
    score += 15;
    flags.push({ type: 'no_images', severity: 'medium', message: 'Listing has no photos' });
  }

  if (data.imageHashes?.length) {
    const hashDuplicates = await Property.countDocuments({
      imageHashes: { $in: data.imageHashes },
      _id: { $ne: data._id },
    });
    if (hashDuplicates > 0) {
      score += 30;
      flags.push({ type: 'duplicate_images', severity: 'high', message: 'Images match another listing' });
    }
  }

  const desc = (data.description || '').toLowerCase();
  const scamPhrases = ['wire transfer', 'western union', 'pay before viewing', 'send money first', 'whatsapp only payment'];
  scamPhrases.forEach((phrase) => {
    if (desc.includes(phrase)) {
      score += 25;
      flags.push({ type: 'scam_language', severity: 'critical', message: `Suspicious phrase: "${phrase}"` });
    }
  });

  if (!data.location?.coordinates?.coordinates) {
    score += 10;
    flags.push({ type: 'missing_location', severity: 'medium', message: 'No geo coordinates' });
  }

  score = Math.min(100, score);
  const risk = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  return { score, risk, flags, autoFlag: score >= 70 };
}

async function analyzeUser(userId) {
  const user = await User.findById(userId);
  if (!user) return { score: 0, flags: [] };

  const reports = await Report.countDocuments({ reportedUser: userId });
  const properties = await Property.find({ landlord: userId }).select('fraudScore');
  const avgFraud = properties.length
    ? properties.reduce((s, p) => s + (p.fraudScore || 0), 0) / properties.length
    : 0;

  return {
    score: Math.min(100, reports * 20 + avgFraud),
    reportCount: reports,
    listingCount: properties.length,
    avgListingFraudScore: Math.round(avgFraud),
  };
}

module.exports = { analyzeListing, analyzeUser, MARKET_RATES };
