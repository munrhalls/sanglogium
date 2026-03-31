import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeader, ProductGrid } from '@/app/components/features/products';
import {
  FilterSidebar,
  SortDropdown,
  ActiveFilters,
  MobileFilterToggle,
  FilterConfigProvider,
} from '@/app/components/features/filters';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(descendantKeys);
  const metadata = await getCategoryMetadata(nodeId);

  return (
    <FilterConfigProvider>
      {({ filters }) => (
        <ShopLayout sidebar={<FilterSidebar filters={filters} />}>
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <ShopHeader title={metadata.name} productCount={products.length} />
              <SortDropdown />
            </div>

            <MobileFilterToggle />

            <ActiveFilters filters={[
              { field: 'brand', value: 'sennheiser', label: 'Brand: Sennheiser' },
              { field: 'driverType', value: 'dynamic', label: 'Driver: Dynamic' },
            ]} />

            <ProductGrid products={products} />
          </main>
        </ShopLayout>
      )}
    </FilterConfigProvider>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    return { title: 'Category Not Found' };
  }

  const metadata = await getCategoryMetadata(nodeId);

  if (!metadata) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${metadata.name} — Sang Logium`,
    description: `Browse ${metadata.name} headphones and audio equipment`,
  };
}
