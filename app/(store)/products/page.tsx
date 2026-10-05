import React from 'react';
import { notFound } from 'next/navigation';
import { getListingPage, getListingMetadata, ListingPage } from '@/features/products/server';

export const dynamic = 'force-dynamic';

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const result = await getListingPage({ slug: null, query });
  if (result.notFound) notFound();

  return <ListingPage {...result} />;
}

export async function generateMetadata({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  return getListingMetadata({ slug: null, query });
}
