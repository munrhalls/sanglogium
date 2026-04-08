import { test, expect } from '@playwright/experimental-ct-react';
import DacCard from '../../../app/components/features/homepage/dacs/DacCard';
import { mockDacProduct } from '../../utils/homepage-helpers';

// Mock the urlFor function
const mockUrlFor = {
  width: () => ({
    auto: () => ({
      quality: () => ({
        url: () => '/test-dac-image.jpg'
      })
    })
  })
};

test.describe('DacCard Component', () => {
  test('renders DAC product information correctly', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
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
    await expect(page.locator('text=TestDACBrand')).toBeVisible();
    
    // Check product name
    await expect(page.locator('text=Test DAC Model')).toBeVisible();
    
    // Check price
    await expect(page.locator('text=$599.99')).toBeVisible();
    
    // Check add to cart button
    const addToCartBtn = page.locator('button');
    await expect(addToCartBtn).toBeVisible();
    await expect(addToCartBtn).toContainText('Add');
  });

  test('has correct accessibility attributes', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
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
    await expect(image).toHaveAttribute('alt', 'Test DAC Model');
  });

  test('has correct navigation link', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const link = page.locator('a[href="/products/test-dac-model"]');
    await expect(link).toBeVisible();
  });

  test('applies hover classes correctly', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
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
      <DacCard item={mockDacProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    // DAC cards should have lazy loading (not priority)
    await expect(image).toHaveAttribute('loading', 'lazy');
  });

  test('image has correct styling classes', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const image = page.locator('img');
    
    await expect(image).toHaveClass(/h-auto/);
    await expect(image).toHaveClass(/max-h-\[95%\]/);
    await expect(image).toHaveClass(/w-auto/);
    await expect(image).toHaveClass(/max-w-\[95%\]/);
    await expect(image).toHaveClass(/object-contain/);
    await expect(image).toHaveClass(/mix-blend-multiply/);
    await expect(image).toHaveClass(/transition-transform/);
    await expect(image).toHaveClass(/duration-700/);
    await expect(image).toHaveClass(/group-hover:scale-105/);
  });

  test('handles missing product data gracefully', async ({ mount }) => {
    await mount(<DacCard item={null} idx={0} />);
    
    // Component should render null (nothing visible)
    const card = page.locator('article.card-product');
    await expect(card).not.toBeVisible();
  });

  test('handles missing product fields gracefully', async ({ mount }) => {
    const incompleteProduct = {
      _id: 'incomplete-dac',
      name: null,
      brand: undefined,
      displayPrice: null,
      image: null,
      slug: null
    };

    await mount(
      <DacCard item={incompleteProduct} idx={0} />,
      {
        hooksConfig: {
          urlFor: mockUrlFor
        }
      }
    );

    const card = page.locator('article.card-product');
    await expect(card).toBeVisible();
    
    // Should show fallback values
    await expect(page.locator('text=Generic')).toBeVisible();
    await expect(page.locator('text=Unknown Product')).toBeVisible();
    await expect(page.locator('text=Contact for Price')).toBeVisible();
  });

  test('card layout structure is correct', async ({ mount }) => {
    await mount(
      <DacCard item={mockDacProduct} idx={0} />,
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
    await expect(brandSpan).toHaveText('TestDACBrand');
    
    // Check content div
    const contentDiv = card.locator('div.flex.flex-col.min-h-\[3rem\]');
    await expect(contentDiv).toBeVisible();
    
    // Check heading
    const heading = contentDiv.locator('p.type-body');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Test DAC Model');
    
    // Check price and button container
    const priceContainer = card.locator('div.mt-auto');
    await expect(priceContainer).toBeVisible();
  });
});
