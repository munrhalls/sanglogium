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
    <Link
      href={`/product/${product.slug.current}`}
      className="group block space-y-3"
      data-testid="product-card"
    >
      <ProductImage
        image={product.image}
        alt={product.name}
        className="group-hover:opacity-90 transition-opacity"
      />

      <div className="space-y-1">
        {product.brand?.name && (
          <p className="text-sm text-gray-600">{product.brand.name}</p>
        )}
        <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
        <Price value={product.displayPrice} />
      </div>
    </Link>
  );
}
