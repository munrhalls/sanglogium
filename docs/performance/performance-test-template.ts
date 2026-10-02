/**
 * Performance Test Template
 * 
 * Add to tests/e2e/performance/ for each critical page.
 * Measures Core Web Vitals using Playwright's built-in performance API.
 */
import { test, expect } from '@playwright/test';

// Thresholds (Core Web Vitals "good" ratings)
const THRESHOLDS = {
  LCP: 2500,   // Largest Contentful Paint
  FCP: 1800,   // First Contentful Paint
  TTFB: 800,   // Time to First Byte
  CLS: 0.1,    // Cumulative Layout Shift
};

async function measureWebVitals(page: Parameters<typeof test>[1]['page']) {
  await page.goto('/');
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  const metrics = await page.evaluate(() => {
    return new Promise<Record<string, number>>((resolve) => {
      const results: Record<string, number> = {};
      let completed = 0;
      const types = ['largest-contentful-paint', 'first-contentful-paint', 'layout-shift'] as const;
      
      types.forEach((type) => {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const last = entries[entries.length - 1];
              if (type === 'layout-shift') {
                results[type] = (last as any).value || 0;
              } else {
                results[type] = last.startTime;
              }
            }
            completed++;
            if (completed >= types.length) {
              resolve(results);
            }
          });
          observer.observe({ type, buffered: true });
        } catch {
          completed++;
          if (completed >= types.length) {
            resolve(results);
          }
        }
      });
      
      // Timeout fallback
      setTimeout(() => resolve(results), 10000);
    });
  });
  
  // TTFB from navigation timing
  const ttfb = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return nav?.responseStart || 0;
  });
  
  return { ...metrics, ttfb };
}

test('homepage Core Web Vitals', async ({ page }) => {
  const metrics = await measureWebVitals(page);
  
  console.log('Homepage metrics:', JSON.stringify(metrics, null, 2));
  
  if (metrics['largest-contentful-paint']) {
    expect(metrics['largest-contentful-paint']).toBeLessThan(THRESHOLDS.LCP);
  }
  if (metrics['first-contentful-paint']) {
    expect(metrics['first-contentful-paint']).toBeLessThan(THRESHOLDS.FCP);
  }
  if (metrics['ttfb']) {
    expect(metrics['ttfb']).toBeLessThan(THRESHOLDS.TTFB);
  }
  if (metrics['layout-shift'] !== undefined) {
    expect(metrics['layout-shift']).toBeLessThan(THRESHOLDS.CLS);
  }
});
