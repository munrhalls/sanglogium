// Control experiment: force eager loading on all card images and count how
// many actually decode. If ~100 load, the images are fine and the low in-browser
// load rate in earlier scans is purely native lazy-load behavior.
import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 300000 });
await page.waitForTimeout(4000);
await page.waitForSelector('article[data-testid="product-card"]', { timeout: 60000 });

// Force eager + preload on every card image
const forced = await page.evaluate(() => {
  const imgs = [
    ...document.querySelectorAll('article[data-testid="product-card"] img'),
  ];
  for (const i of imgs) {
    i.loading = "eager";
    i.decoding = "sync";
    i.fetchPriority = "high";
  }
  return imgs.length;
});
console.log("forced eager on " + forced + " images");

// Now re-trigger loads: temporarily replace src with same URL (no-op reload trick)
const reRequested = await page.evaluate(() => {
  const imgs = [
    ...document.querySelectorAll('article[data-testid="product-card"] img'),
  ];
  for (const i of imgs) {
    const src = i.currentSrc || i.getAttribute("src");
    if (src) i.src = src;
  }
  return imgs.length;
});
console.log("re-requested " + reRequested + " images");

// Wait for network to settle
await page.waitForTimeout(15000);

const stats = await page.evaluate(() => {
  const imgs = [
    ...document.querySelectorAll('article[data-testid="product-card"] img'),
  ];
  const loaded = imgs.filter((i) => i.complete && i.naturalWidth > 0).length;
  return { total: imgs.length, loaded, failed: imgs.length - loaded };
});
console.log(JSON.stringify(stats, null, 2));
await browser.close();
