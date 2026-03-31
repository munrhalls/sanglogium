import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity/lib/products/getCategoryMetadata';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { FilterConfigProvider } from '@/app/components/features/filters/FilterConfigProvider';
import { CategoryPageClient } from './CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  // Parse URL params
  const sort = typeof query.s === 'string' ? query.s : 'featured';
  const filters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];

  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys({
    keys: descendantKeys,
    sort,
    filters
  });
  const metadata = await getCategoryMetadata(nodeId);

  return (
    <FilterConfigProvider>
      {({ filters }) => (
        <>
          {/* Full-width header */}
          <div className="container mx-auto px-4 pt-6 pb-4">
            <ShopHeader title={metadata.name} productCount={products.length} />
          </div>

          {/* Sidebar + content split */}
          <ShopLayout sidebar={<FilterSidebar filters={filters} />}>
            <CategoryPageClient
              filters={filters}
              products={products}
              categoryName={metadata.name}
            />
          </ShopLayout>
        </>
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
