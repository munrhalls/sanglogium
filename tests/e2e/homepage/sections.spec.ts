import { test, expect } from '@playwright/test';

test.describe('Homepage Section Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Hero Section', () => {
    test('hero section is visible and functional', async ({ page }) => {
      // Check hero section exists
      const hero = page.locator('[data-testid="hero-section"], .hero, header');
      await expect(hero).toBeVisible();
      
      // Check headline is present
      const headline = page.locator('h1');
      await expect(headline).toBeVisible();
      expect(await headline.textContent()).toBeTruthy();
      expect(await headline.textContent()!.length).toBeGreaterThan(0);
      
      // Check CTA button if present
      const ctaButton = page.locator('a[href*="/products"], button[class*="cta"]');
      if (await ctaButton.count() > 0) {
        await expect(ctaButton.first()).toBeVisible();
        
        // Test CTA navigation
        const href = await ctaButton.first().getAttribute('href');
        if (href && href.startsWith('/')) {
          await ctaButton.first().click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain('products');
        }
      }
    });

    test('hero background image loads', async ({ page }) => {
      // Check for background image
      const hero = page.locator('[data-testid="hero-section"], .hero, header');
      
      // Check for background image styles
      const hasBgImage = await hero.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage !== 'none';
      });
      
      // Or check for img element
      const heroImage = hero.locator('img').first();
      const hasImgElement = await heroImage.count() > 0;
      
      expect(hasBgImage || hasImgElement).toBe(true);
    });
  });

  test.describe('Featured Section', () => {
    test('featured section renders with carousel', async ({ page }) => {
      // Look for featured section
      const featured = page.locator('[data-testid="featured-section"], article[class*="featured"]');
      await expect(featured).toBeVisible();
      
      // Check carousel is present
      const carousel = featured.locator('[aria-roledescription="carousel"], .carousel');
      if (await carousel.count() > 0) {
        await expect(carousel).toBeVisible();
        
        // Check carousel controls
        const prevBtn = carousel.locator('button[aria-label*="Previous"], .carousel-prev');
        const nextBtn = carousel.locator('button[aria-label*="Next"], .carousel-next');
        
        if (await prevBtn.count() > 0 && await nextBtn.count() > 0) {
          // Test carousel navigation
          await expect(prevBtn.first()).toBeVisible();
          await expect(nextBtn.first()).toBeVisible();
          
          // Navigate carousel
          await nextBtn.first().click();
          await page.waitForTimeout(300); // Wait for animation
          
          // Check something changed (active slide, etc.)
          const activeSlide = carousel.locator('[data-active="true"], .active');
          await expect(activeSlide).toHaveCount.greaterThan(0);
        }
      }
    });

    test('featured product cards are interactive', async ({ page }) => {
      const featured = page.locator('[data-testid="featured-section"], article[class*="featured"]');
      
      // Look for product cards
      const productCards = featured.locator('article.card-product, .product-card');
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
  });

  test.describe('Product Spotlights', () => {
    test('product spotlights section renders', async ({ page }) => {
      // Look for spotlight sections
      const spotlights = page.locator('[data-testid*="spotlight"], [class*="spotlight"], [class*="product-spotlight"]');
      const spotlightCount = await spotlights.count();
      
      if (spotlightCount > 0) {
        await expect(spotlights.first()).toBeVisible();
        
        // Check for "See More" CTAs
        const seeMoreButtons = spotlights.locator('a:has-text("See More"), button:has-text("See More")');
        const ctaCount = await seeMoreButtons.count();
        
        if (ctaCount > 0) {
          await expect(seeMoreButtons.first()).toBeVisible();
          
          // Test CTA navigation
          const href = await seeMoreButtons.first().getAttribute('href');
          if (href && href.startsWith('/')) {
            await seeMoreButtons.first().click();
            await page.waitForLoadState('networkidle');
            expect(page.url()).not.toBe('/');
          }
        }
      }
    });
  });

  test.describe('IEM Gallery Section', () => {
    test('iem gallery renders with grid layout', async ({ page }) => {
      // Look for IEM gallery
      const iemGallery = page.locator('[data-testid="iem-gallery"], [class*="iem"], [class*="gallery"]');
      const galleryCount = await iemGallery.count();
      
      if (galleryCount > 0) {
        await expect(iemGallery.first()).toBeVisible();
        
        // Check for grid layout
        const grid = iemGallery.locator('.grid');
        const gridCount = await grid.count();
        
        if (gridCount > 0) {
          await expect(grid.first()).toBeVisible();
          
          // Check grid columns on desktop
          const gridCols = await grid.first().evaluate((el) => {
            return window.getComputedStyle(el).gridTemplateColumns;
          });
          
          expect(gridCols).toBeTruthy();
        }
        
        // Test product card interactions
        const productCards = iemGallery.locator('article.card-product, .product-card');
        const cardCount = await productCards.count();
        
        if (cardCount > 0) {
          await expect(productCards.first()).toBeVisible();
          
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
      }
    });
  });

  test.describe('Newest Release Section', () => {
    test('newest release section renders', async ({ page }) => {
      // Look for newest release section
      const newestRelease = page.locator('[data-testid="newest-release"], [class*="newest"], [class*="release"]');
      const releaseCount = await newestRelease.count();
      
      if (releaseCount > 0) {
        await expect(newestRelease.first()).toBeVisible();
        
        // Check for product display
        const productDisplay = newestRelease.locator('article.card-product, .product-card, [class*="product"]');
        if (await productDisplay.count() > 0) {
          await expect(productDisplay.first()).toBeVisible();
        }
        
        // Test CTA if present
        const ctaButton = newestRelease.locator('a[href*="/products"], button[class*="cta"]');
        if (await ctaButton.count() > 0) {
          await expect(ctaButton.first()).toBeVisible();
          
          const href = await ctaButton.first().getAttribute('href');
          if (href && href.startsWith('/')) {
            await ctaButton.first().click();
            await page.waitForLoadState('networkidle');
            expect(page.url()).toContain('products');
          }
        }
      }
    });
  });

  test.describe('DACs Section', () => {
    test('dacs section renders with carousel', async ({ page }) => {
      // Look for DACs section
      const dacsSection = page.locator('[data-testid="dacs"], [class*="dac"]');
      const dacsCount = await dacsSection.count();
      
      if (dacsCount > 0) {
        await expect(dacsSection.first()).toBeVisible();
        
        // Check for carousel
        const carousel = dacsSection.locator('[aria-roledescription="carousel"], .carousel');
        if (await carousel.count() > 0) {
          await expect(carousel.first()).toBeVisible();
          
          // Test carousel functionality
          const nextBtn = carousel.locator('button[aria-label*="Next"], .carousel-next');
          if (await nextBtn.count() > 0) {
            await expect(nextBtn.first()).toBeVisible();
            await nextBtn.first().click();
            await page.waitForTimeout(300);
          }
        }
      }
    });
  });

  test.describe('Accessories Section', () => {
    test('accessories section renders with categories', async ({ page }) => {
      // Look for accessories section
      const accessoriesSection = page.locator('[data-testid="accessories"], [class*="accessory"]');
      const accessoriesCount = await accessoriesSection.count();
      
      if (accessoriesCount > 0) {
        await expect(accessoriesSection.first()).toBeVisible();
        
        // Check for category sections (cables, pads, etc.)
        const categories = accessoriesSection.locator('[class*="category"], [class*="cable"], [class*="pad"]');
        const categoryCount = await categories.count();
        
        if (categoryCount > 0) {
          await expect(categories.first()).toBeVisible();
          
          // Check for product cards in categories
          const productCards = categories.locator('article.card-product, .product-card');
          const cardCount = await productCards.count();
          
          if (cardCount > 0) {
            await expect(productCards.first()).toBeVisible();
            
            // Test card interaction
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
        }
      }
    });
  });

  test.describe('General Homepage Functionality', () => {
    test('all sections have proper accessibility landmarks', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      const h2s = page.locator('h2');
      const h2Count = await h2s.count();
      expect(h2Count).toBeGreaterThan(0);
      
      // Check for landmark elements
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      const footer = page.locator('footer');
      if (await footer.count() > 0) {
        await expect(footer).toBeVisible();
      }
    });

    test('navigation links work correctly', async ({ page }) => {
      // Test main navigation
      const navLinks = page.locator('nav a[href]');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Test first few navigation links
        const testLinks = Math.min(linkCount, 3);
        
        for (let i = 0; i < testLinks; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && href.startsWith('/') && !href.includes('#')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Verify navigation worked
            expect(page.url()).not.toBe('/');
            
            // Go back to homepage
            await page.goto('/');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('no console errors on homepage', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any delayed errors
      await page.waitForTimeout(2000);
      
      expect(errors).toHaveLength(0);
    });
  });
});
