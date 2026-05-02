/**
 * Price utility functions
 */

/**
 * Convert cents to display price (dollars)
 * @param cents - Price in cents (e.g., 1999 for $19.99)
 * @returns Price in dollars (e.g., 19.99)
 */
export function centsToDisplay(cents: number): number {
  return cents / 100;
}

/**
 * Convert display price (dollars) to cents
 * @param dollars - Price in dollars (e.g., 19.99)
 * @returns Price in cents (e.g., 1999)
 */
export function displayToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
