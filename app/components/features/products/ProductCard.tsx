import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { Price } from '@/app/components/ui/Price';
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
      className="card-product group flex h-full flex-col gap-4 transition-all duration-300 pointer-fine:hover:shadow-cardHover pointer-fine:hover:-translate-y-1"
      data-testid="product-card"
    >
      <Link href={`/product/${product.slug.current}`} className="block">
        <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          {product.brand?.name && (
            <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900 z-10">
              {product.brand.name}
            </span>
          )}
          <ProductImage
            image={product.image}
            alt={product.name}
            imgClassName="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        </figure>

        <div className="flex flex-col flex-grow gap-3 pt-2">
          <h3 className="type-body font-medium line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-2">
            <Price value={product.displayPrice} />
            <button
              className="btn-cart transition-all active:scale-95"
              aria-label={`Add ${product.name} to cart`}
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
