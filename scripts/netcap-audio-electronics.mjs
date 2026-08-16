// Network capture during slow scroll of the audio-electronics page.
// Counts image requests to the Sanity CDN and their outcomes.
import { chromium } from "@playwright/test";

const PAGE_URL = "http://localhost:3000/products/audio-electronics";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const reqs = [];
page.on("request", (r) => {
  if (r.url().includes("cdn.sanity.io")) reqs.push({ url: r.url(), ok: null, status: null });
});
page.on("response", (r) => {
  if (r.url().includes("cdn.sanity.io")) {
    const found = reqs.find((q) => q.url === r.url());
    if (found) {
      found.status = r.status();
      found.ok = r.ok();
    }
  }
});

await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 300000 });
await page.waitForTimeout(4000);
await page.waitForSelector('article[data-testid="product-card"]', { timeout: 60000 });

async function slowScrollToBottom() {
  const vh = await page.evaluate(() => window.innerHeight);
  for (let pos = 0; ; pos += vh * 0.5) {
    await page.evaluate((p) => window.scrollTo(0, p), pos);
    await page.waitForTimeout(700);
    const total = await page.evaluate(() => document.body.scrollHeight);
    if (pos >= total) break;
  }
}
await slowScrollToBottom();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(5000);

const distinct = new Set(reqs.map((r) => r.url.split("?")[0]));
const statusCounts = {};
for (const r of reqs) {
  if (r.status == null) statusCounts.pending = (statusCounts.pending || 0) + 1;
  else statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
}
console.log(
  JSON.stringify(
    {
      totalRequests: reqs.length,
      distinctUrls: distinct.size,
      statusCounts,
    },
    null,
    2,
  ),
);
await browser.close();
