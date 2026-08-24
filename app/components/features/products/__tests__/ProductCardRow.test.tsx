import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCardRow } from '../ProductCardRow';
import type { ProductCardData } from '@/sanity-cms/lib/products/getProductsSlice';

function makeProduct(id: string): ProductCardData {
  return {
    _id: id,
    name: `Product ${id}`,
    brand: { name: 'Acme' },
    price_data: { currency: 'usd', unit_amount: 1000 },
    image: { asset: { _ref: `image-Tb9Ew8CXIwaY6R1kjMvI0uRR${id}-2000x3000-jpg` } },
    slug: { current: id },
  };
}

describe('ProductCardRow: immediate per-card reveal', () => {
  it('shows every card as real content as soon as product data exists, without waiting on any image load', () => {
    const products = [makeProduct('a'), makeProduct('b'), makeProduct('c')];
    render(<ProductCardRow products={products} wishlistedIds={[]} padCount={0} />);

    // Text/cards render immediately from product data alone — no image
    // `load` event is ever fired in this test, and nothing should be gated.
    expect(screen.queryAllByTestId('product-card-skeleton')).toHaveLength(0);
    expect(screen.getAllByTestId('product-card')).toHaveLength(3);
    expect(screen.getAllByTestId('product-image')).toHaveLength(3);
  });
});
