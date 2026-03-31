import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { ShoppingCart } from '@phosphor-icons/react/dist/ssr';

export interface Product {
  _id: string;
  name: string;
  brand?: { _id: string; name: string } | null;
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
      className="card-product-dark group flex h-full flex-col"
      data-testid="product-card"
    >
      <Link href={`/product/${product.slug.current}`} className="block">
        <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage">
          {product.brand?.name && (
            <span className="absolute left-4 top-4 type-caption text-brand-900 z-10">
              {product.brand.name}
            </span>
          )}
          <ProductImage
            image={product.image}
            alt={product.name}
            imgClassName="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </figure>

        <div className="flex flex-col flex-grow p-4">
          <h3 className="type-card-title text-headline line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="type-price text-priceTag mb-3">
            ${product.displayPrice.toLocaleString()}
          </p>
          <button
            className="btn-cart w-full justify-center mt-auto"
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
      </Link>
    </article>
  );
}

