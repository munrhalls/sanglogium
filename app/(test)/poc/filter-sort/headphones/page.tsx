import React from 'react';
import type { Metadata } from 'next';
import { ChunkedProductGrid, CHUNK_SIZE } from '@/app/components/features/products/ChunkedProductGrid';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';
import { FilterSidebar } from './components/FilterSidebar';
import { SortBar } from './components/SortBar';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { loadFilterSort, type FilterSortState } from '@/lib/filter-sort/headphones/filterSortParams';
import {
  filterProducts,
  sortProducts,
  computeFacetCounts,
  computeBooleanCounts,
  derivedBrandLabels,
} from '@/lib/filter-sort/headphones/filterProducts';
import type { HeadphoneProduct } from '@/lib/filter-sort/headphones/types';
import rawDataset from './dataset.json';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Filter & Sort POC — Headphones',
  robots: { index: false, follow: false },
};

const DATASET = rawDataset as unknown as HeadphoneProduct[];

/**
 * Products Grid actor's fetch: identical shape to production's
 * getProductsChunk (offset/limit slice, returned as a Promise), but reading
 * the local enriched dataset instead of issuing a GROQ query. The dataset has
 * no network latency of its own — a small staggered delay stands in for the
 * real per-request latency each chunk would carry against Sanity, so the
 * already-proven streaming mechanism (ChunkedProductGrid's independent
 * per-chunk Suspense boundaries) has something real to stream. This delays
 * DATA arrival only; it never touches the image-reveal ANIMATION, which still
 * runs entirely off each image's own `load` event exactly as shipped
 * (AI_LESSONS L11 — a reveal must be driven by the real event it depicts, and
 * this leaves that mechanism untouched).
 */
function fetchChunk(products: HeadphoneProduct[], offset: number, limit: number, chunkIndex: number): Promise<HeadphoneProduct[]> {
  const slice = products.slice(offset, offset + limit);
  const delayMs = chunkIndex === 0 ? 0 : chunkIndex * 140 + Math.floor(Math.random() * 80);
  if (delayMs === 0) return Promise.resolve(slice);
  return new Promise((resolve) => setTimeout(() => resolve(slice), delayMs));
}

interface PocPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FilterSortHeadphonesPocPage({ searchParams }: PocPageProps) {
  const query = await searchParams;
  const state = loadFilterSort(query) as FilterSortState;

  // Full-dataset facts (never narrowed by the active filters) — brand labels
  // and price bounds so the max handle can always be dragged back up, exactly
  // matching production's "FULL category price span" comment on the real
  // catalogue page.
  const brandLabels = derivedBrandLabels(DATASET);
  const priceCents = DATASET.map((p) => p.price_data.unit_amount);
  const priceBounds = resolvePriceBounds({
    minPrice: Math.min(...priceCents),
    maxPrice: Math.max(...priceCents),
    prices: priceCents,
  });

  const checkboxCounts = computeFacetCounts(DATASET, state);
  const booleanCounts = computeBooleanCounts(DATASET, state);

  const filtered = filterProducts(DATASET, state);
  const sorted = sortProducts(filtered, state.sort);

  const chunkCount = Math.ceil(sorted.length / CHUNK_SIZE);
  const chunkPromises = Array.from({ length: chunkCount }, (_, i) =>
    fetchChunk(sorted, i * CHUNK_SIZE, CHUNK_SIZE, i),
  );

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 pb-12 md:px-8">
      <div className="pt-8">
        <ShopHeader title="Headphones" overline="Filter & Sort Proof of Concept" />
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-border-secondary bg-surface-elevated py-16 text-center" data-testid="poc-empty-results">
          <p className="type-body text-text-primary">No headphones match these filters.</p>
          <p className="type-caption text-text-caption">Try clearing a filter from the sidebar or the chips above the grid.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg-touch:flex-row lg-desktop:flex-row">
          <FilterSidebar
            checkboxCounts={checkboxCounts}
            booleanCounts={booleanCounts}
            brandLabels={brandLabels}
            priceBounds={{ min: priceBounds.min, max: priceBounds.max }}
          />
          <div className="min-w-0 flex-1">
            <ActiveFilterChips brandLabels={brandLabels} />
            <SortBar totalCount={sorted.length} />
            <ChunkedProductGrid chunkPromises={chunkPromises} />
          </div>
        </div>
      )}
    </div>
  );
}
