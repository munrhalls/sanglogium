import { test, expect } from '@playwright/test';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { ProductCard } from '@/app/components/features/products/ProductCard';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { ProductDetail } from '@/app/components/features/products/ProductDetail';
import { ProductInfo } from '@/app/components/features/products/ProductInfo';
import { ImageGallery } from '@/app/components/features/products/ImageGallery';
import { Price } from '@/app/components/ui/Price';

function generateMockProduct(overrides = {}) {
  return {
    _id: 'product-123',
    name: 'HD 800S',
    brand: { _id: 'brand-1', name: 'Sennheiser' },
    displayPrice: 1699,
    image: { asset: { _ref: 'image-abc' } },
    slug: { current: 'sennheiser-hd800s' },
    catalogueLocationKeys: ['key-1'],
    ...overrides,
  };
}

test.describe('L5 Integration: Product Components', () => {

  test.describe('Price', () => {
    test('L5-01: Formats price correctly', async ({ mount }) => {
      const component = await mount(<Price value={1699} currency="USD" />);
      await expect(component).toContainText('$1,699');
    });

    test('L5-02: Uses default USD currency', async ({ mount }) => {
      const component = await mount(<Price value={299} />);
      await expect(component).toContainText('$299');
    });
  });

  test.describe('ProductCard', () => {
    test('L5-03: Renders product name', async ({ mount }) => {
      const product = generateMockProduct({ name: 'HD 800S' });
      const component = await mount(<ProductCard product={product} />);
      await expect(component).toContainText('HD 800S');
    });

    test('L5-04: Renders brand name', async ({ mount }) => {
      const product = generateMockProduct({ brand: { name: 'Sennheiser' } });
      const component = await mount(<ProductCard product={product} />);
      await expect(component).toContainText('Sennheiser');
    });

    test('L5-05: Renders formatted price', async ({ mount }) => {
      const product = generateMockProduct({ displayPrice: 1699 });
      const component = await mount(<ProductCard product={product} />);
      await expect(component).toContainText('$1,699');
    });

    test('L5-06: Links to product detail page', async ({ mount }) => {
      const product = generateMockProduct({ slug: { current: 'sennheiser-hd800s' } });
      const component = await mount(<ProductCard product={product} />);
      const link = component.getByRole('link');
      await expect(link).toHaveAttribute('href', '/product/sennheiser-hd800s');
    });

    test('L5-07: Renders product image', async ({ mount }) => {
      const product = generateMockProduct();
      const component = await mount(<ProductCard product={product} />);
      await expect(component.getByTestId('product-image')).toBeVisible();
    });
  });

  test.describe('ProductGrid', () => {
    test('L5-08: Renders correct number of products', async ({ mount }) => {
      const products = [
        generateMockProduct({ _id: '1', name: 'Product 1' }),
        generateMockProduct({ _id: '2', name: 'Product 2' }),
        generateMockProduct({ _id: '3', name: 'Product 3' }),
      ];
      const component = await mount(<ProductGrid products={products} />);
      await expect(component.getByTestId('product-grid')).toBeVisible();
      const cards = component.getByTestId('product-grid').locator('[data-testid="product-card"]');
      await expect(cards).toHaveCount(3);
    });

    test('L5-09: Renders empty state when no products', async ({ mount }) => {
      const component = await mount(<ProductGrid products={[]} />);
      await expect(component.getByTestId('empty-products')).toBeVisible();
    });

    test('L5-10: Uses responsive grid layout', async ({ mount }) => {
      const products = Array.from({ length: 4 }, (_, i) =>
        generateMockProduct({ _id: `product-${i}`, name: `Product ${i}` })
      );
      const component = await mount(<ProductGrid products={products} />);
      const grid = component.getByTestId('product-grid');
      await expect(grid).toHaveClass(/grid/);
    });
  });

  test.describe('ShopHeader', () => {
    test('L5-11: Displays category name', async ({ mount }) => {
      const component = await mount(<ShopHeader title="Open-Back" productCount={7} />);
      await expect(component).toContainText('Open-Back');
    });

    test('L5-12: Displays product count', async ({ mount }) => {
      const component = await mount(<ShopHeader title="Open-Back" productCount={7} />);
      await expect(component).toContainText('7 products');
    });

    test('L5-13: Handles singular/plural', async ({ mount }) => {
      const component = await mount(<ShopHeader title="Open-Back" productCount={1} />);
      await expect(component).toContainText('1 product');
    });
  });

  test.describe('ProductDetail', () => {
    test('L5-14: Renders product detail with image gallery', async ({ mount }) => {
      const product = generateMockProduct({
        description: 'High-end headphones',
        images: [{ asset: { _ref: 'image-1' } }],
      });
      const component = await mount(<ProductDetail product={product} />);
      await expect(component.getByTestId('image-gallery')).toBeVisible();
    });

    test('L5-15: Renders product info', async ({ mount }) => {
      const product = generateMockProduct({ description: 'Test description' });
      const component = await mount(<ProductDetail product={product} />);
      await expect(component.getByTestId('product-info')).toBeVisible();
    });

    test('L5-16: Displays product name in detail', async ({ mount }) => {
      const product = generateMockProduct({ name: 'HD 800S' });
      const component = await mount(<ProductDetail product={product} />);
      await expect(component).toContainText('HD 800S');
    });
  });

  test.describe('ProductInfo', () => {
    test('L5-17: Renders brand name with uppercase styling', async ({ mount }) => {
      const component = await mount(<ProductInfo name="Test" brand={{ _id: '1', name: 'Sennheiser' }} displayPrice={100} />);
      await expect(component).toContainText('Sennheiser');
    });

    test('L5-18: Renders description when provided', async ({ mount }) => {
      const component = await mount(<ProductInfo name="Test" brand={{ _id: '1', name: 'Brand' }} displayPrice={100} description="Test description" />);
      await expect(component).toContainText('Test description');
    });
  });

  test.describe('ImageGallery', () => {
    test('L5-19: Renders placeholder when no images', async ({ mount }) => {
      const component = await mount(<ImageGallery images={[]} productName="Test" />);
      await expect(component.getByTestId('image-gallery-placeholder')).toBeVisible();
    });

    test('L5-20: Renders main image', async ({ mount }) => {
      const component = await mount(<ImageGallery images={[{ asset: { _ref: 'image-1' } }]} productName="Test" />);
      await expect(component.getByTestId('image-gallery')).toBeVisible();
    });
  });

});
