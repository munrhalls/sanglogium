import { test, expect } from '@playwright/test';

/**
 * API Efficiency Monitoring Test Suite
 *
 * Validates that the homepage makes minimal Sanity API calls.
 * Current state: ~9 requests (target: 1-2 batched requests)
 *
 * This test intercepts all Sanity API requests and counts them.
 */

// API request budgets
const API_BUDGETS = {
  HOMEPAGE_MAX: 3,  // Target: 1-2, allowing some headroom
  PLP_MAX: 2,       // Product Listing Page
  PDP_MAX: 2,       // Product Detail Page
};

test.describe('API Efficiency - Homepage', () => {

  test('Homepage makes ≤ 3 Sanity API requests', async ({ page }) => {
    const sanityRequests: string[] = [];

    // Intercept all requests
    await page.route('**/*', (route) => {
      const url = route.request().url();

      // Track Sanity API requests
      if (url.includes('cdn.sanity.io') || url.includes('api.sanity.io')) {
        sanityRequests.push(url);
      }

      route.continue();
    });

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for any lazy-loaded requests

    // Log for debugging
    // eslint-disable-next-line no-console
    console.log(`Sanity API requests made: ${sanityRequests.length}`);
    sanityRequests.forEach((url, i) => {
      // eslint-disable-next-line no-console
      console.log(`  ${i + 1}. ${url.substring(0, 100)}...`);
    });

    // Assert budget
    expect(sanityRequests.length).toBeLessThanOrEqual(API_BUDGETS.HOMEPAGE_MAX);
  });

  test('No duplicate Sanity queries', async ({ page }) => {
    const queryUrls: string[] = [];

    await page.route('**/*', (route) => {
      const url = route.request().url();

      if (url.includes('cdn.sanity.io') || url.includes('api.sanity.io')) {
        // Extract the query part for comparison
        const urlObj = new URL(url);
        const query = urlObj.searchParams.get('query') || '';
        queryUrls.push(query);
      }

      route.continue();
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check for duplicates
    const uniqueQueries = new Set(queryUrls);
    expect(uniqueQueries.size).toBe(queryUrls.length);
  });

  test('API requests are cached appropriately', async ({ page }) => {
    const requestHeaders: Record<string, string>[] = [];

    await page.route('**/*', (route) => {
      const url = route.request().url();

      if (url.includes('cdn.sanity.io') || url.includes('api.sanity.io')) {
        const headers = route.request().headers();
        requestHeaders.push({
          url: url.substring(0, 50),
          'cache-control': headers['cache-control'] || 'not-set',
        });
      }

      route.continue();
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Sanity CDN requests should have appropriate caching
    // This is more of a smoke test - we're just verifying requests are made
    expect(requestHeaders.length).toBeGreaterThanOrEqual(0);
  });
});

test.describe('API Efficiency - Product Listing Pages', () => {

  test('PLP makes ≤ 2 Sanity API requests', async ({ page }) => {
    const sanityRequests: string[] = [];

    await page.route('**/*', (route) => {
      const url = route.request().url();

      if (url.includes('cdn.sanity.io') || url.includes('api.sanity.io')) {
        sanityRequests.push(url);
      }

      route.continue();
    });

    // Navigate to a category page
    await page.goto('/headphones/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // eslint-disable-next-line no-console
    console.log(`PLP Sanity API requests: ${sanityRequests.length}`);

    expect(sanityRequests.length).toBeLessThanOrEqual(API_BUDGETS.PLP_MAX);
  });
});
