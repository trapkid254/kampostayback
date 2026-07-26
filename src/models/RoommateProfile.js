'use strict';

const mongoose = require('mongoose');

const roommateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', index: true },
    bio: { type: String, maxlength: 1000 },
    budget: { min: Number, max: Number, currency: { type: String, default: 'KES' } },
    preferredLocation: String,
    moveInDate: Date,
    lifestyle: {
      sleepSchedule: { type: String, enum: ['early_bird', 'night_owl', 'flexible'], default: 'flexible' },
      cleanliness: { type: Number, min: 1, max: 5, default: 3 },
      noiseTolerance: { type: Number, min: 1, max: 5, default: 3 },
      smoking: { type: String, enum: ['no', 'outside_only', 'yes'], default: 'no' },
      drinking: { type: String, enum: ['no', 'social', 'yes'], default: 'no' },
      guests: { type: String, enum: ['rarely', 'sometimes', 'often'], default: 'sometimes' },
      cooking: { type: String, enum: ['rarely', 'sometimes', 'often'], default: 'sometimes' },
      studyHabits: { type: String, enum: ['quiet', 'moderate', 'social'], default: 'moderate' },
      pets: { type: Boolean, default: false },
      religion: String,
    },
    preferences: {
      gender: { type: String, enum: ['any', 'male', 'female'], default: 'any' },
      ageRange: { min: Number, max: Number },
      sameUniversity: { type: Boolean, default: true },
      sameCourse: { type: Boolean, default: false },
    },
    interests: [String],
    course: String,
    yearOfStudy: { type: Number, min: 1, max: 8 },
    isActive: { type: Boolean, default: true, index: true },
    matchCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roommateProfileSchema.methods.calculateCompatibility = function calculateCompatibility(other) {
  if (!other) return 0;
  let score = 50;
  const weights = {
    sleepSchedule: 15,
    cleanliness: 12,
    noiseTolerance: 10,
    smoking: 15,
    drinking: 8,
    guests: 8,
    cooking: 5,
    studyHabits: 12,
    pets: 10,
    budget: 15,
  };

  const ls = this.lifestyle || {};
  const ol = other.lifestyle || {};

  if (ls.sleepSchedule === ol.sleepSchedule) score += weights.sleepSchedule;
  else if (ls.sleepSchedule === 'flexible' || ol.sleepSchedule === 'flexible') score += weights.sleepSchedule * 0.5;

  const cleanDiff = Math.abs((ls.cleanliness || 3) - (ol.cleanliness || 3));
  score += weights.cleanliness * (1 - cleanDiff / 4);

  const noiseDiff = Math.abs((ls.noiseTolerance || 3) - (ol.noiseTolerance || 3));
  score += weights.noiseTolerance * (1 - noiseDiff / 4);

  if (ls.smoking === ol.smoking) score += weights.smoking;
  else if (ls.smoking === 'outside_only' || ol.smoking === 'outside_only') score += weights.smoking * 0.3;

  if (ls.drinking === ol.drinking) score += weights.drinking;
  if (ls.guests === ol.guests) score += weights.guests;
  else score += weights.guests * 0.5;

  if (ls.cooking === ol.cooking) score += weights.cooking;
  if (ls.studyHabits === ol.studyHabits) score += weights.studyHabits;

  if (ls.pets === ol.pets) score += weights.pets;
  else score -= weights.pets * 0.5;

  const myBudget = this.budget || {};
  const otherBudget = other.budget || {};
  if (myBudget.max && otherBudget.max) {
    const overlap = Math.min(myBudget.max, otherBudget.max) - Math.max(myBudget.min || 0, otherBudget.min || 0);
    if (overlap > 0) score += weights.budget;
    else score -= weights.budget * 0.5;
  }

  const sharedInterests = (this.interests || []).filter((i) => (other.interests || []).includes(i));
  score += Math.min(sharedInterests.length * 3, 15);

  if (this.university?.toString() === other.university?.toString()) score += 10;

  return Math.max(0, Math.min(100, Math.round(score)));
};

roommateProfileSchema.methods.parseNaturalLanguagePreferences = function parseNaturalLanguagePreferences(text) {
  const lower = String(text || '').toLowerCase();
  const hints = {};

  if (/quiet|silent|peaceful/.test(lower)) hints.studyHabits = 'quiet';
  if (/party|social|outgoing/.test(lower)) hints.studyHabits = 'social';
  if (/early|morning person/.test(lower)) hints.sleepSchedule = 'early_bird';
  if (/night owl|late night/.test(lower)) hints.sleepSchedule = 'night_owl';
  if (/non.?smok|no smok/.test(lower)) hints.smoking = 'no';
  if (/clean|tidy|neat/.test(lower)) hints.cleanliness = 5;
  if (/budget|cheap|affordable|ksh|kes/.test(lower)) {
    const match = lower.match(/(\d{3,6})/);
    if (match) hints.budgetMax = parseInt(match[1], 10);
  }

  return hints;
};

module.exports = mongoose.model('RoommateProfile', roommateProfileSchema);
