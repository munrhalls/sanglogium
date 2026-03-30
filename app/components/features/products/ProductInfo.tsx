import React from 'react';
import { Price } from '@/app/components/ui/Price';

interface ProductInfoProps {
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  description?: string;
}

export function ProductInfo({ name, brand, displayPrice, description }: ProductInfoProps) {
  return (
    <div className="space-y-6" data-testid="product-info">
      <div className="space-y-2">
        <p className="text-sm text-gray-600 uppercase tracking-wide">{brand.name}</p>
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        <div className="text-2xl">
          <Price value={displayPrice} />
        </div>
      </div>

      {description && (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Add to Cart Placeholder */}
      <div className="pt-4">
        <button
          className="w-full bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          disabled
        >
          Add to Cart (Coming Soon)
        </button>
      </div>
    </div>
  );
}
