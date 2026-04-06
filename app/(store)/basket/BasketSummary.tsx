"use client";
import React from "react";
import { useBasketStore, selectBasketTotal, selectBasketCount, selectIsCheckoutEnabled } from "@/store/store";
import { useCheckoutStore } from '@/store/checkout';

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Price } from "@/app/components/ui/Price";

export default function BasketSummary() {
  const subtotal = useBasketStore(selectBasketTotal);
  const itemCount = useBasketStore(selectBasketCount);
  const isCheckoutEnabled = useBasketStore(selectIsCheckoutEnabled);
  const router = useRouter();

  const shipping = 15.99;
  const total = subtotal + shipping;
  const checkoutStatus = useCheckoutStore((state) => state.status);

  const handleCheckout = function () {
    useCheckoutStore.getState().nextStep();
  }

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
        <>
          {checkoutStatus === "IDLE" && (
            <button
              onClick={handleCheckout}
              className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold text-brand-700"
            >
              Checkout
            </button>
          )}
          {checkoutStatus !== "IDLE" && (
            <div className="mt-6 text-center">Processing...</div>
          )}
        </>
      ) : (
        <button
          disabled
          className="btn-primary block text-center mt-6 py-3 px-6 uppercase tracking-editorial type-body font-bold opacity-50 cursor-not-allowed text-brand-700"
        >
          Checkout
        </button>
      )}

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
