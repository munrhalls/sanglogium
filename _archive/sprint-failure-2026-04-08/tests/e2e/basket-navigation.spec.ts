import { test, expect } from '@playwright/test';

/**
 * Basket Navigation E2E Tests - Professional Robust Standard
 * 
 * Objectives:
 * 1. Verify basket page URL and rendering.
 * 2. Verify all links to basket (Header & ActionBar) navigate correctly.
 * 3. Verify browser history (back/forth) consistency.
 * 
 * Rules followed:
 * - No waitForTimeout
 * - Web-first assertions
 * - Multi-viewport support
 */

test.describe('Basket Page Navigation', () => {

  test.beforeEach(async ({ page }) => {
    // Standard entry to the application
    await page.goto('/');
  });

  test('should render properly when navigated to directly', async ({ page }) => {
    // GIVEN: User navigates directly to /basket
    await page.goto('/basket');

    // THEN: URL is correct
    await expect(page).toHaveURL(/\/basket/);

    // AND: Page content is visible (Your Basket)
    // Using a more flexible locator for the title
    const title = page.locator('h1', { hasText: /Basket/i });
    await expect(title).toBeVisible({ timeout: 10000 });
    
    // AND: The main layout structure is present
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to basket via header link and support history', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Header link is usually hidden on mobile');

    // GIVEN: User is on home page
    await expect(page).toHaveURL(/\/$/);

    // WHEN: Clicking the basket link in the header
    const headerBasketLink = page.locator('header a[href="/basket"]').first();
    await expect(headerBasketLink).toBeVisible();
    await headerBasketLink.click();

    // THEN: Reached basket page
    await expect(page).toHaveURL(/\/basket/);
    await expect(page.locator('h1', { hasText: /Basket/i })).toBeVisible();

    // WHEN: Navigating back in history
    await page.goBack();

    // THEN: Returned to home page with correct rendering
    await expect(page).not.toHaveURL(/\/basket/);
    await expect(page.locator('header')).toBeVisible();

    // WHEN: Navigating forward in history
    await page.goForward();

    // THEN: Returned to basket page correctly
    await expect(page).toHaveURL(/\/basket/);
    await expect(page.locator('h1', { hasText: /Basket/i })).toBeVisible();
  });

  test('should navigate to basket via mobile action bar and support history', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'ActionBar is usually hidden on desktop');

    // GIVEN: User is on home page (mobile viewport)
    await expect(page).toHaveURL(/\/$/);

    // WHEN: Clicking the basket link in the fixed action bar
    const mobileBasketLink = page.locator('div.fixed a[href="/basket"]').first();
    await expect(mobileBasketLink).toBeVisible();
    await mobileBasketLink.click();

    // THEN: Reached basket page
    await expect(page).toHaveURL(/\/basket/);
    await expect(page.locator('h1', { hasText: /Basket/i })).toBeVisible();

    // WHEN: Navigating back in history
    await page.goBack();

    // THEN: Returned to home page correctly
    await expect(page).not.toHaveURL(/\/basket/);

    // WHEN: Navigating forward in history
    await page.goForward();

    // THEN: Returned to basket page correctly
    await expect(page).toHaveURL(/\/basket/);
  });

  test('should support navigation between product page and basket', async ({ page }) => {
    // 1. Visit a product page
    // Ensure we find a product link that is actually visible
    const productLink = page.locator('a[href^="/product/"]').filter({ visible: true }).first();
    await expect(productLink).toBeVisible({ timeout: 15000 });
    await productLink.click();
    
    // Wait for the product page to load
    await expect(page).toHaveURL(/\/product\//);
    const productUrl = page.url();

    // 2. Go to basket
    const basketLink = page.locator('a[href="/basket"]').filter({ visible: true }).first();
    await expect(basketLink).toBeVisible();
    await basketLink.click();
    await expect(page).toHaveURL(/\/basket/);

    // 3. Back to product
    await page.goBack();
    await expect(page).toHaveURL(productUrl);
    
    // 4. Forward to basket
    await page.goForward();
    await expect(page).toHaveURL(/\/basket/);
    await expect(page.locator('h1', { hasText: /Basket/i })).toBeVisible();
  });
});
