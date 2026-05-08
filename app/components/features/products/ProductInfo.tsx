"use client";

import { Product } from '@/sanity-cms/lib/products/getProductBySlug';
import { urlFor } from '@/sanity-cms/lib/image';
import { useState } from 'react';
import { Price } from '@/app/components/ui/Price';
import { ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { QuantitySelector } from '@/app/components/ui/QuantitySelector';
import { centsToDisplay } from '@/lib/utils/price';
import { BasketControls } from "@/app/components/features/basket/BasketControls";

export function ProductInfo({ product }: { product: Product }) {
  const [preAddQty, setPreAddQty] = useState(1);
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

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
          <Price value={displayPrice} />
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

      <div className="pt-4 space-y-6 ">
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart-large w-full flex justify-center"
          wrapperClassName="flex items-center gap-4"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </div >
  );
}
