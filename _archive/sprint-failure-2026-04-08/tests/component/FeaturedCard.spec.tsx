import { test, expect, mount } from '@playwright/experimental-ct-react';
import { FeaturedCard } from '../../../app/components/features/homepage/featured/Featured';
import { mockProduct } from '../../utils/homepage-helpers';

// Mock the urlFor function
const mockUrlFor = {
  width: () => ({
    auto: () => ({
      quality: () => ({
        url: () => '/test-image.jpg'
      })
    })
  })
};

test.describe('FeaturedCard Component', () => {
  test('renders product information correctly', async ({ page }) => {
    await mount(
      <FeaturedCard product={mockProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const card = page.locator('article.card-product');

    // Check card exists
    await expect(card).toBeVisible();

    // Check brand
    await expect(page.locator('text=TestBrand')).toBeVisible();

    // Check product name
    await expect(page.locator('text=Test Headphone Model')).toBeVisible();

    // Check price
    await expect(page.locator('text=$299.99')).toBeVisible();

    // Check add to cart button
    const addToCartBtn = page.locator('button[aria-label="Add Test Headphone Model to cart"]');
    await expect(addToCartBtn).toBeVisible();
    await expect(addToCartBtn).toContainText('Add');
  });

  test('has correct accessibility attributes', async ({ page }) => {
    // Check article role
    const card = page.locator('article.card-product');
    await expect(card).toHaveAttribute('role', 'article');

    // Check image alt text
    const image = page.locator('img');
    await expect(image).toHaveAttribute('alt', 'Test Headphone Model');

    // Check button aria-label
    const addToCartBtn = page.locator('button[aria-label="Add Test Headphone Model to cart"]');
    await expect(addToCartBtn).toHaveAttribute('aria-label', 'Add Test Headphone Model to cart');
  });

  test('has correct navigation link', async ({ page }) => {
    const link = page.locator('a[href="/products/test-headphone-model"]');
    await expect(link).toBeVisible();
  });

  test('applies hover classes correctly', async ({ page }) => {
    const card = page.locator('article.card-product');

    // Check hover classes are present
    await expect(card).toHaveClass(/group/);
    await expect(card).toHaveClass(/group-hover:shadow-cardHover/);
    await expect(card).toHaveClass(/group-hover:-translate-y-1/);
    await expect(card).toHaveClass(/transition-all/);
    await expect(card).toHaveClass(/duration-300/);
  });

  test('image has correct loading attributes', async ({ page }) => {
    const image = page.locator('img');

    // First image should have priority and eager loading
    await expect(image).toHaveAttribute('priority', 'true');
    await expect(image).toHaveAttribute('loading', 'eager');
  });

  test('image has correct styling classes', async ({ page }) => {
    const image = page.locator('img');

    await expect(image).toHaveClass(/h-full/);
    await expect(image).toHaveClass(/w-full/);
    await expect(image).toHaveClass(/object-contain/);
    await expect(image).toHaveClass(/mix-blend-multiply/);
    await expect(image).toHaveClass(/transition-transform/);
    await expect(image).toHaveClass(/duration-700/);
    await expect(image).toHaveClass(/group-hover:scale-110/);
  });

  test('button has correct styling and icon', async ({ page }) => {
    const button = page.locator('button[aria-label="Add Test Headphone Model to cart"]');

    // Check button classes
    await expect(button).toHaveClass(/btn-cart/);
    await expect(button).toHaveClass(/transition-all/);
    await expect(button).toHaveClass(/active:scale-95/);

    // Check button has icon
    const icon = button.locator('svg');
    await expect(icon).toBeVisible();

    // Check button has text
    await expect(button.locator('span')).toContainText('Add');
  });

  test('card layout structure is correct', async ({ page }) => {
    const card = page.locator('article.card-product');

    // Check figure element
    const figure = card.locator('figure');
    await expect(figure).toBeVisible();
    await expect(figure).toHaveClass(/aspect-\[4\/3\]/);
    await expect(figure).toHaveClass(/relative/);
    await expect(figure).toHaveClass(/bg-surface-productImage/);

    // Check brand span
    const brandSpan = figure.locator('span.text-brand-900');
    await expect(brandSpan).toBeVisible();
    await expect(brandSpan).toHaveText('TestBrand');

    // Check content div
    const contentDiv = card.locator('div.flex.flex-col.flex-grow');
    await expect(contentDiv).toBeVisible();

    // Check heading
    const heading = contentDiv.locator('h3.type-body');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Test Headphone Model');

    // Check price and button container
    const priceContainer = contentDiv.locator('div.mt-auto');
    await expect(priceContainer).toBeVisible();
  });
});
