'use strict';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function estimateWalkingTimeMinutes(distanceKm, walkingSpeedKmh = 5) {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / walkingSpeedKmh;
  return Math.max(1, Math.round(hours * 60));
}

function formatDistanceKm(distanceKm) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

function buildGeoNearQuery(longitude, latitude, maxDistanceKm) {
  return {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: maxDistanceKm * 1000,
      },
    },
  };
}

module.exports = {
  haversineDistanceKm,
  estimateWalkingTimeMinutes,
  formatDistanceKm,
  buildGeoNearQuery,
  EARTH_RADIUS_KM,
};
