"use client";
import React from "react";
import { useBasketStore, selectBasketTotal, selectBasketCount, selectIsCheckoutEnabled } from "@/store/store";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

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
          <div className="text-body">Subtotal ({itemCount} items)</div>
          <div className="type-price">${subtotal.toFixed(2)}</div>
        </div>

        <div className="flex justify-between type-body">
          <div className="text-body">Shipping</div>
          <div className="type-price">${shipping.toFixed(2)}</div>
        </div>

        <div className="border-t border-secondary pt-4">
          <div className="flex justify-between">
            <div className="type-section-sub">Total</div>
            <div className="type-section-sub">${total.toFixed(2)}</div>
          </div>
          <div className="type-caption text-caption mt-1">Including VAT</div>
        </div>
      </div>

      {isCheckoutEnabled ? (
        <Link href="/checkout" className="btn-primary block text-center mt-6">
          Checkout
        </Link>
      ) : (
        <button
          disabled
          className="btn-primary block text-center mt-6 opacity-50 cursor-not-allowed"
        >
          Checkout
        </button>
      )}

      <Link
        href="/products"
        className="btn-secondary block text-center mt-4"
      >
        <ArrowLeft size={16} className="inline mr-2" />
        Continue Shopping
      </Link>

      <div className="border-t border-secondary pt-6 mt-6">
        <div className="type-caption text-caption mb-2">We Accept:</div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-10 rounded bg-surface-elevated border border-secondary"></div>
          <div className="h-6 w-10 rounded bg-surface-elevated border border-secondary"></div>
          <div className="h-6 w-10 rounded bg-surface-elevated border border-secondary"></div>
          <div className="h-6 w-10 rounded bg-surface-elevated border border-secondary"></div>
        </div>
        <div className="type-caption text-caption mt-2">
          Secure checkout powered by Stripe
        </div>
      </div>
    </>
  );
}
