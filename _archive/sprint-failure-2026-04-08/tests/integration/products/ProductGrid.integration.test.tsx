import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import React from 'react';

// Mock product data for testing
const mockProduct1 = {
  _id: 'product-1',
  name: 'Test Headphone A',
  displayPrice: 299,
  brand: { _id: 'brand-1', name: 'TestBrand' },
  image: null,
  slug: { current: 'test-headphone-a' },
};

const mockProduct2 = {
  _id: 'product-2',
  name: 'Test Headphone B',
  displayPrice: 499,
  brand: { _id: 'brand-2', name: 'AnotherBrand' },
  image: null,
  slug: { current: 'test-headphone-b' },
};

describe('ProductGrid Component', () => {
  it('renders products with correct data', () => {
    const products = [mockProduct1, mockProduct2];
    render(<ProductGrid products={products} />);

    // Verify product grid is visible
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();

    // Verify product cards are rendered
    const cards = screen.getAllByTestId('product-card');
    expect(cards).toHaveLength(2);

    // Verify product names are displayed
    expect(screen.getByText('Test Headphone A')).toBeVisible();
    expect(screen.getByText('Test Headphone B')).toBeVisible();

    // Verify prices are formatted correctly
    expect(screen.getByText('$299')).toBeVisible();
    expect(screen.getByText('$499')).toBeVisible();
  });

  it('shows empty state when no products', () => {
    render(<ProductGrid products={[]} />);

    // Verify empty products message is displayed
    expect(screen.getByTestId('empty-products')).toBeVisible();
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
