/**
 * Poland Domestic Shipping Mock Rates
 * 
 * PORTFOLIO DEMONSTRATION PURPOSES ONLY
 * 
 * This module provides realistic mock shipping rates for Poland domestic shipping
 * when the production shipping API (Shippo) returns no rates. This occurs because
 * Shippo's test mode has geographic limitations and does not support Poland domestic
 * shipping in test environment.
 * 
 * The rates are based on actual carrier pricing research from:
 * - InPost official pricing (parcel lockers and courier services)
 * - Industry price comparison data for Poland domestic shipping
 * - Weight-based pricing models typical for express carriers
 * 
 * Delivery times are calculated dynamically based on geographic distance between
 * sender and recipient locations using the Haversine formula, based on research
 * from Allegro and major Polish carriers' delivery patterns.
 * 
 * This ensures an authentic user experience for portfolio demonstration purposes
 * while maintaining transparency that these are mock rates for development/demo use.
 */

export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

/**
 * Major Polish cities with their coordinates
 * Used for distance-based delivery time calculations
 */
const POLAND_CITIES: Record<string, GeoPoint> = {
  warsaw: { lat: 52.2297, lon: 21.0122 },
  krakow: { lat: 50.0647, lon: 19.9450 },
  gdansk: { lat: 54.3520, lon: 18.6466 },
  wroclaw: { lat: 51.1079, lon: 17.0385 },
  poznan: { lat: 52.4064, lon: 16.9252 },
  lodz: { lat: 51.7592, lon: 19.4560 },
  szczecin: { lat: 53.4285, lon: 14.5530 },
  bydgoszcz: { lat: 53.1235, lon: 18.0084 },
  lublin: { lat: 51.2465, lon: 22.5684 },
  katowice: { lat: 50.2649, lon: 19.0238 },
  bialystok: { lat: 53.1325, lon: 23.1688 },
  gdynia: { lat: 54.5189, lon: 18.5304 },
};

/**
 * Get coordinates for a Polish city
 * 
 * @param city - City name (case-insensitive)
 * @returns GeoPoint coordinates or Warsaw as default
 */
export function getCityCoordinates(city: string): GeoPoint {
  const normalizedCity = city.toLowerCase().replace(/\s+/g, '');
  return POLAND_CITIES[normalizedCity] || POLAND_CITIES.warsaw;
}

export interface ShippingRate {
  provider: string;
  servicelevel: {
    name: string;
  };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * 
 * @param point1 - First geographic point
 * @param point2 - Second geographic point
 * @returns Distance in kilometers
 */
function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  if (point1.lat === point2.lat && point1.lon === point2.lon) {
    return 0;
  }

  const R = 6371000; // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lon - point1.lon) * Math.PI / 180;
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c) / 1000; // Convert to kilometers
}

/**
 * Calculate estimated delivery days based on distance and carrier type
 * 
 * Based on research from Allegro and Polish carriers:
 * - Express services (DHL, FedEx): Next day for major cities, 2 days for remote areas
 * - Standard services (UPS, DPD): 1-2 days for nearby areas, 2-3 days for distant areas
 * - Economy services (InPost): 1-2 days typically, up to 3 days for remote areas
 * 
 * @param distanceKm - Distance in kilometers
 * @param carrierType - Type of carrier (express, standard, economy)
 * @returns Estimated delivery days
 */
function calculateDeliveryDays(distanceKm: number, carrierType: 'express' | 'standard' | 'economy'): number {
  if (distanceKm < 100) {
    // Nearby: 1 day for all carriers
    return 1;
  } else if (distanceKm < 300) {
    // Medium distance: Express 1 day, Standard/Economy 2 days
    return carrierType === 'express' ? 1 : 2;
  } else if (distanceKm < 500) {
    // Long distance: Express 2 days, Standard 2 days, Economy 2-3 days
    return carrierType === 'economy' ? 3 : 2;
  } else {
    // Very long distance: Express 2-3 days, Standard 3 days, Economy 3 days
    return carrierType === 'express' ? 2 : 3;
  }
}

/**
 * Get realistic mock shipping rates for Poland domestic shipping
 * 
 * @param parcel - Parcel dimensions and weight
 * @param senderLocation - Sender geographic coordinates
 * @param recipientLocation - Recipient geographic coordinates
 * @returns Array of shipping rate options
 */
export function getPolandDomesticRates(
  parcel: ParcelDimensions,
  senderLocation?: GeoPoint,
  recipientLocation?: GeoPoint
): ShippingRate[] {
  const { length, width, height, weight } = parcel;
  
  // Calculate weight in kg for weight-based carriers
  const weightKg = weight / 1000;

  // Calculate distance if both locations are provided
  let distanceKm = 0;
  if (senderLocation && recipientLocation) {
    distanceKm = calculateDistance(senderLocation, recipientLocation);
  }

  // DHL Express Poland - Premium next-day service
  // Base rate + weight-based pricing (typical for express services)
  const dhlBaseRate = 35.00;
  const dhlWeightRate = Math.ceil(weightKg) * 8.50;
  const dhlRate = Math.round(dhlBaseRate + dhlWeightRate);
  const dhlDays = calculateDeliveryDays(distanceKm, 'express');

  // FedEx Express Poland - Premium next-day service
  // Slightly different pricing structure
  const fedexBaseRate = 32.00;
  const fedexWeightRate = Math.ceil(weightKg) * 7.80;
  const fedexRate = Math.round(fedexBaseRate + fedexWeightRate);
  const fedexDays = calculateDeliveryDays(distanceKm, 'express');

  // UPS Standard Poland - Mid-range service
  // More economical pricing
  const upsBaseRate = 28.00;
  const upsWeightRate = Math.ceil(weightKg) * 5.50;
  const upsRate = Math.round(upsBaseRate + upsWeightRate);
  const upsDays = calculateDeliveryDays(distanceKm, 'standard');

  // InPost Parcel Locker - Economy service
  // Fixed pricing by parcel size (based on actual InPost pricing)
  // Size A (small): up to 80x380x640mm, Size B (medium): up to 190x380x640mm, Size C (large): up to 410x380x640mm
  let inpostRate;
  const volume = length * width * height;
  if (volume <= 80 * 380 * 640) {
    inpostRate = 14.55; // Size A
  } else if (volume <= 190 * 380 * 640) {
    inpostRate = 16.51; // Size B
  } else {
    inpostRate = 21.04; // Size C
  }
  const inpostDays = calculateDeliveryDays(distanceKm, 'economy');

  // DPD Poland Classic - Popular mid-range service
  // Weight-based pricing (based on actual DPD pricing)
  const dpdBaseRate = 22.00;
  const dpdWeightRate = Math.ceil(weightKg) * 4.20;
  const dpdRate = Math.round(dpdBaseRate + dpdWeightRate);
  const dpdDays = calculateDeliveryDays(distanceKm, 'standard');

  return [
    {
      provider: 'DHL',
      servicelevel: {
        name: 'DHL Express Domestic',
      },
      rateId: 'mock_dhl_pl_domestic',
      amount: dhlRate,
      currency: 'PLN',
      estimatedDays: dhlDays,
    },
    {
      provider: 'FedEx',
      servicelevel: {
        name: 'FedEx Express Domestic',
      },
      rateId: 'mock_fedex_pl_domestic',
      amount: fedexRate,
      currency: 'PLN',
      estimatedDays: fedexDays,
    },
    {
      provider: 'UPS',
      servicelevel: {
        name: 'UPS Standard Poland',
      },
      rateId: 'mock_ups_pl_standard',
      amount: upsRate,
      currency: 'PLN',
      estimatedDays: upsDays,
    },
    {
      provider: 'InPost',
      servicelevel: {
        name: 'InPost Parcel Locker',
      },
      rateId: 'mock_inpost_locker',
      amount: inpostRate,
      currency: 'PLN',
      estimatedDays: inpostDays,
    },
    {
      provider: 'DPD',
      servicelevel: {
        name: 'DPD Classic Poland',
      },
      rateId: 'mock_dpd_pl_classic',
      amount: dpdRate,
      currency: 'PLN',
      estimatedDays: dpdDays,
    },
  ];
}
