import { describe, it, expect } from 'vitest';
import { centsToDisplay } from '@/lib/utils/price';

describe('product price display', () => {
  it('should convert price_data.unit_amount to display price', () => {
    // Simulate product with price_data from Sanity
    const product = {
      price_data: {
        currency: 'usd',
        unit_amount: 1999, // $19.99 in cents
      },
    };

    const displayPrice = centsToDisplay(product.price_data.unit_amount);
    expect(displayPrice).toBe(19.99);
  });

  it('should handle various price points', () => {
    const testCases = [
      { unit_amount: 999, expected: 9.99 },    // $9.99
      { unit_amount: 4999, expected: 49.99 },  // $49.99
      { unit_amount: 10000, expected: 100 },    // $100.00
      { unit_amount: 150, expected: 1.5 },      // $1.50
    ];

    testCases.forEach(({ unit_amount, expected }) => {
      expect(centsToDisplay(unit_amount)).toBe(expected);
    });
  });
});
