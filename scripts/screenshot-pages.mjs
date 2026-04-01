import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3001';
const OUTPUT_DIR = './screenshots/product-discovery';

// Product discovery routes - ALL from catalogue-index.json
const ROUTES = [
  { path: '/', name: 'homepage' },
  // Headphones categories
  { path: '/products/headphones', name: 'products-headphones' },
  { path: '/products/headphones/open-back', name: 'products-open-back' },
  { path: '/products/headphones/closed-back', name: 'products-closed-back' },
  { path: '/products/headphones/semi-open', name: 'products-semi-open' },
  { path: '/products/headphones/planar-magnetic', name: 'products-planar-magnetic' },
  { path: '/products/headphones/dynamic', name: 'products-dynamic' },
  { path: '/products/headphones/electrostatic', name: 'products-electrostatic' },
  { path: '/products/headphones/monitors-iems', name: 'products-monitors-iems' },
  // Audio Electronics categories
  { path: '/products/audio-electronics', name: 'products-audio-electronics' },
  { path: '/products/audio-electronics/desktop-amps', name: 'products-desktop-amps' },
  { path: '/products/audio-electronics/portable-amps', name: 'products-portable-amps' },
  { path: '/products/audio-electronics/bluetooth-dac-amps', name: 'products-bluetooth-dac-amps' },
  { path: '/products/audio-electronics/standalone-dacs', name: 'products-standalone-dacs' },
  { path: '/products/audio-electronics/dac-amp-combos', name: 'products-dac-amp-combos' },
  { path: '/products/audio-electronics/usb-c-dacs', name: 'products-usb-c-dacs' },
  { path: '/products/audio-electronics/digital-players-daps', name: 'products-digital-players-daps' },
  { path: '/products/audio-electronics/network-streamers', name: 'products-network-streamers' },
  // Accessories categories
  { path: '/products/accessories', name: 'products-accessories' },
  { path: '/products/accessories/headphone-cables', name: 'products-headphone-cables' },
  { path: '/products/accessories/interconnects', name: 'products-interconnects' },
  { path: '/products/accessories/adapters', name: 'products-adapters' },
  { path: '/products/accessories/earpads', name: 'products-earpads' },
  { path: '/products/accessories/eartips', name: 'products-eartips' },
  { path: '/products/accessories/care-cleaning', name: 'products-care-cleaning' },
  { path: '/products/accessories/headphone-stands', name: 'products-headphone-stands' },
  { path: '/products/accessories/carrying-cases', name: 'products-carrying-cases' },
  // Product detail
  { path: '/product/sample-product', name: 'product-detail' },
];

async function captureScreenshots() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const url = `${BASE_URL}${route.path}`;

    console.log(`Capturing: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

      // Wait for main content to load
      await page.waitForSelector('main, [data-testid], #__next', { timeout: 10000 }).catch(() => {});

      // Additional wait for any lazy-loaded content
      await page.waitForTimeout(2000);

      const screenshotPath = path.join(OUTPUT_DIR, `${route.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✓ Saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`✗ Failed: ${route.name} - ${error.message}`);

      // Still try to capture error state
      try {
        const screenshotPath = path.join(OUTPUT_DIR, `${route.name}-error.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  Captured error state: ${screenshotPath}`);
      } catch {}
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\nScreenshots saved to: ${path.resolve(OUTPUT_DIR)}`);
}

captureScreenshots().catch(console.error);
