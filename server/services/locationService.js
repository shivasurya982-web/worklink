const { calculateDistance } = require('../utils/helpers');

class LocationService {
  /**
   * Find workers within a radius using coordinates
   * Uses simple distance calculation (for production, use MongoDB $geoNear)
   */
  static filterByDistance(workers, lat, lng, maxDistance = 50) {
    if (!lat || !lng) return workers;

    return workers
      .map((worker) => {
        const workerCoords = worker.address?.coordinates?.coordinates;
        if (!workerCoords || (workerCoords[0] === 0 && workerCoords[1] === 0)) {
          return { ...worker, distance: null };
        }

        const distance = calculateDistance(lat, lng, workerCoords[1], workerCoords[0]);
        return { ...worker, distance };
      })
      .filter((worker) => worker.distance === null || worker.distance <= maxDistance)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }

  /**
   * Estimate travel time based on distance
   * Rough estimate: 30 km/h average urban speed
   */
  static estimateTravelTime(distanceKm) {
    if (!distanceKm) return null;
    const minutes = Math.round((distanceKm / 30) * 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  }

  /**
   * Check if worker is within their service radius of the customer
   */
  static isWithinServiceRadius(worker, customerLat, customerLng) {
    const workerCoords = worker.address?.coordinates?.coordinates;
    if (!workerCoords || !customerLat || !customerLng) return true; // Default to true if no location

    const distance = calculateDistance(customerLat, customerLng, workerCoords[1], workerCoords[0]);
    return distance <= (worker.serviceRadius || 10);
  }
}

module.exports = LocationService;
