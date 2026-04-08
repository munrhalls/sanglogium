import { test, expect } from '@playwright/experimental-ct-react';
import AccessoryCard from '../../../app/components/features/homepage/accessories/AccessoryCard';
import { mockAccessoryProduct } from '../../utils/homepage-helpers';

// Mock the urlFor function
const mockUrlFor = {
  width: () => ({
    auto: () => ({
      quality: () => ({
        url: () => '/test-accessory-image.jpg'
      })
    })
  })
};

test.describe('AccessoryCard Component', () => {
  test('renders accessory product information correctly', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
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
    await expect(page.locator('text=TestAccessoryBrand')).toBeVisible();
    
    // Check product name
    await expect(page.locator('text=Test Accessory Model')).toBeVisible();
    
    // Check price
    await expect(page.locator('text=$49.99')).toBeVisible();
    
    // Check add to cart button
    const addToCartBtn = page.locator('button');
    await expect(addToCartBtn).toBeVisible();
  });

  test('has correct accessibility attributes', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    // Check article role
    const card = page.locator('article.card-product');
    await expect(card).toHaveAttribute('role', 'article');
    
    // Check image alt text
    const image = page.locator('img');
    await expect(image).toHaveAttribute('alt', 'Test Accessory Model');
  });

  test('has correct navigation link', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const link = page.locator('a[href="/products/test-accessory-model"]');
    await expect(link).toBeVisible();
  });

  test('applies hover classes correctly', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const card = page.locator('article.card-product');
    
    // Check hover classes are present
    await expect(card).toHaveClass(/group/);
    await expect(card).toHaveClass(/group-hover:shadow-cardHover/);
    await expect(card).toHaveClass(/group-hover:-translate-y-1/);
    await expect(card).toHaveClass(/transition-all/);
    await expect(card).toHaveClass(/duration-300/);
  });

  test('image has correct loading attributes for first card', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    // First accessory card should have priority and eager loading
    await expect(image).toHaveAttribute('priority', 'true');
    await expect(image).toHaveAttribute('loading', 'eager');
  });

  test('image has correct loading attributes for subsequent cards', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={1} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    // Subsequent cards should have lazy loading
    await expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('image has correct styling classes', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    await expect(image).toHaveClass(/h-auto/);
    await expect(image).toHaveClass(/max-h-\[75%\]/);
    await expect(image).toHaveClass(/w-auto/);
    await expect(image).toHaveClass(/max-w-\[75%\]/);
    await expect(image).toHaveClass(/object-contain/);
    await expect(image).toHaveClass(/object-center/);
    await expect(image).toHaveClass(/mix-blend-multiply/);
    await expect(image).toHaveClass(/transition-transform/);
    await expect(image).toHaveClass(/duration-700/);
    await expect(image).toHaveClass(/group-hover:scale-110/);
  });

  test('has responsive image classes', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    // Check responsive classes
    await expect(image).toHaveClass(/md:max-h-full/);
    await expect(image).toHaveClass(/md:max-w-full/);
    await expect(image).toHaveClass(/md:h-full/);
    await expect(image).toHaveClass(/md:w-full/);
  });

  test('button has responsive text', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const button = page.locator('button');
    
    // Should have "Add to Cart" text hidden on mobile, visible on desktop
    const desktopText = button.locator('span.hidden.md:block');
    await expect(desktopText).toBeVisible();
    await expect(desktopText).toHaveText('Add to Cart');
    
    // Should have "Add" text visible on mobile, hidden on desktop
    const mobileText = button.locator('span.md:hidden');
    await expect(mobileText).toBeVisible();
    await expect(mobileText).toHaveText('Add');
  });

  test('button is full width', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const button = page.locator('button');
    await expect(button).toHaveClass(/w-full/);
    await expect(button).toHaveClass(/justify-center/);
  });

  test('has border top on button container', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const buttonContainer = page.locator('div.mt-auto.pt-4');
    await expect(buttonContainer).toHaveClass(/border-t/);
    await expect(buttonContainer).toHaveClass(/border-border-secondary\/50/);
  });

  test('handles missing product data gracefully', async ({ mount }) => {
    await mount(<AccessoryCard item={null} idx={0} />);
    
    // Component should render null (nothing visible)
    const card = page.locator('article.card-product');
    await expect(card).not.toBeVisible();
  });

  test('card layout structure is correct', async ({ mount }) => {
    await mount(
      <AccessoryCard item={mockAccessoryProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

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
    await expect(brandSpan).toHaveText('TestAccessoryBrand');
    
    // Check content div
    const contentDiv = card.locator('div.flex.flex-col.flex-grow');
    await expect(contentDiv).toBeVisible();
    
    // Check info zone
    const infoZone = contentDiv.locator('div.h-\[5.5rem\]');
    await expect(infoZone).toBeVisible();
    
    // Check heading
    const heading = infoZone.locator('h3.type-body');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Test Accessory Model');
    
    // Check price
    const price = infoZone.locator('p.type-price');
    await expect(price).toBeVisible();
    await expect(price).toHaveText('$49.99');
  });
});
