"use client";
import React from "react";
import { useBasketStore, selectBasketTotal, selectBasketCount } from "@/store/store";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Price } from "@/app/components/ui/Price";
import { CheckoutButton } from "@/components/checkout/reservation/CheckoutButton";

export default function BasketSummary() {
  const basket = useBasketStore((s) => s.basket);
  const subtotal = useBasketStore(selectBasketTotal);
  const itemCount = useBasketStore(selectBasketCount);
  const router = useRouter();

  // Simple client-side validation
  const isBasketEmpty = basket.length === 0;
  const hasInvalidQuantities = basket.some(item => item.quantity <= 0);

  return (
    <>
      <h2 className="type-section-sub border-b border-secondary pb-4 mb-6">
        Basket Summary
      </h2>

      {/* Simple status messages */}
      {isBasketEmpty && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-800 text-sm">Your basket is empty</p>
        </div>
      )}

      {hasInvalidQuantities && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">Some items have invalid quantities</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Subtotal ({itemCount} items)</div>
          <Price value={subtotal} variant="summary" />
        </div>

        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Shipping</div>
          <span className="text-green-600">FREE</span>
        </div>

        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Tax</div>
          <Price value={subtotal * 0.2} variant="summary" />
        </div>

        <div className="border-t border-secondary pt-4" aria-live="polite">
          <div className="flex justify-between">
            <div className="type-section-sub">Total</div>
            <Price value={subtotal * 1.2} variant="summary" />
          </div>
          <div className="type-caption text-caption mt-1">Including VAT</div>
        </div>
      </div>

      <CheckoutButton />

      <button
        type="button"
        onClick={() => router.back()}
        className="btn-secondary block text-center mt-3 py-3 w-full"
      >
        <ArrowLeftIcon size={16} className="inline mr-2" />
        Continue Shopping
      </button>
    </>
  );
}
