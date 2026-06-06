/**
 * Parcel Calculator Utility
 * 
 * Calculates shipping packages based on basket items and product dimensions.
 * Handles quantity aggregation and parcel splitting based on courier limits.
 * 
 * @param basketItems - Array of { productId, quantity } from session
 * @param sanityProducts - Array of Product objects with parcel data
 * @returns Array of packages for shipping API (weight in kg, dimensions in cm)
 */

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface ProductWithParcel {
  _id: string;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export interface BasketReservationItem {
  _id: string;
  quantity: number;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export interface Package {
  weight: number; // kg
  width: number; // cm
  height: number; // cm
  length: number; // cm
}

// Fallback for products missing parcel data in Sanity (audio equipment typical dimensions)
export const DEFAULT_PARCEL = {
  weight: 500, // grams
  width: 20, // cm
  height: 15, // cm
  length: 25, // cm
};

// Courier physical limits
const MAX_WEIGHT_G = 25000; // 25kg max per package
const MAX_VOLUME_CM3 = 99000; // 99,000 cm³ max per package

export function calculatePackages(
  basketItems: BasketItem[],
  sanityProducts: ProductWithParcel[]
): Package[] {
  // Create product lookup map
  const productMap = new Map(sanityProducts.map(p => [p._id, p]));

  // Aggregate total weight and volume
  let totalWeight = 0; // grams
  let totalVolume = 0; // cm³
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  for (const item of basketItems) {
    const product = productMap.get(item.productId);
    const parcel = product?.parcel ?? DEFAULT_PARCEL;

    if (!product?.parcel) {
      console.warn(`[PARCEL CALC] Product ${item.productId} missing parcel data, using DEFAULT_PARCEL`);
    }

    totalWeight += parcel.weight * item.quantity;
    totalVolume += parcel.length * parcel.width * parcel.height * item.quantity;
    maxLength = Math.max(maxLength, parcel.length);
    maxWidth = Math.max(maxWidth, parcel.width);
    maxHeight = Math.max(maxHeight, parcel.height);
  }

  // Guard: no valid parcel data found
  if (totalWeight === 0 && totalVolume === 0) {
    console.warn('[PARCEL CALC] No valid parcel data for any basket item');
    return [];
  }

  // Calculate number of parcels needed
  const parcelsByWeight = Math.ceil(totalWeight / MAX_WEIGHT_G);
  const parcelsByVolume = Math.ceil(totalVolume / MAX_VOLUME_CM3);
  const numParcels = Math.max(parcelsByWeight, parcelsByVolume, 1);

  // If only one parcel, return aggregated dimensions
  if (numParcels === 1) {
    return [{
      weight: totalWeight / 1000, // convert grams to kg
      width: maxWidth,
      height: maxHeight,
      length: maxLength,
    }];
  }

  // Split into multiple parcels
  const parcelsPerSplit = Math.ceil(basketItems.length / numParcels);
  const packages: Package[] = [];

  for (let i = 0; i < numParcels; i++) {
    const startIdx = i * parcelsPerSplit;
    const endIdx = Math.min(startIdx + parcelsPerSplit, basketItems.length);
    const subset = basketItems.slice(startIdx, endIdx);

    let splitWeight = 0;
    let splitMaxLength = 0;
    let splitMaxWidth = 0;
    let splitMaxHeight = 0;

    for (const item of subset) {
      const product = productMap.get(item.productId);
      if (product?.parcel) {
        splitWeight += product.parcel.weight * item.quantity;
        splitMaxLength = Math.max(splitMaxLength, product.parcel.length);
        splitMaxWidth = Math.max(splitMaxWidth, product.parcel.width);
        splitMaxHeight = Math.max(splitMaxHeight, product.parcel.height);
      }
    }

    packages.push({
      weight: splitWeight / 1000, // convert grams to kg
      width: splitMaxWidth,
      height: splitMaxHeight,
      length: splitMaxLength,
    });
  }

  // Filter out empty packages (can happen when splitting single-item baskets)
  return packages.filter(pkg => pkg.weight > 0);
}

/**
 * Overload for basketReservation structure (parcel data embedded)
 * Used by app/api/shipping/rates/route.ts
 */
export function calculatePackagesFromReservation(
  basketReservation: BasketReservationItem[]
): Package[] {
  // Aggregate total weight and volume
  let totalWeight = 0; // grams
  let totalVolume = 0; // cm³
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  for (const item of basketReservation) {
    const parcel = item.parcel ?? DEFAULT_PARCEL;

    if (!item.parcel) {
      console.warn(`[PARCEL CALC] Product ${item._id} missing parcel data, using DEFAULT_PARCEL`);
    }

    totalWeight += parcel.weight * item.quantity;
    totalVolume += parcel.length * parcel.width * parcel.height * item.quantity;
    maxLength = Math.max(maxLength, parcel.length);
    maxWidth = Math.max(maxWidth, parcel.width);
    maxHeight = Math.max(maxHeight, parcel.height);
  }

  // Guard: no valid parcel data found
  if (totalWeight === 0 && totalVolume === 0) {
    console.warn('[PARCEL CALC] No valid parcel data for any basket reservation item');
    return [];
  }

  // Calculate number of parcels needed
  const parcelsByWeight = Math.ceil(totalWeight / MAX_WEIGHT_G);
  const parcelsByVolume = Math.ceil(totalVolume / MAX_VOLUME_CM3);
  const numParcels = Math.max(parcelsByWeight, parcelsByVolume, 1);

  // If only one parcel, return aggregated dimensions
  if (numParcels === 1) {
    return [{
      weight: totalWeight / 1000, // convert grams to kg
      width: maxWidth,
      height: maxHeight,
      length: maxLength,
    }];
  }

  // Split into multiple parcels
  const parcelsPerSplit = Math.ceil(basketReservation.length / numParcels);
  const packages: Package[] = [];

  for (let i = 0; i < numParcels; i++) {
    const startIdx = i * parcelsPerSplit;
    const endIdx = Math.min(startIdx + parcelsPerSplit, basketReservation.length);
    const subset = basketReservation.slice(startIdx, endIdx);

    let splitWeight = 0;
    let splitMaxLength = 0;
    let splitMaxWidth = 0;
    let splitMaxHeight = 0;

    for (const item of subset) {
      if (item.parcel) {
        splitWeight += item.parcel.weight * item.quantity;
        splitMaxLength = Math.max(splitMaxLength, item.parcel.length);
        splitMaxWidth = Math.max(splitMaxWidth, item.parcel.width);
        splitMaxHeight = Math.max(splitMaxHeight, item.parcel.height);
      }
    }

    packages.push({
      weight: splitWeight / 1000, // convert grams to kg
      width: splitMaxWidth,
      height: splitMaxHeight,
      length: splitMaxLength,
    });
  }

  // Filter out empty packages (can happen when splitting single-item baskets)
  return packages.filter(pkg => pkg.weight > 0);
}
