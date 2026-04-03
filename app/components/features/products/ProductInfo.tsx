"use client";

import { Product } from '@/sanity/lib/products/getProductBySlug';
import { urlFor } from '@/sanity/lib/image';
import { useBasketStore, selectBasketItem } from '@/store/store';
import { useState } from 'react';
import { Price } from '@/app/components/ui/Price';
import { ShoppingCartIcon, CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { QuantitySelector } from '@/app/components/ui/QuantitySelector';

export function ProductInfo({ product }: { product: Product }) {
  const [preAddQty, setPreAddQty] = useState(1);
  const basketItem = useBasketStore(selectBasketItem(product._id));

  const addItem = useBasketStore((s) => s.addItem);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);


  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem({
        _id: product._id,
        name: product.name,
        displayPrice: product.displayPrice,
        stock: product.stock,
        quantity: preAddQty,
        image: product.image ? urlFor(product.image).width(100).height(100).url() : '',
        slug: product.slug.current,
      });
    }
  };

  const handleBasketIncrement = () => {
    if (basketItem && basketItem.quantity < product.stock) {
      updateQuantity(product._id, basketItem.quantity + 1);
    }
  };

  const handleBasketDecrement = () => {
    if (basketItem) {
      if (basketItem.quantity <= 1) {
        removeItem(product._id);
      } else {
        updateQuantity(product._id, basketItem.quantity - 1);
      }
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

      <div className="pt-4 space-y-4 ">

        {basketItem ? (
          <>
            <button
              disabled
              className="btn-in-basket-large w-full flex justify-center"
            >
              <CheckIcon size={20} weight="bold" />
              {basketItem.quantity} in Cart
            </button>
            <div className="flex items-center gap-4">
              <span className="type-body text-secondary">In cart:</span>
              <QuantitySelector
                quantity={basketItem.quantity}
                min={0}
                max={product.stock}
                onIncrement={handleBasketIncrement}
                onDecrement={handleBasketDecrement}
                size="md"
              />
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-cart-large w-full flex justify-center"
            >
              <ShoppingCartIcon size={24} weight="bold" />
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        )}
      </div>
    </div >
  );
}
