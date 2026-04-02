"use client";
import React from "react";
import { useBasketStore, selectBasketTotal, selectBasketCount, selectIsCheckoutEnabled } from "@/store/store";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { Price } from "@/app/components/ui/Price";

export default function BasketSummary() {
  const subtotal = useBasketStore(selectBasketTotal);
  const itemCount = useBasketStore(selectBasketCount);
  const isCheckoutEnabled = useBasketStore(selectIsCheckoutEnabled);

  const shipping = 15.99;
  const total = subtotal + shipping;

  return (
    <>
      <h2 className="type-section-sub border-b border-secondary pb-4 mb-6">
        Basket Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Subtotal ({itemCount} items)</div>
          <Price value={subtotal} variant="summary" />
        </div>

        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Shipping</div>
          <Price value={shipping} variant="summary" />
        </div>

        <div className="border-t border-secondary pt-4" aria-live="polite">
          <div className="flex justify-between">
            <div className="type-section-sub">Total</div>
            <Price value={total} variant="summary" />
          </div>
          <div className="type-caption text-caption mt-1">Including VAT</div>
        </div>
      </div>

      {isCheckoutEnabled ? (
        <Link href="/checkout" className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold">
          Checkout
        </Link>
      ) : (
        <button
          disabled
          className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold opacity-50 cursor-not-allowed"
        >
          Checkout
        </button>
      )}

      <Link
        href="/products"
        className="btn-secondary block text-center mt-3 py-3"
      >
        <ArrowLeft size={16} className="inline mr-2" />
        Continue Shopping
      </Link>
    </>
  );
}
