/**
 * Performance test helpers for Playwright.
 * Measures Core Web Vitals using the Performance API.
 *
 * Usage:
 *   import { measureWebVitals, THRESHOLDS } from '@/tests/helpers/performance';
 *   const metrics = await measureWebVitals(page, '/');
 *   expect(metrics.lcp).toBeLessThan(THRESHOLDS.LCP);
 */
import type { Page } from '@playwright/test';

export const THRESHOLDS = {
  LCP: 2500,
  FCP: 1800,
  TTFB: 800,
  CLS: 0.1,
};

export interface VitalsResult {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  ttfb: number | null;
}

export async function measureWebVitals(page: Page, path: string): Promise<VitalsResult> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');

  const metrics = await page.evaluate(() => {
    return new Promise<VitalsResult>((resolve) => {
      const result: VitalsResult = { lcp: null, fcp: null, cls: null, ttfb: null };
      let completed = 0;
      const expected = 3;

      function checkDone() {
        completed++;
        if (completed >= expected) resolve(result);
      }

      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            result.lcp = entries[entries.length - 1].startTime;
          }
          lcpObserver.disconnect();
          checkDone();
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        checkDone();
      }

      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            result.fcp = entries[0].startTime;
          }
          fcpObserver.disconnect();
          checkDone();
        });
        fcpObserver.observe({ type: 'first-contentful-paint', buffered: true });
      } catch {
        checkDone();
      }

      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value ?? 0;
            }
          }
          result.cls = clsValue;
          clsObserver.disconnect();
          checkDone();
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {
        checkDone();
      }

      setTimeout(() => resolve(result), 10000);
    });
  });

  const ttfb = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return nav?.responseStart || 0;
  });

  return { ...metrics, ttfb };
}
