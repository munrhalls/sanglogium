import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ProductDetail } from '@/features/products/ui/detail/ProductDetail';
import type { ProductDetailData, RelatedProduct } from '@/features/products/core/types/productTypes';

interface ProductPageViewProps {
  product: ProductDetailData;
  relatedProducts: RelatedProduct[];
  wishlistSlot?: ReactNode;
}

export default function ProductView({ product, relatedProducts, wishlistSlot }: ProductPageViewProps) {
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="type-caption text-secondary hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li>
            <Link href="/products" className="type-caption text-secondary hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li className="type-caption text-primary font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} relatedProducts={relatedProducts} wishlistSlot={wishlistSlot} />
    </div>
  );
}
