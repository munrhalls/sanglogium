import { test, expect } from "@playwright/test";

test.describe("Catalogue Navbar - Auto-close on navigation", () => {
  test("dropdown closes after clicking catalogue item and navigating", async ({
    page,
  }) => {
    // Desktop viewport to show catalogue navbar
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Open dropdown by clicking a category
    await page.click("text=Headphones");

    // Verify dropdown is open (Close button visible)
    await expect(page.locator("text=Close")).toBeVisible();

    // Click a catalogue item link
    await page.click("text=Open-Back");

    // Wait for navigation to complete
    await page.waitForURL("**/products/**");

    // Verify dropdown closed (Close button not visible)
    await expect(page.locator("text=Close")).not.toBeVisible();
  });

  test("dropdown closes when clicking same category (toggle)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Open dropdown
    await page.click("text=Headphones");
    await expect(page.locator("text=Close")).toBeVisible();

    // Click same category again - should close
    await page.click("text=Headphones");
    await expect(page.locator("text=Close")).not.toBeVisible();
  });

  test("dropdown switches content when clicking different category", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Open first category
    await page.click("text=Headphones");
    await expect(
      page.locator("text=Open-Back Headphones")
    ).toBeInTheDocument();

    // Switch to second category
    await page.click("text=DACs");
    await expect(page.locator("text=Desktop DACs")).toBeInTheDocument();

    // Dropdown should still be open
    await expect(page.locator("text=Close")).toBeVisible();
  });

  test("dropdown closes when Close button clicked", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    // Open dropdown
    await page.click("text=Headphones");
    await expect(page.locator("text=Close")).toBeVisible();

    // Click Close button
    await page.click("text=Close");
    await expect(page.locator("text=Close")).not.toBeVisible();
  });
});
