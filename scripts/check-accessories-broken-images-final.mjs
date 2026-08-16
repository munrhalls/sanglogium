import { chromium } from "@playwright/test";
import fs from "node:fs";

const PAGE_URL = "http://localhost:3000/products/accessories";
const OUTPUT_FILE = "broken-accessories-main-images.json";
const KNOWN_PLACEHOLDER_ASSET = "2c516bcf517ab27994476b1732b758ce82d6ef5e";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

await page.waitForSelector('article[data-testid="product-card"]', {
  timeout: 15000,
});

// Scroll through page to load all images
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
const viewportHeight = await page.evaluate(() => window.innerHeight);
let currentPos = 0;
while (currentPos < totalHeight) {
  currentPos += viewportHeight * 0.8;
  await page.evaluate((pos) => window.scrollTo(0, pos), currentPos);
  await page.waitForTimeout(250);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);

// Extract product cards: name (from DOM), href, and main image URL
const products = await page.evaluate(() => {
  const cards = [
    ...document.querySelectorAll('article[data-testid="product-card"]'),
  ];
  return cards.map((card) => {
    const link = card.querySelector('a[href*="/product/"]');
    const href = link?.getAttribute("href") || "";

    // Product name from DOM - prefer heading, then link text, then alt
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
      imgSrc,
      alt: alt.slice(0, 200),
    };
  });
});

console.log(`Extracted ${products.length} product cards`);

// Detect the box-pattern placeholder image by pixel analysis in the browser.
// Loads the reference placeholder image and every unique product image,
// draws them small on a canvas, and compares signatures.
const knownPlaceholderAbsUrl = products.find((p) =>
  new URL(p.imgSrc, PAGE_URL).href.includes(KNOWN_PLACEHOLDER_ASSET),
)?.imgSrc
  ? new URL(
      products.find((p) => p.imgSrc.includes(KNOWN_PLACEHOLDER_ASSET)).imgSrc,
      PAGE_URL,
    ).href
  : null;

console.log(`Reference placeholder URL: ${knownPlaceholderAbsUrl}`);

const analysis = await page.evaluate(
  async ({ products, knownPlaceholderAbsUrl }) => {
    // Helper: build a pixel signature for an image URL at a small size
    async function signatureOf(url, size = 48) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const timer = setTimeout(() => resolve(null), 15000);
        img.onload = () => {
          clearTimeout(timer);
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          try {
            ctx.drawImage(img, 0, 0, size, size);
            const data = ctx.getImageData(0, 0, size, size).data;
            // Compute a compact signature: sample pixels + row/col variance
            const rows = [];
            const cols = [];
            for (let y = 0; y < size; y++) {
              let rowSum = 0;
              for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                const lum =
                  0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                rowSum += lum;
              }
              rows.push(rowSum / size);
            }
            for (let x = 0; x < size; x++) {
              let colSum = 0;
              for (let y = 0; y < size; y++) {
                const i = (y * size + x) * 4;
                const lum =
                  0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                colSum += lum;
              }
              cols.push(colSum / size);
            }

            // Signature: mean luminance + row/col gradient energies + edge density
            const mean = rows.reduce((a, b) => a + b, 0) / size;
            let rowEnergy = 0;
            let colEnergy = 0;
            for (let y = 1; y < size; y++)
              rowEnergy += Math.abs(rows[y] - rows[y - 1]);
            for (let x = 1; x < size; x++)
              colEnergy += Math.abs(cols[x] - cols[x - 1]);

            // Count distinct horizontal bands (box pattern → many sharp bands)
            let bandCount = 0;
            for (let y = 1; y < size; y++) {
              if (Math.abs(rows[y] - rows[y - 1]) > 12) bandCount++;
            }

            resolve({
              mean,
              rowEnergy,
              colEnergy,
              bandCount,
              rows: rows.map((r) => Math.round(r)),
            });
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => {
          clearTimeout(timer);
          resolve(null);
        };
        img.src = url;
      });
    }

    // The box placeholder: many horizontal bands with high contrast (grid boxes)
    const ref = knownPlaceholderAbsUrl
      ? await signatureOf(knownPlaceholderAbsUrl)
      : null;
    console.log("Reference signature:", ref);

    // Classify each product
    const results = [];
    const sigCache = new Map();

    for (const product of products) {
      if (!product.imgSrc) {
        results.push({ ...product, isBroken: false, reason: "no_src" });
        continue;
      }
      const abs = new URL(product.imgSrc, window.location.href).href;
      let sig = sigCache.get(abs);
      if (!sig) {
        sig = await signatureOf(abs);
        sigCache.set(abs, sig);
      }

      // Broken if it IS the known placeholder asset, or if pixel signature
      // matches the placeholder pattern (high band count = box grid)
      const isKnownAsset = abs.includes(
        "2c516bcf517ab27994476b1732b758ce82d6ef5e",
      );
      const looksLikePlaceholder =
        sig && ref && sig.bandCount > 20 && ref.bandCount > 20;

      const isBroken = isKnownAsset || looksLikePlaceholder;
      results.push({
        ...product,
        imageUrl: abs,
        refBandCount: ref?.bandCount ?? null,
        myBandCount: sig?.bandCount ?? null,
        isBroken,
        reason: isKnownAsset
          ? "SHARED_PLACEHOLDER_ASSET"
          : looksLikePlaceholder
            ? "BOX_PATTERN_PIXEL_MATCH"
            : "OK",
      });
    }

    return { results, refBandCount: ref?.bandCount ?? null };
  },
  { products, knownPlaceholderAbsUrl },
);

// Build final broken list
const broken = analysis.results.filter((r) => r.isBroken);
console.log(`\n=== BROKEN PRODUCTS: ${broken.length} ===`);
for (const b of broken) {
  console.log(`  BROKEN: "${b.name}" | ${b.href} | ${b.reason}`);
}

const brokenProducts = broken.map((p) => ({
  name: p.name,
  slug: p.href,
  alt: p.alt,
  imageUrl: p.imageUrl,
  reason: p.reason,
}));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log(
  `\nSaved ${brokenProducts.length} broken products to ${OUTPUT_FILE}`,
);

// Save full analysis
fs.writeFileSync(
  "accessories-image-analysis.json",
  JSON.stringify(
    {
      referenceBandCount: analysis.refBandCount,
      products: analysis.results,
    },
    null,
    2,
  ),
  "utf8",
);

await browser.close();
