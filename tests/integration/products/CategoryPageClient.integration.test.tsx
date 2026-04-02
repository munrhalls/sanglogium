import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryPageClient } from '@/app/(store)/products/[...slug]/CategoryPageClient';
import React from 'react';

// Mock product data
const createMockProducts = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `product-${i}`,
    name: `Test Product ${i}`,
    displayPrice: 100 + i * 50,
    brand: { _id: `brand-${i}`, name: `Brand ${i}` },
    image: null,
    slug: { current: `test-product-${i}` },
  }));
};

const mockFilters = [];
const mockPriceRange = { minPrice: 0, maxPrice: 1000 };
const mockMaxStock = 100;

describe('CategoryPageClient', () => {
  it('displays correct product count with pluralization (multiple products)', () => {
    const products = createMockProducts(42);

    render(
      <CategoryPageClient
        filters={mockFilters}
        priceRange={mockPriceRange}
        maxStock={mockMaxStock}
        products={products}
        categoryName="Test Category"
      />
    );

    // Verify "42 products" is displayed (plural form)
    expect(screen.getByText('42 products')).toBeVisible();
  });

  it('displays correct product count with singularization (single product)', () => {
    const products = createMockProducts(1);

    render(
      <CategoryPageClient
        filters={mockFilters}
        priceRange={mockPriceRange}
        maxStock={mockMaxStock}
        products={products}
        categoryName="Test Category"
      />
    );

    // Verify "1 product" is displayed (singular form)
    expect(screen.getByText('1 product')).toBeVisible();
  });
});
