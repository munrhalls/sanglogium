/**
 * Performance tests for critical e-commerce pages.
 *
 * Run: npx playwright test tests/e2e/performance/ --project=desktop-chromium
 *
 * These are synthetic (lab) tests for regression prevention.
 * Real user monitoring (RUM) via WebVitals component is the source of truth.
 */
import { test, expect } from '@playwright/test';
import { measureWebVitals, THRESHOLDS } from '@/tests/helpers/performance';

test.describe('Performance - Critical Pages', () => {
  test('homepage Core Web Vitals', async ({ page }) => {
    const metrics = await measureWebVitals(page, '/');

    console.log('Homepage vitals:', JSON.stringify(metrics));

    if (metrics.lcp !== null) {
      expect(metrics.lcp, 'LCP should be under 2.5s').toBeLessThan(THRESHOLDS.LCP);
    }
    if (metrics.fcp !== null) {
      expect(metrics.fcp, 'FCP should be under 1.8s').toBeLessThan(THRESHOLDS.FCP);
    }
    if (metrics.ttfb !== null) {
      expect(metrics.ttfb, 'TTFB should be under 800ms').toBeLessThan(THRESHOLDS.TTFB);
    }
    if (metrics.cls !== null) {
      expect(metrics.cls, 'CLS should be under 0.1').toBeLessThan(THRESHOLDS.CLS);
    }
  });

  test('product detail page Core Web Vitals', async ({ page }) => {
    const metrics = await measureWebVitals(page, '/product/test-64-audio-premium-pearl-cable-3-5mm');

    console.log('PDP vitals:', JSON.stringify(metrics));

    if (metrics.lcp !== null) {
      expect(metrics.lcp, 'LCP should be under 2.5s').toBeLessThan(THRESHOLDS.LCP);
    }
    if (metrics.fcp !== null) {
      expect(metrics.fcp, 'FCP should be under 1.8s').toBeLessThan(THRESHOLDS.FCP);
    }
    if (metrics.ttfb !== null) {
      expect(metrics.ttfb, 'TTFB should be under 800ms').toBeLessThan(THRESHOLDS.TTFB);
    }
    if (metrics.cls !== null) {
      expect(metrics.cls, 'CLS should be under 0.1').toBeLessThan(THRESHOLDS.CLS);
    }
  });

  test('category listing page Core Web Vitals', async ({ page }) => {
    const metrics = await measureWebVitals(page, '/products/headphones');

    console.log('Category vitals:', JSON.stringify(metrics));

    if (metrics.lcp !== null) {
      expect(metrics.lcp, 'LCP should be under 2.5s').toBeLessThan(THRESHOLDS.LCP);
    }
    if (metrics.fcp !== null) {
      expect(metrics.fcp, 'FCP should be under 1.8s').toBeLessThan(THRESHOLDS.FCP);
    }
    if (metrics.ttfb !== null) {
      expect(metrics.ttfb, 'TTFB should be under 800ms').toBeLessThan(THRESHOLDS.TTFB);
    }
    if (metrics.cls !== null) {
      expect(metrics.cls, 'CLS should be under 0.1').toBeLessThan(THRESHOLDS.CLS);
    }
  });
});
