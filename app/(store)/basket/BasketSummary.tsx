"use client";
import React from "react";
import { useBasketStore, selectBasketTotal, selectBasketCount } from "@/store/store";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Price } from "@/app/components/ui/Price";
import CheckoutPanel from "@/app/components/features/basket/checkout/CheckoutPanel";
import { usePreCheckout } from "@/app/components/features/basket/checkout/usePreCheckout";

export default function BasketSummary() {
  const subtotal = useBasketStore(selectBasketTotal);
  const itemCount = useBasketStore(selectBasketCount);
  const router = useRouter();
  const preCheckout = usePreCheckout();

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

      <CheckoutPanel
        state={preCheckout.state}
        context={preCheckout.context}
        checkout={preCheckout.checkout}
        retry={preCheckout.retry}
        acceptAndContinue={preCheckout.acceptAndContinue}
        reset={preCheckout.reset}
        isAccepting={false}
      />

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
