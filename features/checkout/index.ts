// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export type { Address, Status, ServerResponse, ServerProduct, BasketCheckoutItem } from './domain/checkoutTypes';
export { calculatePackages, calculatePackagesFromReservation, DEFAULT_PARCEL } from './domain/parcelCalculator';
export { detectCountry } from './domain/countryDetector';
