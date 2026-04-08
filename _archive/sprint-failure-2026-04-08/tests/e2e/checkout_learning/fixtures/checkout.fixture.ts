import { test as base, Page } from "@playwright/test";
import { TEST_PRODUCT_IDS } from "./test-data";

/**
 * Extended Playwright Test Fixture for Checkout
 * Provides pre-configured pages and stateful basket seeding/cleaning
 */
export const test = base.extend<{
  authenticatedPage: Page;
  guestPage: Page;
  seededBasket: void;
  cleanBasket: void;
}>({
  /**
   * Authenticated Page
   * TODO: Implement Clerk test-token injection in SC-7
   */
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/");
    await use(page);
  },

  /**
   * Guest Page
   * Standard fresh session
   */
  guestPage: async ({ page }, use) => {
    await page.goto("/");
    await use(page);
  },

  /**
   * Seeded Basket
   * Decouples checkout tests from manual basket interaction logic
   */
  seededBasket: async ({ page }, use) => {
    await page.goto("/");
    await page.evaluate((productId) => {
      const basketItem = {
        _id: productId,
        name: "Test Product",
        displayPrice: 99.99,
        stock: 10,
        quantity: 1,
        image: "image-test",
        slug: "test-product"
      };

      localStorage.setItem("basket-storage", JSON.stringify({
        state: { basket: [basketItem] },
        version: 1
      }));
    }, TEST_PRODUCT_IDS[0]);
    
    await page.reload();
    await use();
  },

  /**
   * Clean Basket
   * Ensures clean slate for guard validation tests
   */
  cleanBasket: async ({ page }, use) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("basket-storage"));
    await page.reload();
    await use();
  }
});

export { expect } from "@playwright/test";
