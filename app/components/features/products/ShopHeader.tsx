import React from 'react';

interface ShopHeaderProps {
  title: string;
  overline?: string;
}

export function ShopHeader({ title, overline }: ShopHeaderProps) {
  return (
    <header className="flex flex-col gap-2 mb-8" data-testid="shop-header">
      {overline && (
        <span className="type-overline text-accent-500 section-header-anchor">
          {overline}
        </span>
      )}
      <h1 className="type-section-hed">{title}</h1>
    </header>
  );
}
