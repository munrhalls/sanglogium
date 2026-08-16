// Quick visual sanity check: screenshot the audio-electronics page (no
// networkidle, domcontentloaded + scroll) and save a full-page PNG.
import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";
const OUT = ".logs/audio-electronics-page.png";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 300000 });
await page.waitForTimeout(4000);
await page.waitForSelector('article[data-testid="product-card"]', { timeout: 60000 });

async function scrollPass(increment, delayMs) {
  let totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  let pos = 0;
  while (pos < totalHeight) {
    pos += vh * increment;
    await page.evaluate((p) => window.scrollTo(0, p), pos);
    await page.waitForTimeout(delayMs);
    totalHeight = await page.evaluate(() => document.body.scrollHeight);
  }
}
await scrollPass(0.6, 150);
await scrollPass(0.4, 250);
await page.waitForTimeout(3000);

// Sample naturalWidth again after the full settle to confirm lazy images loaded
const stats = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('article[data-testid="product-card"] img')];
  const loaded = imgs.filter((i) => i.complete && i.naturalWidth > 0).length;
  return { total: imgs.length, loaded };
});
console.log("image load check: " + JSON.stringify(stats));

await page.screenshot({ path: OUT, fullPage: true });
console.log("screenshot saved: " + OUT);
await browser.close();
