import { chromium } from "@playwright/test";
import fs from "node:fs";

const PAGE_URL = "http://localhost:3000/products/accessories";
const OUTPUT_FILE = "broken-accessories-main-images.json";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

// Wait for product cards
await page.waitForSelector('article[data-testid="product-card"]', {
  timeout: 15000,
});

// For each product card, scroll into view, wait for the image to settle,
// and check the actual DOM state of the image (complete + naturalWidth)
const results = await page.evaluate(async () => {
  const cards = [
    ...document.querySelectorAll('article[data-testid="product-card"]'),
  ];
  const checkedProducts = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    // Scroll the card into view to trigger lazy loading
    card.scrollIntoView({ block: "center", behavior: "instant" });
    await new Promise((r) => setTimeout(r, 200));

    // Find the product link and name
    const link = card.querySelector('a[href*="/product/"]');
    const href = link?.getAttribute("href") || "";

    // Get product name - prefer the link title/aria-label or heading, then text content
    const heading = card.querySelector(
      "h2, h3, h4, [class*='product-name'], [class*='title']",
    );
    let name = (heading?.textContent || "").trim();

    if (!name) {
      // Extract from the link - product cards often have brand + product name
      // Try to find the most descriptive text
      const linkText = (link?.textContent || "").trim();
      const cardText = (card.textContent || "").replace(/\s+/g, " ").trim();
      name = linkText || cardText.slice(0, 150);
    }

    // Find the main product image (the one inside [data-testid="product-image"])
    const imgContainer = card.querySelector('[data-testid="product-image"]');
    const img = imgContainer?.querySelector("img") || card.querySelector("img");

    if (!img) {
      checkedProducts.push({
        href,
        name: name.slice(0, 200),
        imgSrc: "",
        alt: "",
        complete: false,
        naturalWidth: 0,
        naturalHeight: 0,
        broken: true,
        reason: "NO_IMG_ELEMENT",
      });
      continue;
    }

    const imgSrc = img.getAttribute("src") || img.currentSrc || "";
    const alt = img.getAttribute("alt") || "";

    // Wait for image to settle - give it time to load or fail
    // Check every 200ms up to 15s
    let settled = false;
    for (let attempt = 0; attempt < 75; attempt++) {
      // If complete, it's settled (loaded or failed)
      if (img.complete) {
        settled = true;
        break;
      }
      // Also settled if the src hasn't changed and we've waited
      await new Promise((r) => setTimeout(r, 200));
    }

    // After the wait, check the final state
    const isBroken =
      !settled ||
      img.complete === false ||
      img.naturalWidth === 0 ||
      img.naturalHeight === 0;

    // Add event listener based check - listen for error event
    const imgState = {
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      currentSrc: img.currentSrc,
    };

    checkedProducts.push({
      href,
      name: name.slice(0, 200),
      imgSrc,
      alt: alt.slice(0, 200),
      ...imgState,
      broken: isBroken,
      reason: isBroken
        ? settled
          ? img.naturalWidth === 0
            ? "IMG_LOAD_FAILED"
            : "IMG_ZERO_DIMENSIONS"
          : "IMG_NOT_LOADED_SRC:" + imgSrc.slice(0, 120)
        : "OK",
    });
  }

  return checkedProducts;
});

console.log(`\nChecked ${results.length} product cards`);

// Count broken
const brokenProducts = results.filter((p) => p.broken);

console.log(`\n=== BROKEN PRODUCTS: ${brokenProducts.length} ===`);
for (const bp of brokenProducts) {
  console.log(`  BROKEN: "${bp.name}" | ${bp.href} | ${bp.reason}`);
  console.log(`    src: ${bp.imgSrc.slice(0, 150)}`);
}

// Also print OK count
const okProducts = results.filter((p) => !p.broken);
console.log(`\n=== OK PRODUCTS: ${okProducts.length} ===`);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log(`\nSaved to ${OUTPUT_FILE}`);

// Save full debug data
fs.writeFileSync(
  "accessories-all-checked.json",
  JSON.stringify(results, null, 2),
  "utf8",
);

await browser.close();
