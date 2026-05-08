import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { ProductImage } from '@/app/components/features/products/ProductImage';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';
import { centsToDisplay } from '@/lib/utils/price';

interface AutocompleteItemProps {
  product: AutocompleteProduct;
  isActive: boolean;
  index: number;
  showThumbnail?: boolean;
}

export function AutocompleteItem({ product, isActive, index, showThumbnail = true }: AutocompleteItemProps) {
  return (
    <li
      id={`autocomplete-item-${index}`}
      role="option"
      aria-selected={isActive}
      className={cn(
        "p-3 flex items-center gap-3 rounded-md transition-colors duration-150 cursor-pointer",
        isActive ? "bg-surface-card border-l-2 border-brand-400" : "hover:bg-surface-card"
      )}
    >
      <Link
        href={`/product/${product.slug.current}`}
        className="flex items-center gap-3 w-full"
        tabIndex={-1}
      >
        {showThumbnail && product.image && (
          <div className="w-12 h-12 rounded-md bg-surface-productImage shrink-0 overflow-hidden flex items-center justify-center">
            <ProductImage
              image={product.image}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="type-body text-primary truncate">{product.name}</span>
          <span className="type-caption text-secondary">
            {product.brand?.name && `${product.brand.name} · `}${centsToDisplay(product.price_data.unit_amount).toLocaleString()}
          </span>
        </div>
      </Link>
    </li>
  );
}
