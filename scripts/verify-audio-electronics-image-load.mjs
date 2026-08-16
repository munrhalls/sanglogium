// Definitive in-browser load test for audio-electronics page images.
// Uses slow, realistic scrolling so next/image lazy-load has time to fetch.
// Reports how many images actually decode, plus naturalWidth distribution.
import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 300000 });
await page.waitForTimeout(4000);
await page.waitForSelector('article[data-testid="product-card"]', { timeout: 60000 });

// Slow scroll down, dwelling so lazy images can load
async function slowScrollToBottom() {
  const vh = await page.evaluate(() => window.innerHeight);
  for (let pos = 0; ; pos += vh * 0.5) {
    await page.evaluate((p) => window.scrollTo(0, p), pos);
    await page.waitForTimeout(600);
    const total = await page.evaluate(() => document.body.scrollHeight);
    if (pos >= total) break;
  }
}
// Slow scroll back up (top images may have been unobserved first pass)
async function slowScrollToTop() {
  const vh = await page.evaluate(() => window.innerHeight);
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let pos = total; pos >= 0; pos -= vh * 0.5) {
    await page.evaluate((p) => window.scrollTo(0, p), pos);
    await page.waitForTimeout(400);
  }
}

await slowScrollToBottom();
await slowScrollToTop();
await slowScrollToBottom();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(5000);

const stats = await page.evaluate(() => {
  const imgs = [
    ...document.querySelectorAll('article[data-testid="product-card"] img'),
  ];
  const loaded = imgs.filter((i) => i.complete && i.naturalWidth > 0);
  const byWidth = {};
  for (const i of loaded) {
    byWidth[i.naturalWidth] = (byWidth[i.naturalWidth] || 0) + 1;
  }
  const widths = [];
  for (const w of Object.keys(byWidth)) widths.push(w + "x" + byWidth[w]);
  return {
    total: imgs.length,
    loaded: loaded.length,
    naturalWidths: widths.sort((a, b) => parseInt(a) - parseInt(b)).join(", "),
    failedOrPending: imgs.length - loaded.length,
  };
});
console.log(JSON.stringify(stats, null, 2));
await browser.close();
