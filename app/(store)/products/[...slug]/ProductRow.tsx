import React from 'react';
import { ProductCardRow } from '@/app/components/features/products';
import { getProductsSlice } from '@/sanity-cms/lib/products/getProductsSlice';

interface ProductRowProps {
  keys: string[];
  sort: string;
  filters: string[];
  offset: number;
  limit: number;
  wishlistPromise: Promise<Set<string>>;
  /** Floor on how soon this row is allowed to resolve, so later rows never
   * reveal in the same instant as earlier ones even when Sanity answers
   * every row's fetch in the same tight window (fast/local network). A no-op
   * whenever the real fetch already takes longer than this. */
  minDelayMs?: number;
}

function withMinDelay<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (ms <= 0) return promise;
  return Promise.all([promise, new Promise((resolve) => setTimeout(resolve, ms))]).then(([value]) => value);
}

export async function ProductRow({ keys, sort, filters, offset, limit, wishlistPromise, minDelayMs = 0 }: ProductRowProps) {
  const [products, wishlistSet] = await Promise.all([
    withMinDelay(getProductsSlice({ keys, sort, filters, offset, limit }), minDelayMs),
    wishlistPromise,
  ]);

  // Rendered count must always equal `limit` — a slice from the end of a
  // catalogue (or beyond it) can return fewer than `limit` products, which
  // would otherwise leave this row shorter than its ProductRowSkeleton
  // fallback (fewer wrapped sub-rows in the same grid-cols-3 grid). Padding
  // with invisible placeholders keeps the row's height identical to the
  // skeleton no matter how many real products landed in it.
  return (
    <ProductCardRow
      products={products}
      wishlistedIds={Array.from(wishlistSet)}
      padCount={limit - products.length}
    />
  );
}
