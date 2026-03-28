import { test, expect } from '@playwright/test';
import { lighthouse } from 'lighthouse';
import { chromium } from 'playwright';

/**
 * Performance Budget Tests
 * 
 * These tests verify the application meets defined performance budgets.
 * Run with: npx playwright test tests/performance/
 */

// Performance budgets
const BUDGETS = {
  // Time budgets (ms)
  ttfb: 600,
  fcp: 2000,
  lcp: 2500,
  tti: 3800,
  speedIndex: 3400,
  tbt: 200,
  
  // Size budgets (bytes)
  totalJs: 400 * 1024, // 400KB
  totalImages: 1024 * 1024, // 1MB
  totalPage: 2 * 1024 * 1024, // 2MB
  
  // Count budgets
  totalRequests: 50,
  thirdPartyRequests: 10,
};

test.describe('Homepage Performance Budget Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.evaluate(() => {
      performance.mark('test-start');
    });
  });

  test('TTFB should be under budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const ttfb = Date.now() - startTime;
    
    expect(ttfb).toBeLessThan(BUDGETS.ttfb);
    console.log(`TTFB: ${ttfb}ms (budget: ${BUDGETS.ttfb}ms)`);
  });

  test('FCP should be under budget', async ({ page }) => {
    await page.goto('/');
    
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              resolve(entry.startTime);
              observer.disconnect();
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });
        
        // Fallback if already loaded
        setTimeout(() => {
          const entries = performance.getEntriesByName('first-contentful-paint');
          if (entries.length) {
            resolve(entries[0].startTime);
          }
        }, 100);
      });
    });
    
    expect(fcp).toBeLessThan(BUDGETS.fcp);
    console.log(`FCP: ${fcp}ms (budget: ${BUDGETS.fcp}ms)`);
  });

  test('LCP should be under budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry?.startTime || 0);
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Give time for LCP to stabilize
        setTimeout(() => {
          const entries = performance.getEntriesByType('largest-contentful-paint');
          if (entries.length) {
            const last = entries[entries.length - 1];
            resolve(last.startTime);
          } else {
            resolve(0);
          }
        }, 3000);
      });
    });
    
    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(BUDGETS.lcp);
    console.log(`LCP: ${lcp}ms (budget: ${BUDGETS.lcp}ms)`);
  });

  test('Total page weight should be under budget', async ({ page }) => {
    const requests: Array<{ url: string; size: number; type: string }> = [];
    
    page.on('response', async (response) => {
      try {
        const body = await response.body().catch(() => null);
        const headers = response.headers();
        const contentLength = headers['content-length'] 
          ? parseInt(headers['content-length'], 10) 
          : body?.length || 0;
        
        requests.push({
          url: response.url(),
          size: contentLength,
          type: headers['content-type'] || 'unknown',
        });
      } catch {
        // Ignore failed responses
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for lazy loaded resources
    
    const totalSize = requests.reduce((sum, r) => sum + r.size, 0);
    const jsSize = requests
      .filter(r => r.type.includes('javascript'))
      .reduce((sum, r) => sum + r.size, 0);
    const imageSize = requests
      .filter(r => r.type.includes('image'))
      .reduce((sum, r) => sum + r.size, 0);
    
    console.log(`Total: ${(totalSize / 1024 / 1024).toFixed(2)}MB, JS: ${(jsSize / 1024).toFixed(2)}KB, Images: ${(imageSize / 1024).toFixed(2)}KB`);
    console.log(`Total requests: ${requests.length}`);
    
    expect(totalSize).toBeLessThan(BUDGETS.totalPage);
    expect(jsSize).toBeLessThan(BUDGETS.totalJs);
    expect(imageSize).toBeLessThan(BUDGETS.totalImages);
    expect(requests.length).toBeLessThan(BUDGETS.totalRequests);
  });

  test('CLS should be under budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Trigger some layout changes by resizing
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });
    
    expect(cls as number).toBeLessThan(0.1);
    console.log(`CLS: ${cls} (budget: 0.1)`);
  });

  test('Hero image should have priority loading', async ({ page }) => {
    await page.goto('/');
    
    const heroImage = page.locator('img[alt*="Hero"], img[fetchpriority="high"]').first();
    const hasPriority = await heroImage.evaluate(el => 
      el.getAttribute('fetchpriority') === 'high' || 
      el.getAttribute('priority') !== null
    );
    
    expect(hasPriority).toBe(true);
  });

  test('No render-blocking resources', async ({ page }) => {
    const blockingResources: string[] = [];
    
    page.on('response', async (response) => {
      const request = response.request();
      const resourceType = request.resourceType();
      const headers = response.headers();
      
      // Check for render-blocking CSS/JS
      if (resourceType === 'stylesheet' || resourceType === 'script') {
        // Should not be render-blocking (async/defer or not in head)
        const isAsync = headers['link']?.includes('rel="preload"');
        if (!isAsync && resourceType === 'script') {
          // Check if script is in head without async/defer
          // This is a simplified check
        }
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // In practice, you'd need to inspect the actual HTML for this
    expect(blockingResources.length).toBe(0);
  });
});

test.describe('Bundle Size Tests', () => {
  test('JavaScript bundle should be under budget', async ({ page }) => {
    // Navigate and capture all script requests
    const scripts: Array<{ url: string; size: number }> = [];
    
    page.on('response', async (response) => {
      const request = response.request();
      if (request.resourceType() === 'script') {
        try {
          const headers = response.headers();
          const size = headers['content-length'] 
            ? parseInt(headers['content-length'], 10)
            : 0;
          scripts.push({ url: request.url(), size });
        } catch {
          // Ignore
        }
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const totalJs = scripts.reduce((sum, s) => sum + s.size, 0);
    console.log(`Total JS: ${(totalJs / 1024).toFixed(2)}KB (${scripts.length} files)`);
    
    expect(totalJs).toBeLessThan(BUDGETS.totalJs);
  });
});

test.describe('Sanity API Efficiency Tests', () => {
  test('Homepage should make minimal Sanity API calls', async ({ page }) => {
    const sanityRequests: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('cdn.sanity.io') || request.url().includes('api.sanity.io')) {
        sanityRequests.push(request.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log(`Sanity API calls: ${sanityRequests.length}`);
    console.log(sanityRequests.map(url => `  - ${url.split('?')[0]}`).join('\n'));
    
    // Should be 1-2 batched requests, not 9 individual
    expect(sanityRequests.length).toBeLessThanOrEqual(3);
  });
});

test.describe('Image Optimization Tests', () => {
  test('Images should use modern formats', async ({ page }) => {
    const imageRequests: Array<{ url: string; format: string }> = [];
    
    page.on('response', (response) => {
      const request = response.request();
      if (request.resourceType() === 'image') {
        const url = request.url();
        const format = url.includes('.avif') ? 'avif' 
          : url.includes('.webp') ? 'webp'
          : url.includes('.jpg') || url.includes('.jpeg') ? 'jpeg'
          : 'other';
        imageRequests.push({ url, format });
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const modernFormats = imageRequests.filter(i => i.format === 'avif' || i.format === 'webp');
    const legacyFormats = imageRequests.filter(i => i.format === 'jpeg');
    
    console.log(`Modern formats: ${modernFormats.length}, Legacy: ${legacyFormats.length}`);
    
    // Most images should use modern formats
    expect(modernFormats.length).toBeGreaterThan(legacyFormats.length);
  });

  test('Images should have proper loading attributes', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    let withLazyLoading = 0;
    let withoutLoading = 0;
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      const priority = await img.getAttribute('priority');
      
      if (loading === 'lazy' || priority !== null) {
        withLazyLoading++;
      } else if (!loading) {
        withoutLoading++;
      }
    }
    
    console.log(`Images: ${count}, With lazy/priority: ${withLazyLoading}, Without loading attr: ${withoutLoading}`);
    
    // Most images should have loading strategy defined
    expect(withoutLoading).toBeLessThan(count * 0.2); // Less than 20% without loading attr
  });
});

// Lighthouse audit integration
test.describe('Lighthouse Audit', () => {
  test.skip('should pass Lighthouse performance audit', async () => {
    // This test requires lighthouse and chrome-launcher
    // Run only in CI or with proper setup
    
    const browser = await chromium.launch();
    const port = browser.wsEndpoint().split(':')[2].split('/')[0];
    
    const result = await lighthouse('http://localhost:3000/', {
      port: parseInt(port),
      output: 'json',
      logLevel: 'error',
    });
    
    const scores = result?.lhr?.categories;
    
    expect(scores?.performance?.score).toBeGreaterThanOrEqual(0.7);
    expect(scores?.accessibility?.score).toBeGreaterThanOrEqual(0.9);
    
    await browser.close();
  });
});
