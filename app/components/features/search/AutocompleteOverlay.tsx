import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteItem } from './AutocompleteItem';
import type { AutocompleteProduct } from '@/sanity/lib/products/searchProducts';

interface AutocompleteOverlayProps {
  results: AutocompleteProduct[];
  query: string;
  activeIndex: number;
  isLoading: boolean;
  showThumbnails?: boolean;
  onItemClick?: () => void;
}

function AutocompleteSkeletonItem() {
  return (
    <li className="p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-md bg-secondary-800 animate-pulse shrink-0 hidden md:block" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-4 bg-secondary-800 animate-pulse rounded w-3/4" />
        <div className="h-3 bg-secondary-800 animate-pulse rounded w-1/2" />
      </div>
    </li>
  );
}

export function AutocompleteOverlay({
  results,
  query,
  activeIndex,
  isLoading,
  showThumbnails = true,
  onItemClick,
}: AutocompleteOverlayProps) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 w-full mt-2 z-50",
        "bg-surface-elevated border border-border-secondary rounded-lg shadow-cardDark",
        "opacity-100 translate-y-0 transition-all duration-200"
      )}
      role="listbox"
      id="autocomplete-listbox"
    >
      {isLoading ? (
        <ul className="py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <AutocompleteSkeletonItem key={i} />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <div className="p-4">
          <p className="type-body text-secondary">
            No products match &lsquo;{query}&rsquo;
          </p>
        </div>
      ) : (
        <>
          <div className="px-3 pt-3 pb-1">
            <span className="type-overline text-accent-500">Products</span>
          </div>
          <ul className="py-1" onClick={onItemClick}>
            {results.map((product, index) => (
              <AutocompleteItem
                key={product._id}
                product={product}
                isActive={index === activeIndex}
                index={index}
                showThumbnail={showThumbnails}
              />
            ))}
          </ul>
          <div className="border-t border-border-secondary p-3">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="type-caption text-brand-400 hover:underline"
              onClick={onItemClick}
            >
              View all results for &lsquo;{query}&rsquo; &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
