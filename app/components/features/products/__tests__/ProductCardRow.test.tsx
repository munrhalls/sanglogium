import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Types needed for TypeScript
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('ProductCardRow: row-level atomic reveal', () => {
  it('keeps every card as skeleton until every image in the row has loaded, then flips all at once', async () => {
    const products = [makeProduct('a'), makeProduct('b'), makeProduct('c')];
    render(<ProductCardRow products={products} wishlistedIds={[]} padCount={0} />);

    const images = screen.getAllByTestId('product-image').map((wrapper) => wrapper.querySelector('img')!);
    expect(images).toHaveLength(3);

    // All three start as skeletons — none reveal on mount.
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(3);
    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);

    // First two images resolve; the row must NOT reveal any card yet —
    // this is the exact bug being guarded against: a partial reveal here
    // would mean the row resettles once per card instead of atomically.
    await act(async () => {
      fireEvent.load(images[0]);
    });
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(3);
    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);

    await act(async () => {
      fireEvent.load(images[1]);
    });
    expect(screen.getAllByTestId('product-card-skeleton')).toHaveLength(3);
    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);

    // Last image resolves — now, and only now, all three flip together.
    await act(async () => {
      fireEvent.load(images[2]);
    });
    expect(screen.queryAllByTestId('product-card-skeleton')).toHaveLength(0);
    expect(screen.getAllByTestId('product-card')).toHaveLength(3);
  });
});
