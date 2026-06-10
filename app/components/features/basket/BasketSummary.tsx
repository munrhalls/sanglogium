"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Price } from "@/app/components/ui/Price";
import { CheckoutButton } from "@/app/components/features/checkout/reservation/CheckoutButton";

interface BasketSummaryProps {
  itemCount: number;
  subtotal: number;
  basketData?: Array<{ productId: string; quantity: number; price_data: { currency: string; unit_amount: number }; availableStock?: number }>;
  shippingCost: number | null;
}

export default function BasketSummary({ itemCount, subtotal, basketData, shippingCost }: BasketSummaryProps) {
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;

  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">
        Basket Summary
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <div className="type-section-caption text-text-secondary whitespace-nowrap">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</div>
          <Price value={subtotal} variant="summary" currency="PLN" className="whitespace-nowrap" />
        </div>

        <div className="flex justify-between items-baseline gap-4">
          <div className="type-section-caption text-text-secondary whitespace-nowrap">Shipping (estimated)</div>
          {shippingCost !== null ? (
            <Price value={shippingCost} variant="summary" currency="PLN" className="whitespace-nowrap" />
          ) : (
            <span className="type-section-caption text-text-secondary whitespace-nowrap">Calculating...</span>
          )}
        </div>

        {0 > 0 && (
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-section-caption text-text-secondary whitespace-nowrap">Tax</div>
            <Price value={0} variant="summary" currency="PLN" className="whitespace-nowrap" />
          </div>
        )}

        <div className="border-t border-border-primary pt-4 mt-1 mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-section-sub whitespace-nowrap">Total</div>
            <Price value={total} variant="summary" currency="PLN" className="type-section-sub tabular-nums text-brand-400 whitespace-nowrap" />
          </div>
          <div className="type-section-caption text-text-secondary mt-1 mb-4">Including VAT</div>
        </div>
      </div>

      <CheckoutButton basketData={basketData} />

      <Link
        href="/"
        className="btn-secondary block text-center mt-3 py-3 w-full"
      >
        <ArrowLeftIcon size={16} className="inline mr-2" />
        Continue Shopping
      </Link>
    </>
  );
}
