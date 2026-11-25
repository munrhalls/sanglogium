/**
 * Price utility functions
 */

/**
 * Convert cents to display price (zloty)
 * @param cents - Price in cents (e.g., 1999 for PLN 19.99)
 * @returns Price in zloty (e.g., 19.99)
 */
export function centsToDisplay(cents: number): number {
  return cents / 100;
}

/**
 * The single currency + locale the whole storefront and checkout use.
 * Every price shown to a shopper — listing, detail, homepage cards, search,
 * filter chips, basket, checkout, order confirmation, receipt email — must go
 * through the helpers below so the currency and number format never diverge
 * between surfaces.
 */
const STORE_CURRENCY = "PLN";
const STORE_LOCALE = "en-US";

const priceFormatter = new Intl.NumberFormat(STORE_LOCALE, {
  style: "currency",
  currency: STORE_CURRENCY,
  // Whole amounts hide the grosze. Fractional amounts show every grosz.
  // No surface rounds a fractional price to whole units.
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format a price given in minor units (integer cents) — the shape stored in
 * Sanity `price_data.unit_amount` and in Stripe / order amounts.
 */
export function formatPrice(cents: number): string {
  return priceFormatter.format((cents ?? 0) / 100);
}

/**
 * Format a price already expressed in major units (zloty) — e.g. the output
 * of `centsToDisplay`, or price-slider bound values.
 */
export function formatPriceMajor(amount: number): string {
  return priceFormatter.format(amount ?? 0);
}
