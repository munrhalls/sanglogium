import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/accessories";
const OUTPUT_FILE = "broken-accessories-main-images.json";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Listen for image load failures
const failedImages = new Map();
page.on("requestfailed", (req) => {
  if (req.resourceType() === "image") {
    failedImages.set(req.url(), req.failure()?.errorText ?? "failed");
  }
});

// Also track responses with non-2xx status for images
page.on("response", (res) => {
  if (res.request().resourceType() === "image" && res.status() >= 400) {
    failedImages.set(res.url(), `HTTP ${res.status()}`);
  }
});

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

// Wait for product cards to appear
await page
  .waitForSelector('[data-testid="product-card"], a[href*="/products/"], li', {
    timeout: 15000,
  })
  .catch(() => {});

// Inspect the DOM structure to find product listings
const pageInfo = await page.evaluate(() => {
  // Find all product-like containers
  const possibleSelectors = [
    '[data-testid="product-card"]',
    '[data-testid="product-card-link"]',
    'a[href^="/products/"]',
    'li a[href^="/products/"]',
    "article",
  ];

  // Get all anchor tags pointing to products
  const productLinks = [...document.querySelectorAll('a[href*="/products/"]')]
    .filter(
      (a) =>
        a.getAttribute("href") &&
        a.getAttribute("href") !== "/products/accessories" &&
        !a.getAttribute("href").includes("?"),
    )
    .map((a) => ({
      href: a.getAttribute("href"),
      text: a.textContent.trim().slice(0, 100),
      childImg: a.querySelector("img")?.getAttribute("src") || null,
    }));

  return {
    title: document.title,
    url: location.href,
    productLinks: productLinks.slice(0, 300),
    sampleHtml:
      document
        .querySelector('main, [role="main"], #__next')
        ?.innerHTML.slice(0, 3000) || "NO MAIN FOUND",
  };
});

console.log("\n=== PAGE INFO ===");
console.log("Title:", pageInfo.title);
console.log("URL:", pageInfo.url);
console.log("Product link count:", pageInfo.productLinks.length);
console.log("Sample product links:");
for (const link of pageInfo.productLinks.slice(0, 30)) {
  console.log(
    `  ${link.href} | img: ${link.childImg ? "YES" : "NO"} | text: "${(link.text || "").slice(0, 80)}"`,
  );
}

// Now extract product cards properly
const products = await page.evaluate(() => {
  const results = [];
  const seen = new Set();

  // Strategy: find product card containers
  const candidates = [];

  // Common patterns for product cards
  const selectors = [
    '[data-testid="product-card"]',
    '[data-testid="product-card-link"]',
    'a[href*="/products/"]',
  ];

  for (const sel of selectors) {
    for (const el of document.querySelectorAll(sel)) {
      const href =
        el.getAttribute("href") || el.closest("a")?.getAttribute("href") || "";
      const img = el.querySelector("img");
      const src =
        img?.getAttribute("src") ||
        img?.getAttribute("data-src") ||
        img?.currentSrc ||
        "";
      const alt = img?.getAttribute("alt") || "";

      // Extract name from aria-label, alt, text, or heading
      let name = "";
      const ariaLabel = el.getAttribute("aria-label");
      const heading = el.querySelector(
        'h2, h3, h4, [data-testid*="name"], [class*="name"]',
      );
      if (ariaLabel) name = ariaLabel;
      else if (heading) name = heading.textContent.trim();
      else if (alt) name = alt;
      else if (el.textContent) {
        // Try to find the product name - often the first meaningful text
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        name = text.slice(0, 120);
      }

      if (href && !seen.has(href)) {
        seen.add(href);
        results.push({ href, imgSrc: src, alt, name });
      }
    }
  }

  return results;
});

console.log("\n=== EXTRACTED PRODUCTS ===");
console.log("Count:", products.length);
for (const p of products.slice(0, 40)) {
  console.log(
    `  "${p.name.slice(0, 80)}" | href: ${p.href} | img: ${p.imgSrc.slice(0, 100)}`,
  );
}

// Now check each image for brokenness
const brokenProducts = [];
const checkedImages = new Set();

for (const product of products) {
  const src = product.imgSrc;
  if (!src || checkedImages.has(src)) continue;
  checkedImages.add(src);

  const imageUrl = src.startsWith("//") ? "https:" + src : src;

  // Check in the page context if the image actually loaded
  const isBroken = await page.evaluate((imgSrc) => {
    return new Promise((resolve) => {
      // Build the full URL
      const url = new URL(imgSrc, window.location.href).href;

      // Check if already in DOM
      const existing = [...document.querySelectorAll("img")].find(
        (i) =>
          i.src === url ||
          (i.getAttribute("src") &&
            new URL(i.getAttribute("src"), window.location.href).href === url),
      );
      if (existing) {
        resolve(!existing.complete || existing.naturalWidth === 0);
        return;
      }

      // Try loading it fresh
      const img = new Image();
      const timer = setTimeout(() => resolve(true), 15000); // timeout = broken
      img.onload = () => {
        clearTimeout(timer);
        resolve(false);
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(true);
      };
      img.src = url;
    });
  }, src);

  if (isBroken) {
    const srcAbs = await page.evaluate(
      (s) => new URL(s, window.location.href).href,
      src,
    );
    console.log(`  BROKEN: "${product.name.slice(0, 80)}" | ${srcAbs}`);
    brokenProducts.push({
      name: product.name,
      slug: product.href,
      imageUrl: srcAbs,
      alt: product.alt,
    });
  } else {
    console.log(`  OK: "${product.name.slice(0, 80)}"`);
  }
}

console.log("\n=== NETWORK FAILURES DETECTED ===");
for (const [url, err] of failedImages.entries()) {
  console.log(`  FAILED: ${url} (${err})`);
}

// Merge network-failed images into broken list
const networkBrokenUrls = new Set(failedImages.keys());
for (const product of products) {
  const abs = await page.evaluate(
    (s) => new URL(s, window.location.href).href,
    product.imgSrc,
  );
  if (
    networkBrokenUrls.has(abs) &&
    !brokenProducts.find((b) => b.imageUrl === abs)
  ) {
    brokenProducts.push({
      name: product.name,
      slug: product.href,
      imageUrl: abs,
      alt: product.alt,
    });
  }
}

const fs = await import("node:fs");
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(brokenProducts, null, 2), "utf8");
console.log(
  `\nSaved ${brokenProducts.length} broken products to ${OUTPUT_FILE}`,
);

// Also save the page info for reference
fs.writeFileSync(
  "accessories-page-info.json",
  JSON.stringify(
    {
      pageInfo: {
        title: pageInfo.title,
        url: pageInfo.url,
        productLinkCount: pageInfo.productLinks.length,
      },
      products,
    },
    null,
    2,
  ),
  "utf8",
);

await browser.close();
