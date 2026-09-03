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
      <h2 className="type-section-sub border-b border-border-primary pb-2 mb-3 lg-touch:pb-4 lg-touch:mb-6 lg-desktop:pb-4 lg-desktop:mb-6">
        Basket Summary
      </h2>

      <div className="space-y-2 lg-touch:space-y-3 lg-desktop:space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <div className="type-caption whitespace-nowrap">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</div>
          <Price value={subtotal} className="whitespace-nowrap tabular-nums" />
        </div>

        <div className="flex justify-between items-baseline gap-4">
          <div className="type-caption whitespace-nowrap">Shipping (estimated)</div>
          {shippingCost !== null ? (
            <Price value={shippingCost} className="whitespace-nowrap tabular-nums" />
          ) : (
            <span className="type-caption whitespace-nowrap">Calculating...</span>
          )}
        </div>

        {0 > 0 && (
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-caption whitespace-nowrap">Tax</div>
            <Price value={0} className="whitespace-nowrap" />
          </div>
        )}

        <div className="border-t border-border-primary pt-3 mt-1 mb-3 lg-touch:pt-4 lg-touch:mb-6 lg-desktop:pt-4 lg-desktop:mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <div className="type-section-sub whitespace-nowrap">Total</div>
            <span className="text-text-accent font-bold text-spotlight whitespace-nowrap">
              <Price value={total} className="tabular-nums" />
            </span>
          </div>
          <div className="type-caption mt-1 mb-2 lg-touch:mb-4 lg-desktop:mb-4">Including VAT</div>
        </div>
      </div>

      <div>
        <CheckoutButton basketData={basketData} disabled={itemCount === 0} />

        <Link
          href="/"
          className="hidden lg-touch:block lg-desktop:block btn-secondary text-center mt-3 py-3 w-full"
        >
          <ArrowLeftIcon size={16} className="inline mr-2" />
          Continue Shopping
        </Link>
      </div>
    </>
  );
}
