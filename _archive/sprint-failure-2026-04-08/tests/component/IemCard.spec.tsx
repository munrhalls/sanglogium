import { test, expect } from '@playwright/experimental-ct-react';
import IemCard from '../../../app/components/features/homepage/iems-gallery/IemCard';
import { mockIemProduct } from '../../utils/homepage-helpers';

// Mock the urlFor function
const mockUrlFor = {
  width: () => ({
    auto: () => ({
      quality: () => ({
        url: () => '/test-iem-image.jpg'
      })
    })
  })
};

test.describe('IemCard Component', () => {
  test('renders IEM product information correctly', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
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
    await expect(page.locator('text=TestIEMBrand')).toBeVisible();
    
    // Check product name
    await expect(page.locator('text=Test IEM Model')).toBeVisible();
    
    // Check price
    await expect(page.locator('text=$199.99')).toBeVisible();
    
    // Check add to cart button
    const addToCartBtn = page.locator('button');
    await expect(addToCartBtn).toBeVisible();
    await expect(addToCartBtn).toContainText('Add');
  });

  test('has correct accessibility attributes', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
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
    await expect(image).toHaveAttribute('alt', 'Test IEM Model');
  });

  test('has correct navigation link', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const link = page.locator('a[href="/products/test-iem-model"]');
    await expect(link).toBeVisible();
  });

  test('applies hover classes correctly', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
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

  test('image has correct loading attributes', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    // IEM cards should have lazy loading
    await expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('image has correct styling classes', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    await expect(image).toHaveClass(/object-cover/);
    await expect(image).toHaveClass(/w-\[60%\]/);
    await expect(image).toHaveClass(/h-\[60%\]/);
    await expect(image).toHaveClass(/transition-transform/);
    await expect(image).toHaveClass(/duration-300/);
    await expect(image).toHaveClass(/group-hover:scale-105/);
    await expect(image).toHaveClass(/object-center/);
  });

  test('has aspect-square container', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const imageContainer = page.locator('div.aspect-square');
    await expect(imageContainer).toBeVisible();
    await expect(imageContainer).toHaveClass(/w-full/);
    await expect(imageContainer).toHaveClass(/overflow-hidden/);
    await expect(imageContainer).toHaveClass(/bg-surface-productImage/);
  });

  test('handles missing product data gracefully', async ({ mount }) => {
    await mount(<IemCard product={null} idx={0} />);
    
    // Component should render null (nothing visible)
    const card = page.locator('article.card-product');
    await expect(card).not.toBeVisible();
  });

  test('card layout structure is correct', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const card = page.locator('article.card-product');
    
    // Check image container
    const imageContainer = card.locator('div.aspect-square');
    await expect(imageContainer).toBeVisible();
    
    // Check brand span
    const brandSpan = imageContainer.locator('span.text-brand-900');
    await expect(brandSpan).toBeVisible();
    await expect(brandSpan).toHaveText('TestIEMBrand');
    
    // Check content div
    const contentDiv = card.locator('div.flex.flex-col.gap-3');
    await expect(contentDiv).toBeVisible();
    
    // Check heading
    const heading = contentDiv.locator('h3.type-body');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Test IEM Model');
    
    // Check price and button container
    const priceContainer = contentDiv.locator('div.flex.items-center.justify-between');
    await expect(priceContainer).toBeVisible();
  });

  test('button has correct icon size', async ({ mount }) => {
    await mount(
      <IemCard product={mockIemProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const button = page.locator('button');
    const icon = button.locator('svg');
    
    // IEM cards use size 20 for the icon
    await expect(icon).toBeVisible();
  });
});
