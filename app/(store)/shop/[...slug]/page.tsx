import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys, getCategoryMetadata } from '@/sanity/lib/products';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  // Last segment is the leaf category
  const leafSlug = slug[slug.length - 1];

  // Resolve slug to VFS node ID
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  // Fetch data (Sprint 1 functions)
  const descendantKeys = unrollDescendantKeys(nodeId);
  const products = await getProductsByVfsKeys(descendantKeys);
  const metadata = await getCategoryMetadata(nodeId);

  // Sprint 2: Render skeletons (Sprint 3 will add real components)
  return (
    <ShopLayout>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton count={products.length} />
    </ShopLayout>
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
