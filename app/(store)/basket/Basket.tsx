"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBasketStore } from "@/store/store";
import BasketControls from "@/app/components/features/basket/BasketControls";
import { Price } from "@/app/components/ui/Price";
import { centsToDisplay } from "@/lib/utils/price";
export default function Basket() {
  const basket = useBasketStore((s) => s.basket);
  const removeItem = useBasketStore((s) => s.removeItem);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  // Basket is no longer locked by old checkout flow
  const isBasketLocked = false;

  const handleRemoveStart = useCallback((id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeItem(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 500);
  }, [removeItem]);

  return (
    <div>
      {/* Header row - desktop only */}
      <div className="hidden lg-desktop:grid lg-touch:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] border-b border-border-secondary px-6 py-3">
        <div className="type-caption uppercase tracking-editorial text-secondary-500">Product</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Price</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Qty</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-right">Total</div>
      </div>

      {basket.map((item) => {
        const isRemoving = removingIds.has(item._id);
        return (
          <div
            key={item._id}
            data-testid={`basket-item-${item._id}`}
            className={`grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] transition-all duration-200 hover:bg-secondary-900/50 ${isRemoving ? 'opacity-0 max-h-0 overflow-hidden py-0 px-5 border-b-0' : 'opacity-100 max-h-96'
              }`}
            style={isRemoving ? { transitionDuration: '200ms, 300ms', transitionProperty: 'opacity, max-height, padding' } : undefined}
          >
            {/* Product column */}
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="type-body hover:text-brand-100 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
                  <Price value={centsToDisplay(item.price_data.unit_amount)} />
                  {" "}× {item.quantity}
                </p>
              </div>
            </div>

            {/* Price column - desktop only */}
            <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
              <Price value={centsToDisplay(item.price_data.unit_amount)} />
            </div>

            {/* Quantity column */}
            <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
              <BasketControls
                product={item}
                onRemoveStart={handleRemoveStart}
                disabled={isBasketLocked}
              />
            </div>

            {/* Total column - desktop only */}
            <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
              <Price value={centsToDisplay(item.price_data.unit_amount) * item.quantity} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
