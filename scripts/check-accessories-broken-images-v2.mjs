import { chromium } from "@playwright/test";
import fs from "node:fs";

const PAGE_URL = "http://localhost:3000/products/accessories";
const OUTPUT_FILE = "broken-accessories-main-images.json";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Track network failures for images
const failedImages = new Map();
page.on("requestfailed", (req) => {
  if (req.resourceType() === "image") {
    failedImages.set(req.url(), req.failure()?.errorText ?? "failed");
  }
});
page.on("response", (res) => {
  if (res.request().resourceType() === "image" && res.status() >= 400) {
    failedImages.set(res.url(), `HTTP ${res.status()}`);
  }
});

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);

// Wait for product cards
await page.waitForSelector('article[data-testid="product-card"]', {
  timeout: 15000,
});

// Scroll through the page progressively to trigger lazy loading
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
const viewportHeight = await page.evaluate(() => window.innerHeight);
let currentPos = 0;
while (currentPos < totalHeight) {
  currentPos += viewportHeight * 0.8;
  await page.evaluate((pos) => window.scrollTo(0, pos), currentPos);
  await page.waitForTimeout(300);
}
// Scroll back up to load all images
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(3000);

// Now extract each product card's info and check its main image
const results = await page.evaluate(() => {
  const cards = [
    ...document.querySelectorAll('article[data-testid="product-card"]'),
  ];
  const products = [];

  for (const card of cards) {
    // Find the product link
    const link = card.querySelector('a[href*="/product/"]');
    const href = link?.getAttribute("href") || "";

    // Find the product name from heading/link text
    const heading = card.querySelector("h2, h3, h4, a[href*='/product/']");
    const name =
      (heading?.textContent || "").trim() ||
      (link?.textContent || "").trim() ||
      "";

    // Find the main product image
    const imgContainer = card.querySelector('[data-testid="product-image"]');
    const img = card.querySelector("img");
    const imgSrc = img?.getAttribute("src") || img?.currentSrc || "";
    const alt = img?.getAttribute("alt") || "";

    // Image load state
    const complete = img?.complete;
    const naturalWidth = img?.naturalWidth;
    const naturalHeight = img?.naturalHeight;

    // Force a fresh check if NOT complete
    products.push({
      href,
      name: name.slice(0, 200),
      imgSrc,
      alt: alt.slice(0, 200),
      complete,
      naturalWidth,
      naturalHeight,
    });
  }

  return products;
});

console.log(`\nFound ${results.length} product cards`);

// Now definitively check each product image by loading it fresh in the page
const definitiveResults = [];
const checkedUrls = new Map();

for (const product of results) {
  const src = product.imgSrc;
  if (!src) {
    definitiveResults.push({ ...product, imageStatus: "NO_SRC" });
    continue;
  }

  const absUrl = new URL(src, PAGE_URL).href;

  // If already checked this URL, reuse the result
  if (checkedUrls.has(absUrl)) {
    definitiveResults.push({
      ...product,
      imageStatus: checkedUrls.get(absUrl),
    });
    continue;
  }

  // Check image by creating a fresh Image element
  const status = await page.evaluate(
    (url) =>
      new Promise((resolve) => {
        const img = new Image();
        let settled = false;
        const done = (result) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(result);
          }
        };
        const timer = setTimeout(() => done("TIMEOUT"), 20000);
        img.onload = () => done("OK");
        img.onerror = () => done("BROKEN");
        img.src = url;
      }),
    absUrl,
  );

  checkedUrls.set(absUrl, status);
  console.log(
    `  ${status}: "${product.name.slice(0, 80)}" | ${absUrl.slice(0, 120)}`,
  );
  definitiveResults.push({ ...product, imageStatus: status });
}

// Collect broken products - those whose image failed to load
const brokenProducts = definitiveResults
  .filter((p) => p.imageStatus === "BROKEN" || p.imageStatus === "TIMEOUT")
  .map((p) => ({
    name: p.name,
    slug: p.href,
    alt: p.alt,
    imageUrl: new URL(p.imgSrc, PAGE_URL).href,
    imageStatus: p.imageStatus,
  }));

// Also check images that are in the page but reported broken (naturalWidth 0)
// This catches images that loaded before our fresh check, e.g. those that
// failed initial load and may have been marked differently
for (const product of results) {
  if (!product.imgSrc) continue;
  const absUrl = new URL(product.imgSrc, PAGE_URL).href;
  const isAlreadyListed = brokenProducts.some((b) => b.imageUrl === absUrl);
  if (isAlreadyListed) continue;

  // If browser reported them as not loaded (complete=false or naturalWidth=0),
  // and our fresh check also said something other than OK, flag them
  const freshStatus = checkedUrls.get(absUrl);
  if (freshStatus === "BROKEN" || freshStatus === "TIMEOUT") {
    if (!brokenProducts.some((b) => b.imageUrl === absUrl)) {
      brokenProducts.push({
        name: product.name,
        slug: product.href,
        alt: product.alt,
        imageUrl: absUrl,
        imageStatus: freshStatus,
      });
    }
  }
}

// Save results
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log(
  `\n=== SAVED: ${brokenProducts.length} broken products to ${OUTPUT_FILE} ===`,
);

// Also save debug info
fs.writeFileSync(
  "accessories-all-checked.json",
  JSON.stringify(
    {
      networkFailures: [...failedImages.entries()],
      products: definitiveResults,
    },
    null,
    2,
  ),
  "utf8",
);

await browser.close();
