import React from 'react';
import type { Metadata } from 'next';
import { ChunkedProductGrid, CHUNK_SIZE } from '@/app/components/features/products/ChunkedProductGrid';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';
import { FilterSidebar } from './components/FilterSidebar';
import { SortBar } from './components/SortBar';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { loadFilterSort, type FilterSortState } from './lib/filterSortParams';
import {
  filterProducts,
  sortProducts,
  computeFacetCounts,
  computeBooleanCounts,
  derivedBrandLabels,
} from './lib/filterProducts';
import type { AccessoryProduct } from './lib/types';
import rawDataset from './dataset.json';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Filter & Sort POC — Accessories',
  robots: { index: false, follow: false },
};

const DATASET = rawDataset as unknown as AccessoryProduct[];

/**
 * Products Grid actor's fetch: identical shape to production's
 * getProductsChunk (offset/limit slice, returned as a Promise), but reading
 * the local enriched dataset instead of issuing a GROQ query — see
 * headphones/page.tsx for the full rationale (unchanged here).
 */
function fetchChunk(products: AccessoryProduct[], offset: number, limit: number, chunkIndex: number): Promise<AccessoryProduct[]> {
  const slice = products.slice(offset, offset + limit);
  const delayMs = chunkIndex === 0 ? 0 : chunkIndex * 140 + Math.floor(Math.random() * 80);
  if (delayMs === 0) return Promise.resolve(slice);
  return new Promise((resolve) => setTimeout(() => resolve(slice), delayMs));
}

interface PocPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FilterSortAccessoriesPocPage({ searchParams }: PocPageProps) {
  const query = await searchParams;
  const state = loadFilterSort(query) as FilterSortState;

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
        <ShopHeader title="Accessories" overline="Filter & Sort Proof of Concept" />
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-border-secondary bg-surface-elevated py-16 text-center" data-testid="poc-empty-results">
          <p className="type-body text-text-primary">No accessories match these filters.</p>
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
