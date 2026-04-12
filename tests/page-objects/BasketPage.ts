import { Page, expect } from '@playwright/test';

export class BasketPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/basket');
  }
  
  async addProduct(product: any, quantity: number = 1) {
    // Add product using the basket store
    await this.page.evaluate((prod, qty) => {
      // Access the basket store from window
      const store = (window as any).useBasketStore?.();
      if (store) {
        store.addItem({
          ...prod,
          quantity: qty,
          slug: prod.slug?.current || prod.slug
        });
      }
    }, product, quantity);
    
    // Wait for basket to update
    await this.page.waitForTimeout(500);
  }
  
  async clickCheckout() {
    await this.page.click('[data-testid="checkout-button"]');
  }
  
  async getCheckoutButton() {
    return this.page.locator('[data-testid="checkout-button"]');
  }
  
  async isCheckoutEnabled() {
    const button = await this.getCheckoutButton();
    return !(await button.isDisabled());
  }
}
