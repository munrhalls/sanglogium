import { describe, it, expect } from 'vitest';
import { centsToDisplay, displayToCents } from '../price';

describe('price utility functions', () => {
  describe('centsToDisplay', () => {
    it('should convert cents to dollars', () => {
      expect(centsToDisplay(1999)).toBe(19.99);
      expect(centsToDisplay(100)).toBe(1);
      expect(centsToDisplay(50)).toBe(0.5);
      expect(centsToDisplay(0)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(centsToDisplay(1)).toBe(0.01);
      expect(centsToDisplay(9999)).toBe(99.99);
    });
  });

  describe('displayToCents', () => {
    it('should convert dollars to cents', () => {
      expect(displayToCents(19.99)).toBe(1999);
      expect(displayToCents(1)).toBe(100);
      expect(displayToCents(0.5)).toBe(50);
      expect(displayToCents(0)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(displayToCents(0.01)).toBe(1);
      expect(displayToCents(99.99)).toBe(9999);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain precision through round-trip', () => {
      expect(displayToCents(centsToDisplay(1999))).toBe(1999);
      expect(displayToCents(centsToDisplay(100))).toBe(100);
      expect(displayToCents(centsToDisplay(50))).toBe(50);
    });
  });
});
