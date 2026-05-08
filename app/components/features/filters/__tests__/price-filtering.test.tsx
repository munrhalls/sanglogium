import { describe, it, expect } from 'vitest';
import { centsToDisplay, displayToCents } from '@/lib/utils/price';

describe('price filtering conversion', () => {
  describe('backend to frontend conversion', () => {
    it('should convert cents from backend to dollars for slider display', () => {
      // Backend returns price range in cents (from price_data.unit_amount)
      const backendPriceRange = {
        minPrice: 1999,  // $19.99 in cents
        maxPrice: 9999,  // $99.99 in cents
      };

      // Frontend should convert to dollars for slider
      const sliderMin = centsToDisplay(backendPriceRange.minPrice);
      const sliderMax = centsToDisplay(backendPriceRange.maxPrice);

      expect(sliderMin).toBe(19.99);
      expect(sliderMax).toBe(99.99);
    });
  });

  describe('frontend to backend conversion', () => {
    it('should convert dollars from slider to cents for URL storage', () => {
      // User sets price range in dollars via slider
      const sliderRange = {
        min: 20,    // $20
        max: 100,   // $100
      };

      // URL should store in cents for FilterBuilder (which uses price_data.unit_amount)
      const urlMin = displayToCents(sliderRange.min);
      const urlMax = displayToCents(sliderRange.max);

      expect(urlMin).toBe(2000);
      expect(urlMax).toBe(10000);
    });
  });

  describe('active filters display', () => {
    it('should convert cents from URL to dollars for display', () => {
      // URL stores price filter in cents
      const urlFilterValue = '2000'; // 2000 cents = $20

      // Display should show in dollars
      const cents = parseInt(urlFilterValue, 10);
      const displayDollars = centsToDisplay(cents);

      expect(displayDollars).toBe(20);
    });
  });
});
