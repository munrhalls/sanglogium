"use client";

import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import type { Product } from '@/sanity/lib/products/getProductsByVfsKeys';
import { Price } from '@/app/components/ui/Price';
import { AddToCartButton } from '@/app/components/ui/AddToCartButton';
import { urlFor } from '@/sanity/lib/image';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  displayPrice: number;
  stock?: number;
  image: any;
  slug: { current: string };
  stripePriceId?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image ? urlFor(product.image).width(100).height(100).url() : '';

  return (
    <article
      className="card-product-dark group flex h-full flex-col col-span-1"
      data-testid="product-card"
    >
      <Link href={`/product/${product.slug.current}`} className="block">
        <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          {product.brand?.name && (
            <span className="absolute left-4 top-4 type-caption text-brand-900 z-10">
              {product.brand.name}
            </span>
          )}
          <ProductImage
            image={product.image}
            alt={product.name}
            className="group-hover:scale-110"
          />
        </figure>

        <div className="flex flex-col flex-grow gap-3 p-4">
          <h3 className="type-body font-medium line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-2">
            <Price value={product.displayPrice} />
            <AddToCartButton
              productId={product._id}
              name={product.name}
              displayPrice={product.displayPrice}
              stock={product.stock ?? 99}
              imageUrl={imageUrl}
              slug={product.slug.current}
              stripePriceId={product.stripePriceId}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

