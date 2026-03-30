import React from 'react';

interface ShopHeaderProps {
  title: string;
  productCount: number;
}

export function ShopHeader({ title, productCount }: ShopHeaderProps) {
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <div className="mb-6" data-testid="shop-header">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">
        {productCount} {countLabel}
      </p>
    </div>
  );
}
