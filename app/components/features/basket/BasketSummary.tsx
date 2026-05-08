"use client";
import React from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Price } from "@/app/components/ui/Price";
import { CheckoutButton } from "@/app/components/features/checkout/reservation/CheckoutButton";

interface BasketSummaryProps {
  itemCount: number;
  subtotal: number;
}

export default function BasketSummary({ itemCount, subtotal }: BasketSummaryProps) {
  return (
    <>
      <h2 className="type-section-sub border-b border-secondary pb-4 mb-6">
        Basket Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</div>
          <Price value={subtotal} variant="summary" />
        </div>

        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Shipping</div>
          <span className="text-green-600">FREE</span>
        </div>

        <div className="flex justify-between type-body">
          <div className="text-secondary-400">Tax</div>
          <Price value={0} variant="summary" />
        </div>

        <div className="border-t border-secondary pt-4">
          <div className="flex justify-between">
            <div className="type-section-sub">Total</div>
            <Price value={subtotal} variant="summary" />
          </div>
          <div className="type-caption text-caption mt-1">Including VAT</div>
        </div>
      </div>

      <CheckoutButton />

      <button
        type="button"
        className="btn-secondary block text-center mt-3 py-3 w-full"
      >
        <ArrowLeftIcon size={16} className="inline mr-2" />
        Continue Shopping
      </button>
    </>
  );
}
