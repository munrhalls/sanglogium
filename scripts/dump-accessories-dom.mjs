import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/accessories";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log(`Navigating to ${PAGE_URL}...`);
await page.goto(PAGE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(5000);

// Scroll to trigger lazy loading
for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(500);
}
await page.waitForTimeout(2000);

// Dump all images on the page
const images = await page.evaluate(() => {
  const results = [];
  for (const img of document.querySelectorAll("img")) {
    const src = img.getAttribute("src") || img.currentSrc || "";
    const alt = img.getAttribute("alt") || "";
    const dataSrc = img.getAttribute("data-src") || "";
    const loading = img.getAttribute("loading") || "";
    const complete = img.complete;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const w = img.getBoundingClientRect().width;
    const h = img.getBoundingClientRect().height;

    // Find the closest product link or card
    const link = img.closest("a");
    const card = img.closest(
      "[data-testid], article, li, div[class*='card'], div[class*='product']",
    );

    results.push({
      src: src.slice(0, 200),
      dataSrc: dataSrc.slice(0, 200),
      alt: alt.slice(0, 120),
      loading,
      complete,
      naturalWidth,
      naturalHeight,
      renderedW: Math.round(w),
      renderedH: Math.round(h),
      linkHref: link?.getAttribute("href") || "",
      cardTag: card?.tagName || "",
      cardTestId: card?.getAttribute("data-testid") || "",
      cardClass: card?.getAttribute("class")?.slice(0, 150) || "",
    });
  }
  return results;
});

console.log(`\nTotal <img> elements found: ${images.length}`);
for (const img of images) {
  console.log(`\n---`);
  console.log(`src: ${img.src}`);
  console.log(`alt: ${img.alt}`);
  console.log(
    `loaded: complete=${img.complete} natural=${img.naturalWidth}x${img.naturalHeight} rendered=${img.renderedW}x${img.renderedH}`,
  );
  console.log(`link: ${img.linkHref || "(none)"}`);
  console.log(
    `card: <${img.cardTag}${img.cardTestId ? ` data-testid="${img.cardTestId}"` : ""} class="${img.cardClass}">`,
  );
}

// Also dump the main content structure
const mainStructure = await page.evaluate(() => {
  const main =
    document.querySelector("main") || document.querySelector("#__next");
  if (!main) return "NO MAIN FOUND";

  // Get all section-level containers and their class names
  const sections = [
    ...main.querySelectorAll(
      "section, [class*='grid'], [class*='list'], [class*='product']",
    ),
  ]
    .slice(0, 50)
    .map((s) => ({
      tag: s.tagName,
      testid: s.getAttribute("data-testid") || "",
      cls: (s.getAttribute("class") || "").slice(0, 200),
      childCount: s.children.length,
    }));

  return sections;
});

console.log("\n\n=== MAIN STRUCTURE ===");
console.log(JSON.stringify(mainStructure, null, 2));

await browser.close();
