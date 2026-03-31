import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { Price } from '@/app/components/ui/Price';

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
      className="group border border-border-secondary bg-transparent p-4 shadow-cardDark transition-all duration-300 pointer-fine:hover:shadow-cardHoverDark pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:border-brand-400"
      data-testid="product-card"
    >
      <Link
        href={`/product/${product.slug.current}`}
        className="block space-y-3"
      >
        <ProductImage
          image={product.image}
          alt={product.name}
        />

        <div className="space-y-1">
          {product.brand?.name && (
            <p className="type-caption text-secondary-500">{product.brand.name}</p>
          )}
          <h3 className="type-card-title line-clamp-2">{product.name}</h3>
          <Price value={product.displayPrice} />
        </div>
      </Link>
    </article>
  );
}
