import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/tailwind';
import { AutocompleteItem } from './AutocompleteItem';
import { CATEGORY_SUGGESTIONS } from './SearchEmpty';
import type { AutocompleteProduct } from '@/sanity-cms/lib/products/searchProducts';

interface AutocompleteOverlayProps {
  results: AutocompleteProduct[];
  query: string;
  activeIndex: number;
  isLoading: boolean;
  showThumbnails?: boolean;
  onItemClick?: () => void;
  error?: boolean;
  listboxId?: string;
  mobile?: boolean;
}

function AutocompleteSkeletonItem() {
  return (
    <li className="p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-md bg-secondary-800 animate-pulse shrink-0" />
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
  error = false,
  listboxId = 'autocomplete-listbox',
  mobile = false,
}: AutocompleteOverlayProps) {
  const statusText = error
    ? 'Unable to load suggestions'
    : isLoading
      ? 'Loading suggestions'
      : results.length > 0
        ? `${results.length} suggestions`
        : 'No suggestions';

  const viewAllLink = (
    <Link
      href={`/search?q=${encodeURIComponent(query)}`}
      className={cn(
        "type-caption text-brand-400 hover:underline",
        mobile && "flex items-center min-h-[44px] px-3"
      )}
      onClick={onItemClick}
    >
      View all results for &lsquo;{query}&rsquo; &rarr;
    </Link>
  );

  return (
    <div
      className={mobile
        ? cn(
          "flex-1 min-h-0 w-full overflow-y-auto overscroll-contain",
          "bg-surface-elevated pb-[env(safe-area-inset-bottom)]"
        )
        : cn(
          "absolute top-full left-0 w-full mt-2 z-50",
          "bg-surface-elevated border border-border-secondary rounded-lg shadow-cardDark",
          "opacity-100 translate-y-0 transition-all duration-200"
        )
      }
    >
      <div role="status" className="sr-only">{statusText}</div>
      {error ? (
        <div className="p-4">
          <p className="type-body text-secondary">
            Unable to load suggestions. Please try again.
          </p>
        </div>
      ) : isLoading && results.length === 0 ? (
        <ul className="py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <AutocompleteSkeletonItem key={i} />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <div className="p-4">
          <p className="type-body text-secondary mb-4">
            No products match &lsquo;{query}&rsquo;
          </p>
          <div className="section-header-anchor mb-2">
            <span className="type-overline text-accent-500">Try Instead</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={onItemClick}
                className="btn-secondary type-caption"
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <Link
            href="/products"
            onClick={onItemClick}
            className="type-caption text-brand-400 hover:underline"
          >
            Browse all products &rarr;
          </Link>
        </div>
      ) : (
        <>
          {mobile && (
            <div className="border-b border-border-secondary">
              {viewAllLink}
            </div>
          )}
          <div className="px-3 pt-3 pb-1">
            <span className="type-overline text-accent-500">Products</span>
          </div>
          <ul
            role="listbox"
            id={listboxId}
            className={cn("py-1", isLoading && "opacity-60")}
          >
            {results.map((product, index) => (
              <AutocompleteItem
                key={product._id}
                product={product}
                isActive={index === activeIndex}
                index={index}
                showThumbnail={showThumbnails}
                onClick={onItemClick}
                listboxId={listboxId}
                query={query}
              />
            ))}
          </ul>
          {!mobile && (
            <div className="border-t border-border-secondary p-3">
              {viewAllLink}
            </div>
          )}
        </>
      )}
    </div>
  );
}
