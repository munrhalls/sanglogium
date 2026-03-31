import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { FilterSidebar, FilterConfigProvider } from '@/app/components/features/filters';
import { CategoryPageClient } from './CategoryPageClient';

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
          <CategoryPageClient
            filters={filters}
            products={products}
            categoryName={metadata.name}
          />
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
