// Precise broken-image detection for audio-electronics page.
// Scrolls to the very bottom to trigger all lazy-loading, waits for images
// to settle, then for each product card checks:
//   1. browser naturalWidth/complete state
//   2. direct HTTP status of the image URL (definitive broken check)
import { chromium } from "@playwright/test";
import fs from "node:fs";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";
const OUTPUT_FILE = "broken-audio-electronics-main-images.json";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

await page.waitForSelector('article[data-testid="product-card"]', {
  timeout: 15000,
});

// Scroll all the way down in fine increments to trigger every lazy-load
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
const viewportHeight = await page.evaluate(() => window.innerHeight);
let currentPos = 0;
while (currentPos < totalHeight) {
  currentPos += viewportHeight * 0.6;
  await page.evaluate((pos) => window.scrollTo(0, pos), currentPos);
  await page.waitForTimeout(200);
}
// Second pass slower for remaining lazy images
currentPos = 0;
while (currentPos < totalHeight) {
  currentPos += viewportHeight * 0.4;
  await page.evaluate((pos) => window.scrollTo(0, pos), currentPos);
  await page.waitForTimeout(300);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(3000);

// Extract product cards
const products = await page.evaluate(() => {
  const cards = [
    ...document.querySelectorAll('article[data-testid="product-card"]'),
  ];
  return cards.map((card) => {
    const link = card.querySelector('a[href*="/product/"]');
    const href = link?.getAttribute("href") || "";
    const heading = card.querySelector(
      "h2, h3, h4, [class*='product-name'], [class*='title']",
    );
    let name = (heading?.textContent || "").trim();
    const imgContainer = card.querySelector('[data-testid="product-image"]');
    const img = imgContainer?.querySelector("img") || card.querySelector("img");
    const imgSrc = img?.getAttribute("src") || img?.currentSrc || "";
    const alt = img?.getAttribute("alt") || "";
    if (!name) {
      const linkText = (link?.textContent || "").replace(/\s+/g, " ").trim();
      name = linkText || alt;
    }
    return {
      href,
      name: name.slice(0, 200),
      imgSrc: imgSrc.slice(0, 300),
      alt: alt.slice(0, 200),
    };
  });
});

console.log(`Extracted ${products.length} product cards`);

// Check HTTP status of every product main image in Node (definitive)
const results = [];
for (const p of products) {
  if (!p.imgSrc) {
    results.push({ ...p, httpStatus: null, isBroken: true, reason: "NO_SRC" });
    continue;
  }
  try {
    const res = await fetch(p.imgSrc, { method: "HEAD" });
    const ok = res.ok;
    const status = res.status;
    results.push({
      ...p,
      httpStatus: status,
      isBroken: !ok,
      reason: ok ? "OK" : `HTTP_${status}`,
    });
    if (!ok) {
      console.log(`  BROKEN: ${p.name} | ${p.href} | HTTP ${status}`);
    }
  } catch (err) {
    results.push({
      ...p,
      httpStatus: null,
      isBroken: true,
      reason: "FETCH_ERR",
    });
    console.log(`  ERR: ${p.name} | ${err.message}`);
  }
  // Polite delay
  await new Promise((r) => setTimeout(r, 100));
}

const broken = results.filter((r) => r.isBroken);
console.log(`\n=== BROKEN PRODUCTS: ${broken.length} ===`);
for (const b of broken) {
  console.log(`  ${b.name} | ${b.href} | ${b.reason}`);
}

const brokenProducts = broken.map((p) => ({
  name: p.name,
  slug: p.href,
  alt: p.alt,
  imageUrl: p.imgSrc,
  reason: p.reason,
}));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log(
  `\nSaved ${brokenProducts.length} broken products to ${OUTPUT_FILE}`,
);

await browser.close();
