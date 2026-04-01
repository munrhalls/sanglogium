import React from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

interface SearchEmptyProps {
  query: string;
}

const CATEGORY_SUGGESTIONS = [
  { label: 'Headphones', href: '/products/headphones' },
  { label: 'IEMs', href: '/products/iems' },
  { label: 'DACs & Amps', href: '/products/dacs-and-amps' },
  { label: 'Accessories', href: '/products/accessories' },
];

export function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <MagnifyingGlass size={48} className="text-secondary-500 mb-6" />
      <h3 className="type-h3 text-primary mb-2">No products found</h3>
      <p className="type-body text-secondary mb-8">
        {query
          ? `We couldn\u2019t find any products matching \u201C${query}\u201D`
          : 'Enter a search term to find products'}
      </p>
      {query && (
        <>
          <div className="section-header-anchor mb-4">
            <p className="type-overline text-accent-500">Try Instead</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {CATEGORY_SUGGESTIONS.map((cat) => (
              <Link key={cat.href} href={cat.href} className="btn-secondary">
                {cat.label}
              </Link>
            ))}
          </div>
          <Link href="/products/headphones" className="btn-ghost">
            Browse all products &rarr;
          </Link>
        </>
      )}
    </div>
  );
}
