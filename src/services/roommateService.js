'use strict';

const RoommateProfile = require('../models/RoommateProfile');
const AppError = require('../utils/AppError');

async function getOrCreateProfile(userId) {
  let profile = await RoommateProfile.findOne({ user: userId }).populate('university', 'name slug');
  return profile;
}

async function upsertProfile(userId, data) {
  const profile = await RoommateProfile.findOneAndUpdate(
    { user: userId },
    { ...data, user: userId },
    { upsert: true, new: true, runValidators: true }
  ).populate('university', 'name slug');
  return profile;
}

async function findMatches(userId, options = {}) {
  const myProfile = await RoommateProfile.findOne({ user: userId }).populate('university');
  if (!myProfile) throw new AppError('Create a roommate profile first.', 404);

  const query = { user: { $ne: userId }, isActive: true };
  if (myProfile.university && options.sameUniversity !== false) {
    query.university = myProfile.university._id;
  }
  if (options.gender && options.gender !== 'any') {
    query['preferences.gender'] = { $in: [options.gender, 'any'] };
  }

  const candidates = await RoommateProfile.find(query)
    .populate('user', 'profile email verification')
    .populate('university', 'name slug')
    .limit(100);

  const matches = candidates
    .map((candidate) => ({
      profile: candidate,
      compatibilityScore: myProfile.calculateCompatibility(candidate),
      sharedInterests: (myProfile.interests || []).filter((i) =>
        (candidate.interests || []).includes(i)
      ),
    }))
    .filter((m) => m.compatibilityScore >= (options.minScore || 50))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const limit = options.limit || 20;
  return matches.slice(0, limit);
}

async function compareProfiles(userId, targetUserId) {
  const [myProfile, theirProfile] = await Promise.all([
    RoommateProfile.findOne({ user: userId }),
    RoommateProfile.findOne({ user: targetUserId }).populate('user', 'profile'),
  ]);

  if (!myProfile || !theirProfile) throw new AppError('Profile not found.', 404);

  return {
    compatibilityScore: myProfile.calculateCompatibility(theirProfile),
    myProfile,
    theirProfile,
  };
}

module.exports = { getOrCreateProfile, upsertProfile, findMatches, compareProfiles };
