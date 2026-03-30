import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../ProductGrid';
import { ProductCard } from '../ProductCard';
import { ShopHeader } from '../ShopHeader';
import { ProductImage } from '../ProductImage';
import { Price } from '@/app/components/ui/Price';
import { ProductDetail } from '../ProductDetail';
import { ProductInfo } from '../ProductInfo';
import { ImageGallery } from '../ImageGallery';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock urlFor
vi.mock('@/sanity/lib/image', () => ({
  urlFor: () => ({
    width: () => ({
      height: () => ({
        url: () => '/mock-image.jpg',
      }),
    }),
  }),
}));

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

describe('L5 Integration: Product Components', () => {

  describe('Price', () => {
    it('L5-01: Formats price correctly', () => {
      render(<Price value={1699} currency="USD" />);
      expect(screen.getByText('$1,699')).toBeInTheDocument();
    });

    it('L5-02: Uses default USD currency', () => {
      render(<Price value={299} />);
      expect(screen.getByText('$299')).toBeInTheDocument();
    });
  });

  describe('ProductCard', () => {
    it('L5-03: Renders product name', () => {
      const product = generateMockProduct({ name: 'HD 800S' });
      render(<ProductCard product={product} />);
      expect(screen.getByText('HD 800S')).toBeInTheDocument();
    });

    it('L5-04: Renders brand name', () => {
      const product = generateMockProduct({ brand: { name: 'Sennheiser' } });
      render(<ProductCard product={product} />);
      expect(screen.getByText('Sennheiser')).toBeInTheDocument();
    });

    it('L5-05: Renders formatted price', () => {
      const product = generateMockProduct({ displayPrice: 1699 });
      render(<ProductCard product={product} />);
      expect(screen.getByText('$1,699')).toBeInTheDocument();
    });

    it('L5-06: Links to product detail page', () => {
      const product = generateMockProduct({ slug: { current: 'sennheiser-hd800s' } });
      render(<ProductCard product={product} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/product/sennheiser-hd800s');
    });

    it('L5-07: Renders product image', () => {
      const product = generateMockProduct();
      render(<ProductCard product={product} />);
      expect(screen.getByTestId('product-image')).toBeInTheDocument();
    });
  });

  describe('ProductGrid', () => {
    it('L5-08: Renders correct number of products', () => {
      const products = [
        generateMockProduct({ _id: '1', name: 'Product 1' }),
        generateMockProduct({ _id: '2', name: 'Product 2' }),
        generateMockProduct({ _id: '3', name: 'Product 3' }),
      ];
      render(<ProductGrid products={products} />);
      expect(screen.getAllByTestId('product-card')).toHaveLength(3);
    });

    it('L5-09: Renders empty state when no products', () => {
      render(<ProductGrid products={[]} />);
      expect(screen.getByTestId('empty-products')).toBeInTheDocument();
    });

    it('L5-10: Uses responsive grid layout', () => {
      const products = Array.from({ length: 4 }, (_, i) =>
        generateMockProduct({ _id: `product-${i}`, name: `Product ${i}` })
      );
      render(<ProductGrid products={products} />);
      const grid = screen.getByTestId('product-grid');
      expect(grid.className).toContain('grid');
    });
  });

  describe('ShopHeader', () => {
    it('L5-11: Displays category name', () => {
      render(<ShopHeader title="Open-Back" productCount={7} />);
      expect(screen.getByText('Open-Back')).toBeInTheDocument();
    });

    it('L5-12: Displays product count', () => {
      render(<ShopHeader title="Open-Back" productCount={7} />);
      expect(screen.getByText('7 products')).toBeInTheDocument();
    });

    it('L5-13: Handles singular/plural', () => {
      render(<ShopHeader title="Open-Back" productCount={1} />);
      expect(screen.getByText('1 product')).toBeInTheDocument();
    });
  });

  describe('ProductDetail', () => {
    it('L5-14: Renders product detail with image gallery', () => {
      const product = generateMockProduct({
        description: 'High-end headphones',
        images: [{ asset: { _ref: 'image-1' } }],
      });
      render(<ProductDetail product={product} />);
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    });

    it('L5-15: Renders product info', () => {
      const product = generateMockProduct({ description: 'Test description' });
      render(<ProductDetail product={product} />);
      expect(screen.getByTestId('product-info')).toBeInTheDocument();
    });

    it('L5-16: Displays product name in detail', () => {
      const product = generateMockProduct({ name: 'HD 800S' });
      render(<ProductDetail product={product} />);
      expect(screen.getByText('HD 800S')).toBeInTheDocument();
    });
  });

  describe('ProductInfo', () => {
    it('L5-17: Renders brand name with uppercase styling', () => {
      render(<ProductInfo name="Test" brand={{ _id: '1', name: 'Sennheiser' }} displayPrice={100} />);
      // CSS transforms to uppercase, text content is normal case
      expect(screen.getByText('Sennheiser')).toBeInTheDocument();
    });

    it('L5-18: Renders description when provided', () => {
      render(<ProductInfo name="Test" brand={{ _id: '1', name: 'Brand' }} displayPrice={100} description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('ImageGallery', () => {
    it('L5-19: Renders placeholder when no images', () => {
      render(<ImageGallery images={[]} productName="Test" />);
      expect(screen.getByTestId('image-gallery-placeholder')).toBeInTheDocument();
    });

    it('L5-20: Renders main image', () => {
      render(<ImageGallery images={[{ asset: { _ref: 'image-1' } }]} productName="Test" />);
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    });
  });

});
