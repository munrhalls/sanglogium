import React from 'react';
import { ProductCard } from '@/app/components/features/products';
import { getProductsSlice } from '@/sanity-cms/lib/products/getProductsSlice';

interface ProductRowProps {
  keys: string[];
  sort: string;
  filters: string[];
  offset: number;
  limit: number;
  wishlistSet: Set<string>;
}

export async function ProductRow({ keys, sort, filters, offset, limit, wishlistSet }: ProductRowProps) {
  const products = await getProductsSlice({ keys, sort, filters, offset, limit });

  if (products.length === 0) return null;

  return (
    <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} isWishlisted={wishlistSet.has(product._id)} />
      ))}
    </div>
  );
}
