// Client door: parcel rules, shipping labels and the browser's country detection.

export { calculatePackages, DEFAULT_PARCEL } from './core/rules/parcelCalculator';
export { dedupeShippingLabel } from './core/rules/shippingLabel';
export { detectCountry } from './state/detectCountry';
export type { CountryCode } from './state/detectCountry';
export type { ShippingOption, ShippingRatesInput } from './core/rules/shippingTypes';
