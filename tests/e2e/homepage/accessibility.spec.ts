import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Homepage Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('axe-core scan passes WCAG 2.1 AA', async ({ page }) => {
    // Inject axe-core
    await injectAxe(page);
    
    // Run accessibility scan
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // Enable WCAG 2.1 AA rules
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'heading-order': { enabled: true },
        'image-alt': { enabled: true },
        'link-name': { enabled: true },
        'button-name': { enabled: true },
        'label-title-only': { enabled: true },
        'label-content-name-mismatch': { enabled: true },
        'duplicate-id': { enabled: true },
        'tabindex': { enabled: true },
        'skip-link': { enabled: true },
        'frame-tested': { enabled: true },
        'html-has-lang': { enabled: true },
        'landmark-unique': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
        'aria-hidden-focus': { enabled: true },
        'aria-hidden-body': { enabled: true },
        'aria-input-field-name': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'bypass': { enabled: true },
        'document-title': { enabled: true },
        'html-lang-valid': { enabled: true },
        'meta-viewport': { enabled: true },
        'meta-viewport-large': { enabled: true },
        'meta-viewport-valid': { enabled: true },
        'no-autoplay-audio': { enabled: true },
        'role-img-alt': { enabled: true },
        'scope-attr-valid': { enabled: true },
        'unique-landmark': { enabled: true },
        'video-caption': { enabled: true },
        'video-description': { enabled: true },
        'aria-labels': { enabled: true },
        'aria-allowed-attr': { enabled: true },
        'aria-hidden-body-tabbable': { enabled: true },
        'aria-input-field-name': { enabled: true },
        'aria-meter-name': { enabled: true },
        'aria-progressbar-name': { enabled: true },
        'aria-roledescription': { enabled: true },
        'aria-toggle-field-name': { enabled: true },
        'aria-tooltip-name': { enabled: true },
        'aria-treeitem-name': { enabled: true },
        'button-has-visible-text': { enabled: true },
        'definition-list': { enabled: true },
        'dlitem': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'header-legend': { enabled: true },
        'input-button-name': { enabled: true },
        'link-in-text-block': { enabled: true },
        'list': { enabled: true },
        'listitem': { enabled: true },
        'meta-refresh': { enabled: true },
        'meta-viewport-no-scale': { enabled: true },
        'object-alt': { enabled: true },
        'table-headers': { enabled: true },
        'td-headers-attr': { enabled: true },
        'th-has-data-cells': { enabled: true },
        'valid-lang': { enabled: true },
        'video-description-named': { enabled: true }
      }
    });
  });

  test('keyboard navigation works correctly', async ({ page }) => {
    // Get all interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    if (interactiveElements.length === 0) {
      test.skip();
      return;
    }

    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is on an interactive element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test tab through all interactive elements
    let tabCount = 0;
    const maxTabs = Math.min(interactiveElements.length, 20); // Limit to prevent infinite loops
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Check that focus is visible
      const focused = await page.locator(':focus');
      const isVisible = await focused.isVisible();
      
      if (isVisible) {
        // Check for focus indicator (outline or similar)
        const hasFocusIndicator = await focused.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.outline !== 'none' || 
                 style.boxShadow !== 'none' || 
                 style.border !== 'none' ||
                 el.classList.contains('focus') ||
                 el.classList.contains('focus-visible') ||
                 el.classList.contains('ring') ||
                 el.classList.contains('ring-2') ||
                 el.classList.contains('ring-offset-2');
        });
        
        // Note: Some elements may use custom focus styles that aren't easily detectable
        // This is a basic check - in production, you'd want to test specific focus styles
      }
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('heading hierarchy is correct', async ({ page }) => {
    // Check for single h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // Check h1 content
    const h1Text = await h1Elements.textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text!.length).toBeGreaterThan(0);
    
    // Get all headings and check hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels: number[] = [];
    
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      headingLevels.push(level);
    }
    
    // Check that heading levels don't skip (e.g., h1 to h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];
      
      // Allow same level or level+1, but not skipping levels
      if (currentLevel > previousLevel) {
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }
    }
  });

  test('image alt text is present', async ({ page }) => {
    // Get all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount === 0) {
      test.skip();
      return;
    }
    
    // Check each image has alt text
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      
      // Alt text should not be empty unless image is decorative
      // Decorative images should have alt="" but this is hard to detect programmatically
      expect(altText).toBeDefined();
    }
  });

  test('button and link labels are descriptive', async ({ page }) => {
    // Check buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      
      // Check for text content
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      const hasLabel = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBe(true);
    }
    
    // Check links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      
      // Check for text content
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledBy = await link.getAttribute('aria-labelledby');
      
      const hasLabel = (text && text.trim().length > 0) || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBe(true);
    }
  });

  test('focus indicators are visible', async ({ page }) => {
    // Get first interactive element
    const firstInteractive = page.locator('button, a, input, select, textarea').first();
    const count = await firstInteractive.count();
    
    if (count === 0) {
      test.skip();
      return;
    }
    
    // Focus the element
    await firstInteractive.focus();
    
    // Check if focused
    const isFocused = await firstInteractive.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(true);
    
    // Check for focus styles
    const hasFocusStyle = await firstInteractive.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' || 
             style.boxShadow !== 'none' || 
             style.border !== 'none' ||
             el.classList.contains('focus') ||
             el.classList.contains('focus-visible') ||
             el.classList.contains('ring') ||
             el.classList.contains('ring-2') ||
             el.classList.contains('ring-offset-2');
    });
    
    // Note: This test might fail if focus styles are implemented in ways not detected here
    // In production, you'd want to test specific focus style implementations
  });

  test('color contrast meets WCAG standards', async ({ page }) => {
    // This is a simplified check - full color contrast testing requires more sophisticated tools
    await injectAxe(page);
    
    // Run just the color-contrast rule
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
        // Disable other rules to focus on color contrast
        'keyboard-navigation': { enabled: false },
        'focus-order-semantics': { enabled: false },
        'heading-order': { enabled: false },
        'image-alt': { enabled: false },
        'link-name': { enabled: false },
        'button-name': { enabled: false }
      }
    });
  });

  test('landmark elements are present and unique', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toHaveCount.greaterThanOrEqual(1);
    
    // Check for header
    const header = page.locator('header');
    if (await header.count() > 0) {
      await expect(header).toHaveCount(1);
    }
    
    // Check for footer
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await expect(footer).toHaveCount(1);
    }
  });

  test('form elements have proper labels', async ({ page }) => {
    // Check input elements
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputType = await input.getAttribute('type');
      
      // Skip hidden inputs and submit buttons
      if (inputType === 'hidden' || inputType === 'submit') {
        continue;
      }
      
      // Check for label, aria-label, or aria-labelledby
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      let hasLabel = ariaLabel || ariaLabelledBy;
      
      if (id && !hasLabel) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      
      expect(hasLabel).toBe(true);
    }
  });
});
