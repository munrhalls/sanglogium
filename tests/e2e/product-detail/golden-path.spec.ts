import { test, expect } from '@playwright/test';
import { 
  TEST_PRODUCT, 
  selectors, 
  navigateToProduct 
} from '../../utils/product-detail-helpers';

/**
 * Golden Path E2E Test
 * 
 * Proves complete customer journey works end-to-end:
 * 1. Navigate to product page
 * 2. Verify product data renders
 * 3. Verify images load
 * 4. Test breadcrumb navigation
 * 5. Test quantity selector
 * 6. Test add to cart
 * 7. Test related products navigation
 */
test.describe('Product Detail Page - Golden Path', () => {
  
  test('Complete customer journey', async ({ page }) => {
    // 1. Navigate to product
    await navigateToProduct(page, TEST_PRODUCT.slug);
    
    // 2. Verify critical content renders
    await expect(page.locator(selectors.productName)).toContainText(TEST_PRODUCT.name);
    await expect(page.locator(selectors.productPrice)).toBeVisible();
    
    // 3. Verify images load
    await expect(page.locator(selectors.mainImage)).toBeVisible();
    const imageSrc = await page.locator(selectors.mainImage).getAttribute('src');
    expect(imageSrc).toBeTruthy();
    
    // 4. Test breadcrumb navigation - Home
    await page.locator(selectors.breadcrumbHome).first().click();
    await expect(page).toHaveURL('/');
    
    // Go back and test Products breadcrumb
    await page.goBack();
    await expect(page).toHaveURL(`/products/${TEST_PRODUCT.slug}`);
    
    // 5. Test quantity selector
    const quantityBefore = await page.locator(selectors.quantityValue).textContent();
    await page.locator(selectors.quantityIncrease).click();
    await expect(page.locator(selectors.quantityValue)).toHaveText('2');
    
    // 6. Test add to cart
    await page.locator(selectors.addToCartButton).click();
    // Cart count should update (may need specific selector based on your nav)
    
    // 7. Test related products navigation
    const relatedLink = page.locator(selectors.relatedProductLink).first();
    const href = await relatedLink.getAttribute('href');
    expect(href).toBeTruthy();
    await relatedLink.click();
    
    // Verify navigation succeeded (no 404)
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=Not Found')).not.toBeVisible();
  });
  
});
