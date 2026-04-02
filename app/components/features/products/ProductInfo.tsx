"use client";

import { Product } from '@/sanity/lib/products/getProductBySlug';
import { urlFor } from '@/sanity/lib/image';
import { useBasketStore } from '@/store/store';
import { useState } from 'react';
import { Price } from '@/app/components/ui/Price';
import { ShoppingCart, Check } from '@phosphor-icons/react/dist/ssr';
import { QuantitySelector } from '@/app/components/ui/QuantitySelector';

export function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'added'>('idle');
  const addItem = useBasketStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem({
        _id: product._id,
        name: product.name,
        displayPrice: product.displayPrice,
        stock: product.stock,
        quantity: quantity,
        image: product.image ? urlFor(product.image).width(100).height(100).url() : '',
        slug: product.slug.current,
      });
      setFeedbackState('added');
      setTimeout(() => setFeedbackState('idle'), 2000);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-error-500' };
    if (product.stock <= 5) return { text: `Only ${product.stock} left`, color: 'text-warning-500' };
    return { text: 'In Stock', color: 'text-success-500' };
  };

  const stockStatus = getStockStatus();
  return (
    <div className="space-y-6" data-testid="product-info">
      <div className="space-y-2">
        <p className="type-overline text-accent-500">{product.brand?.name || ''}</p>
        <h1 className="type-section-hed text-headline">{product.name}</h1>
        <div className="flex items-center gap-4">
          <Price value={product.displayPrice} />
        </div>
        <p className="type-caption text-secondary">SKU: {product.sku}</p>
        <p className={`type-caption ${stockStatus.color}`}>{stockStatus.text}</p>
      </div>

      {product.overviewFields && product.overviewFields.length > 0 && (
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-secondary">
          {product.overviewFields.map((field) => (
            <div key={field.title}>
              <p className="type-caption uppercase text-secondary">{field.title}</p>
              <p className="type-body text-primary">{field.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-4">
          <span className="type-body text-secondary">Quantity:</span>
          <QuantitySelector
            quantity={quantity}
            min={1}
            max={product.stock}
            onIncrement={() => setQuantity(Math.min(product.stock, quantity + 1))}
            onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
            size="md"
          />
        </div>

        {feedbackState === 'added' ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-sm bg-success-700 text-brand-50 transition-colors duration-200"
          >
            <Check size={20} weight="bold" />
            Added
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-cart w-full"
          >
            <ShoppingCart size={20} weight="regular" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
