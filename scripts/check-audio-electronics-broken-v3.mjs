// Robust broken-image detection for the audio-electronics category page.
// v3 fixes that caused earlier versions to hang / miss images:
//   - no waitUntil:"networkidle" (never resolves on this page due to
//     continuous network activity) -> domcontentloaded + explicit waits
//   - HTTP status checks with per-request timeout + concurrency limit
//   - detects the no-image case (data-testid="product-image-placeholder")
//   - detects the known shared placeholder asset by URL hash
// Outputs:
//   - broken-audio-electronics-main-images.json   (broken list, same shape
//     as broken-accessories-main-images.json so fetch/patch scripts work)
//   - audio-electronics-image-analysis.json       (full per-product details)
import { chromium } from "@playwright/test";
import fs from "node:fs";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";
const OUTPUT_FILE = "broken-audio-electronics-main-images.json";
const ANALYSIS_FILE = "audio-electronics-image-analysis.json";
const KNOWN_PLACEHOLDER_ASSET = "2c516bcf517ab27994476b1732b758ce82d6ef5e";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log("Navigating to " + PAGE_URL + " ...");
await page.goto(PAGE_URL, {
  waitUntil: "domcontentloaded",
  // Cold-start first compile of /products/[...slug] took 124s once; be generous.
  timeout: 300000,
});
console.log("domcontentloaded reached; giving client JS a moment...");
await page.waitForTimeout(4000);

// Explicitly wait for either a product card or the page-error fallback.
try {
  await page.waitForSelector('article[data-testid="product-card"]', {
    timeout: 60000,
  });
  console.log("Product cards found.");
} catch {
  const url = page.url();
  const title = await page.title();
  const bodySnippet =
    (await page.evaluate(() => document.body?.innerText?.slice(0, 500))) || "";
  console.error(
    "ERROR: no product cards appeared.\n  url=" +
      url +
      "\n  title=" +
      title +
      "\n  body=" +
      bodySnippet.slice(0, 300).replace(/\s+/g, " "),
  );
  await browser.close();
  process.exit(1);
}

// Scroll all the way down in fine increments to trigger every lazy-load.
// Re-read scrollHeight each pass in case lazy content expands the page.
async function scrollPass(increment, delayMs) {
  let totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  let pos = 0;
  while (pos < totalHeight) {
    pos += viewportHeight * increment;
    await page.evaluate((p) => window.scrollTo(0, p), pos);
    await page.waitForTimeout(delayMs);
    totalHeight = await page.evaluate(() => document.body.scrollHeight);
  }
}
await scrollPass(0.6, 150);
await scrollPass(0.4, 250);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(3000);

// Extract product cards: name, href, main image src, alt, load state.
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

    const imgBox = card.querySelector('[data-testid="product-image"]');
    const placeholderBox = card.querySelector(
      '[data-testid="product-image-placeholder"]',
    );
    const img = imgBox?.querySelector("img") || card.querySelector("img");
    const imgSrc = img?.getAttribute("src") || img?.currentSrc || "";
    const alt = img?.getAttribute("alt") || "";
    const complete = img ? img.complete : false;
    const naturalWidth = img ? img.naturalWidth : 0;

    if (!name) {
      const linkText = (link?.textContent || "").replace(/\s+/g, " ").trim();
      name = linkText || alt;
    }

    return {
      href,
      name: name.slice(0, 200),
      imgSrc: imgSrc.slice(0, 400),
      alt: alt.slice(0, 200),
      hasImageBox: Boolean(imgBox),
      hasPlaceholderBox: Boolean(placeholderBox),
      complete,
      naturalWidth,
    };
  });
});

console.log("Extracted " + products.length + " product cards");
if (products.length === 0) {
  console.error("ERROR: 0 product cards extracted. Aborting.");
  await browser.close();
  process.exit(1);
}
await browser.close();

// Definitive broken check: HTTP status of each image URL.
// Concurrency-limited pool with per-request timeout.
const CONCURRENCY = 8;
const TIMEOUT_MS = 20000;

async function checkStatus(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    // Drain/cancel body without downloading the full image
    if (res.body) res.body.cancel().catch(() => {});
    return res.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

function resolveUrl(src) {
  try {
    return new URL(src, PAGE_URL).href;
  } catch {
    return src;
  }
}

function classify(p, status) {
  if (p.hasPlaceholderBox || !p.imgSrc) {
    return {
      ...p,
      imageUrl: null,
      httpStatus: null,
      isBroken: true,
      reason: "NO_IMAGE_SRC",
    };
  }
  const abs = resolveUrl(p.imgSrc);
  if (abs.includes(KNOWN_PLACEHOLDER_ASSET)) {
    return {
      ...p,
      imageUrl: abs,
      httpStatus: status,
      isBroken: true,
      reason: "SHARED_PLACEHOLDER_ASSET",
    };
  }
  const ok = status >= 200 && status < 400;
  return {
    ...p,
    imageUrl: abs,
    httpStatus: status,
    isBroken: !ok,
    reason: ok ? "OK" : status === 0 ? "FETCH_TIMEOUT_ERR" : "HTTP_" + status,
  };
}

const results = [];
let index = 0;
let doneCount = 0;
async function worker() {
  while (index < products.length) {
    const p = products[index++];
    const status = p.imgSrc ? await checkStatus(resolveUrl(p.imgSrc)) : null;
    results.push(classify(p, status));
    doneCount++;
    if (doneCount % 10 === 0 || doneCount === products.length) {
      console.log("  checked " + doneCount + "/" + products.length);
    }
  }
}

const workers = [];
for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
await Promise.all(workers);

const broken = results.filter((r) => r.isBroken);
console.log(
  "\n=== BROKEN PRODUCTS: " + broken.length + "/" + results.length + " ===",
);
for (const b of broken) {
  console.log(
    "  " +
      b.name +
      " | " +
      b.href +
      " | " +
      b.reason +
      (b.httpStatus ? " | HTTP " + b.httpStatus : ""),
  );
}

const brokenProducts = broken.map((p) => ({
  name: p.name,
  slug: p.href,
  alt: p.alt,
  imageUrl: p.imageUrl,
  reason: p.reason,
}));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log("Saved " + brokenProducts.length + " broken products to " + OUTPUT_FILE);

fs.writeFileSync(
  ANALYSIS_FILE,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      pageUrl: PAGE_URL,
      totalProducts: results.length,
      knownPlaceholderAsset: KNOWN_PLACEHOLDER_ASSET,
      products: results.map((r) => ({
        name: r.name,
        href: r.href,
        imgSrc: r.imgSrc,
        alt: r.alt,
        imageUrl: r.imageUrl,
        httpStatus: r.httpStatus,
        hasImageBox: r.hasImageBox,
        hasPlaceholderBox: r.hasPlaceholderBox,
        complete: r.complete,
        naturalWidth: r.naturalWidth,
        isBroken: r.isBroken,
        reason: r.reason,
      })),
    },
    null,
    2,
  ),
  "utf8",
);
console.log("Full analysis saved to " + ANALYSIS_FILE);

