"use client";

import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { ShoppingCart } from '@phosphor-icons/react/dist/ssr';
import type { Product } from '@/sanity/lib/products/getProductsByVfsKeys';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
            <p className="type-price" data-testid="product-price">
              ${product.displayPrice.toLocaleString()}
            </p>
            <button
              className="btn-cart"
              aria-label={`Add ${product.name} to cart`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Cart functionality to be implemented
              }}
            >
              <ShoppingCart size={18} weight="regular" />
              <span className="text-cap font-bold">Add</span>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

