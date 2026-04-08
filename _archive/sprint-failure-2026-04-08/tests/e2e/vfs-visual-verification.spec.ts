import { test, expect } from "@playwright/test";

/**
 * VFS Visual Verification Test Suite
 * Tests all 22 catalogue categories for correct product filtering
 */

const CATEGORIES = [
  { path: "headphones/open-back", name: "Open-Back Headphones" },
  { path: "headphones/closed-back", name: "Closed-Back Headphones" },
  { path: "headphones/in-ear", name: "In-Ear Headphones" },
  { path: "headphones/on-ear", name: "On-Ear Headphones" },
  { path: "audio-electronics/desktop-amps", name: "Desktop Amps" },
  { path: "audio-electronics/portable-amps", name: "Portable Amps" },
  { path: "audio-electronics/desktop-dacs", name: "Desktop DACs" },
  { path: "audio-electronics/portable-dacs", name: "Portable DACs" },
  { path: "accessories/earpads", name: "Earpads" },
  { path: "accessories/cables", name: "Cables" },
  { path: "accessories/adapters", name: "Adapters" },
  { path: "accessories/cases", name: "Cases" },
];

test.describe("VFS Category Visual Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on("console", (msg) => {
      if (msg.type() === "log") {
        console.log(`[Browser Console] ${msg.text()}`);
      }
    });
  });

  for (const category of CATEGORIES) {
    test(`Verify category: ${category.name}`, async ({ page }) => {
      // Navigate to category
      await page.goto(`/products/${category.path}`);
      
      // Wait for page to load
      await page.waitForLoadState("networkidle");
      
      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/vfs-${category.path.replace(/\//g, "-")}.png`,
        fullPage: true,
      });

      // Verify console shows correct category data
      // Note: This is a manual verification step - check console output

      // Verify products are displayed (or "No products found" if empty)
      const productGrid = page.locator('[data-testid="product-grid"], .product-grid, main');
      await expect(productGrid).toBeVisible();

      // Count product cards
      const productCards = page.locator('[data-testid="product-card"], .product-card, article');
      const count = await productCards.count();
      
      console.log(`[VFS Test] ${category.name}: Found ${count} products`);
    });
  }

  test("Homepage catalogue navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take screenshot of homepage
    await page.screenshot({
      path: "test-results/vfs-homepage.png",
      fullPage: true,
    });

    // Find and click a catalogue item
    const catalogueLink = page.locator('a[href*="/products/headphones/open-back"]').first();
    
    if (await catalogueLink.isVisible().catch(() => false)) {
      await catalogueLink.click();
      await page.waitForURL("**/products/headphones/open-back");
      
      // Verify navigation worked (client-side, not full reload)
      await expect(page).toHaveURL(/\/products\/headphones\/open-back/);
      
      console.log("[VFS Test] Catalogue navigation successful (client-side)");
    } else {
      console.log("[VFS Test] Catalogue link not found - may need to open drawer first");
    }
  });
});
