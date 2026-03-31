import React from 'react';

interface ShopHeaderProps {
  title: string;
  productCount: number;
  overline?: string;
}

export function ShopHeader({ title, productCount, overline }: ShopHeaderProps) {
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <header className="flex flex-col gap-2 mb-8" data-testid="shop-header">
      {overline && (
        <span className="type-overline">{overline}</span>
      )}
      <h1 className="type-section-hed section-header-anchor">{title}</h1>
      <span className="type-metadata">
        {productCount} {countLabel}
      </span>
    </header>
  );
}
