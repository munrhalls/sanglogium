import React from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface SearchEmptyProps {
  query: string;
}

export const CATEGORY_SUGGESTIONS = [
  { label: 'Headphones', href: '/products/headphones' },
  { label: 'IEMs', href: '/products/headphones/monitors-iems' },
  { label: 'Audio Electronics', href: '/products/audio-electronics' },
  { label: 'Accessories', href: '/products/accessories' },
];

export function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <MagnifyingGlass size={48} className="text-secondary-500 mb-6" />
      <h2 className="type-h3 text-primary mb-2">No products found</h2>
      <p className="type-body text-secondary mb-2">
        {query
          ? `We couldn\u2019t find any products matching \u201C${query}\u201D`
          : 'Enter a search term to find products'}
      </p>
      {query.trim().length === 1 ? (
        <p className="type-body text-secondary mb-8">Type at least 2 characters</p>
      ) : (
        <p className="type-caption text-caption mb-8">
          Check spelling or try a brand or model name.
        </p>
      )}
      {query && (
        <>
          <div className="section-header-anchor mb-4">
            <p className="type-overline text-accent-500">Try Instead</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-xs sm:max-w-none sm:flex sm:flex-wrap sm:items-center sm:justify-center">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <Link key={cat.href} href={cat.href} className="btn-secondary min-h-[44px]">
                {cat.label}
              </Link>
            ))}
          </div>
          <Link href="/products" className="btn-ghost min-h-[44px]">
            Browse all products &rarr;
          </Link>
        </>
      )}
    </div>
  );
}
