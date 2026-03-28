import { analyzeSemanticMatch, analyzeSemanticMatches, getScoreIndicator, getScoreLabel } from '@/lib/catalogue/semanticMatching';
import { getAllSemanticSlugs } from '@/lib/catalogue/semanticConfig';

describe('Semantic Matching Unit Tests', () => {
  const mockProduct = {
    name: 'Sennheiser HD 600 Open-Back Headphones',
    brand: 'Sennheiser',
    overviewFields: [
      { title: 'Type', value: 'Open-back dynamic headphones' },
      { title: 'Impedance', value: '300 Ohm' }
    ],
    specifications: [
      { title: 'Driver Type', value: 'Dynamic' },
      { title: 'Frequency Response', value: '10Hz - 39,500Hz' }
    ]
  };

  const mockClosedBackProduct = {
    name: 'Beyerdynamic DT 770 Pro Closed-Back Studio Headphones',
    brand: 'Beyerdynamic',
    overviewFields: [
      { title: 'Type', value: 'Closed-back studio headphones' }
    ]
  };

  const mockDacAmpProduct = {
    name: 'Schiit Modi+ Magni+ DAC/Amp Combo',
    brand: 'Schiit',
    overviewFields: [
      { title: 'Type', value: 'DAC and amplifier combo' }
    ]
  };

  const mockEarpadProduct = {
    name: 'Replacement Earpads for HD 600',
    brand: 'Brainwavz',
    overviewFields: [
      { title: 'Compatibility', value: 'Sennheiser HD 600/650' }
    ]
  };

  const mockUnrelatedProduct = {
    name: 'Apple iPhone 15 Pro',
    brand: 'Apple',
    overviewFields: [
      { title: 'Type', value: 'Smartphone' }
    ]
  };

  describe('analyzeSemanticMatch', () => {
    it('should score open-back headphones high for open-back category', () => {
      const result = analyzeSemanticMatch(mockProduct, 'open-back');
      
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.categorySlug).toBe('open-back');
      expect(result.categoryTitle).toBe('Open-Back Headphones');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(getScoreIndicator(result.score)).toBe('✅');
      expect(getScoreLabel(result.score)).toBe('VALID');
    });

    it('should score open-back headphones low for closed-back category', () => {
      const result = analyzeSemanticMatch(mockProduct, 'closed-back');
      
      expect(result.score).toBeLessThan(40);
      expect(result.concerns.length).toBeGreaterThan(0);
      expect(getScoreIndicator(result.score)).toBe('❌');
      expect(getScoreLabel(result.score)).toBe('MISMATCH');
    });

    it('should score closed-back headphones high for closed-back category', () => {
      const result = analyzeSemanticMatch(mockClosedBackProduct, 'closed-back');
      
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(getScoreIndicator(result.score)).toBe('✅');
    });

    it('should score DAC/amp combo high for both dac-amp-combos and desktop-amps categories', () => {
      const dacAmpResult = analyzeSemanticMatch(mockDacAmpProduct, 'dac-amp-combos');
      const desktopAmpResult = analyzeSemanticMatch(mockDacAmpProduct, 'desktop-amps');
      
      expect(dacAmpResult.score).toBeGreaterThanOrEqual(80);
      expect(desktopAmpResult.score).toBeGreaterThanOrEqual(60); // Should be moderate at least
    });

    it('should score earpads high for earpads category', () => {
      const result = analyzeSemanticMatch(mockEarpadProduct, 'earpads');
      
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(getScoreIndicator(result.score)).toBe('✅');
    });

    it('should score unrelated product low for all categories', () => {
      const allSlugs = getAllSemanticSlugs();
      
      for (const slug of allSlugs) {
        const result = analyzeSemanticMatch(mockUnrelatedProduct, slug);
        expect(result.score).toBeLessThan(20);
        expect(getScoreIndicator(result.score)).toBe('❌');
      }
    });

    it('should handle missing semantic rule gracefully', () => {
      const result = analyzeSemanticMatch(mockProduct, 'non-existent-category');
      
      expect(result.score).toBe(0);
      expect(result.reasons).toContain('No semantic rule found for category');
      expect(result.concerns).toContain('Category not configured');
    });

    it('should handle product with minimal data', () => {
      const minimalProduct = {
        name: 'Basic Headphones',
        brand: 'Generic'
      };
      
      const result = analyzeSemanticMatch(minimalProduct, 'open-back');
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should be case insensitive', () => {
      const upperCaseProduct = {
        name: 'OPEN-BACK HEADPHONES',
        brand: 'BRAND'
      };
      
      const result = analyzeSemanticMatch(upperCaseProduct, 'open-back');
      
      expect(result.score).toBeGreaterThanOrEqual(60);
    });

    it('should handle brand matching', () => {
      const result = analyzeSemanticMatch(mockProduct, 'open-back');
      
      // Should mention brand in reasons if brand matches rule
      expect(result.reasons.some(r => r.includes('Brand'))).toBe(true);
    });
  });

  describe('analyzeSemanticMatches', () => {
    it('should analyze multiple products correctly', () => {
      const products = [mockProduct, mockClosedBackProduct, mockDacAmpProduct];
      const summary = analyzeSemanticMatches(products, 'open-back');
      
      expect(summary.categorySlug).toBe('open-back');
      expect(summary.categoryTitle).toBe('Open-Back Headphones');
      expect(summary.totalProducts).toBe(3);
      expect(summary.validMatches).toBe(1); // Only mockProduct should match well
      expect(summary.averageScore).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeLessThanOrEqual(100);
      expect(summary.results).toHaveLength(3);
    });

    it('should handle empty product list', () => {
      const summary = analyzeSemanticMatches([], 'open-back');
      
      expect(summary.totalProducts).toBe(0);
      expect(summary.validMatches).toBe(0);
      expect(summary.moderateMatches).toBe(0);
      expect(summary.invalidMatches).toBe(0);
      expect(summary.averageScore).toBe(0);
      expect(summary.results).toHaveLength(0);
    });

    it('should handle non-existent category', () => {
      const summary = analyzeSemanticMatches([mockProduct], 'non-existent');
      
      expect(summary.categoryTitle).toBe('non-existent');
      expect(summary.invalidMatches).toBe(1);
      expect(summary.averageScore).toBe(0);
    });

    it('should categorize matches correctly', () => {
      const mixedProducts = [
        { ...mockProduct, name: 'Perfect Open-Back Headphones' }, // High score
        { ...mockProduct, name: 'Maybe Open-Back' }, // Moderate score  
        { ...mockProduct, name: 'Wrong Product' } // Low score
      ];
      
      const summary = analyzeSemanticMatches(mixedProducts, 'open-back');
      
      expect(summary.validMatches + summary.moderateMatches + summary.invalidMatches).toBe(3);
      expect(summary.validMatches).toBeGreaterThanOrEqual(1);
      expect(summary.invalidMatches).toBeGreaterThanOrEqual(1);
    });
  });

  describe('utility functions', () => {
    it('should return correct score indicators', () => {
      expect(getScoreIndicator(85)).toBe('✅');
      expect(getScoreIndicator(80)).toBe('✅');
      expect(getScoreIndicator(75)).toBe('⚠️');
      expect(getScoreIndicator(60)).toBe('⚠️');
      expect(getScoreIndicator(59)).toBe('❌');
      expect(getScoreIndicator(0)).toBe('❌');
    });

    it('should return correct score labels', () => {
      expect(getScoreLabel(85)).toBe('VALID');
      expect(getScoreLabel(80)).toBe('VALID');
      expect(getScoreLabel(75)).toBe('MODERATE');
      expect(getScoreLabel(60)).toBe('MODERATE');
      expect(getScoreLabel(59)).toBe('MISMATCH');
      expect(getScoreLabel(0)).toBe('MISMATCH');
    });
  });

  describe('performance tests', () => {
    it('should score 1000 products in under 100ms', async () => {
      const products = Array(1000).fill(mockProduct);
      const start = performance.now();
      
      for (const product of products) {
        analyzeSemanticMatch(product, 'open-back');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      expect(duration).toBeLessThan(100);
    });
  });
});
