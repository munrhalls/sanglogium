import { test, expect } from '@playwright/test';

test.describe('Homepage Regression Suite', () => {
  test('critical path - homepage loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded successfully
    await expect(page.locator('body')).toBeVisible();
    
    // Check no console errors
    expect(errors).toHaveLength(0);
    
    // Check main elements are present
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('featured carousel navigation @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for featured carousel
    const carousel = page.locator('[aria-roledescription="carousel"], .carousel');
    const carouselCount = await carousel.count();
    
    if (carouselCount > 0) {
      await expect(carousel.first()).toBeVisible();
      
      // Test carousel navigation
      const nextBtn = carousel.locator('button[aria-label*="Next"], .carousel-next');
      
      if (await nextBtn.count() > 0) {
        await expect(nextBtn.first()).toBeVisible();
        
        // Navigate carousel
        await nextBtn.first().click();
        await page.waitForTimeout(300);
        
        // Check something changed
        const activeSlide = carousel.locator('[data-active="true"], .active');
        await expect(activeSlide).toHaveCount.greaterThan(0);
      }
    }
  });

  test('product card click navigation @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for product cards
    const productCards = page.locator('article.card-product, .product-card');
    const cardCount = await productCards.count();
    
    if (cardCount > 0) {
      await expect(productCards.first()).toBeVisible();
      
      // Test product card click
      const firstCard = productCards.first();
      const link = firstCard.locator('a').first();
      
      if (await link.count() > 0) {
        const href = await link.getAttribute('href');
        if (href && href.includes('/products/')) {
          await link.click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain('/products/');
        }
      }
    }
  });

  test('hero CTA navigation @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for hero CTA
    const heroCta = page.locator('h1 ~ a[href*="/products"], header a[href*="/products"], .hero a[href*="/products"]');
    const ctaCount = await heroCta.count();
    
    if (ctaCount > 0) {
      await expect(heroCta.first()).toBeVisible();
      
      const href = await heroCta.first().getAttribute('href');
      if (href && href.startsWith('/')) {
        await heroCta.first().click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).not.toBe('/');
      }
    }
  });

  test('mobile portrait - no overflow @homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check no horizontal overflow
    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(mobileOverflow).toBe(false);
    
    // Check content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('desktop - layout correct @homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check desktop layout elements
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    
    // Check content fits within viewport
    const desktopOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(desktopOverflow).toBe(false);
  });

  test('no console errors on load @homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any delayed errors
    await page.waitForTimeout(2000);
    
    expect(errors).toHaveLength(0);
  });

  test('navigation elements are present @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check navigation is present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check navigation has links
    const navLinks = nav.locator('a[href]');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('sections render without breaking @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check main sections
    const sections = page.locator('main > section, main > article');
    const sectionCount = await sections.count();
    
    if (sectionCount > 0) {
      // Check first few sections are visible
      const checkCount = Math.min(sectionCount, 3);
      
      for (let i = 0; i < checkCount; i++) {
        const section = sections.nth(i);
        await expect(section).toBeVisible();
        
        // Check section doesn't overflow
        const sectionBox = await section.boundingBox();
        if (sectionBox) {
          expect(sectionBox.width).toBeLessThanOrEqual(1280 + 1); // Allow for rounding
        }
      }
    }
  });

  test('images load successfully @homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images
      const checkCount = Math.min(imageCount, 5);
      
      for (let i = 0; i < checkCount; i++) {
        const image = images.nth(i);
        await expect(image).toBeVisible();
        
        // Check image has src
        const src = await image.getAttribute('src');
        expect(src).toBeTruthy();
        expect(src!.length).toBeGreaterThan(0);
      }
    }
  });

  test('responsive behavior works @homepage', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const mobileOverflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(mobileOverflowCheck).toBe(false);
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for responsive adjustments
    
    const tabletOverflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(tabletOverflowCheck).toBe(false);
    
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    const desktopOverflowCheck = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(desktopOverflowCheck).toBe(false);
  });
});
