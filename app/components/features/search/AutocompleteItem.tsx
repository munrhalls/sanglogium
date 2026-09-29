import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { ProductImage } from '@/app/components/features/products/ProductImage';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';
import { formatPrice } from '@/lib/utils/price';

interface AutocompleteItemProps {
  product: AutocompleteProduct;
  isActive: boolean;
  index: number;
  showThumbnail?: boolean;
  onClick?: () => void;
  listboxId?: string;
  query?: string;
}

export function AutocompleteItem({ product, isActive, index, showThumbnail = true, onClick, listboxId = 'autocomplete-listbox', query = '' }: AutocompleteItemProps) {
  const name = product.name;
  const matchIndex = query ? name.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const nameNode = matchIndex >= 0 ? (
    <>
      {name.slice(0, matchIndex)}
      <strong className="font-semibold">{name.slice(matchIndex, matchIndex + query.length)}</strong>
      {name.slice(matchIndex + query.length)}
    </>
  ) : name;

  return (
    <li
      id={`${listboxId}-item-${index}`}
      role="option"
      aria-selected={isActive}
      className={cn(
        "rounded-md transition-colors duration-150 cursor-pointer",
        isActive ? "bg-surface-card border-l-2 border-brand-400" : "hover:bg-surface-card"
      )}
    >
      <Link
        href={`/product/${product.slug.current}`}
        className="flex items-center gap-3 w-full p-3 min-h-[56px]"
        tabIndex={-1}
        onClick={onClick}
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
          <span className="type-body text-primary truncate">{nameNode}</span>
          <span className="type-caption text-secondary">
            {product.brand?.name && `${product.brand.name} · `}{formatPrice(product.price_data.unit_amount)}
          </span>
        </div>
      </Link>
    </li>
  );
}
