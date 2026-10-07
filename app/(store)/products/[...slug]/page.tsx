import React from 'react';
import { notFound } from 'next/navigation';
import { getListingPage, getListingMetadata, ListingView } from '@/features/products/server';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const result = await getListingPage({ slug, query });
  if (result.notFound) notFound();

  return <ListingView {...result} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  return getListingMetadata({ slug, query });
}
