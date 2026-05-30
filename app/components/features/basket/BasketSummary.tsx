"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Price } from "@/app/components/ui/Price";
import { CheckoutButton } from "@/app/components/features/checkout/reservation/CheckoutButton";

interface BasketSummaryProps {
  itemCount: number;
  subtotal: number;
  basketData?: Array<{ productId: string; quantity: number; price_data: { currency: string; unit_amount: number } }>;
  shippingCost: number | null;
}

export default function BasketSummary({ itemCount, subtotal, basketData, shippingCost }: BasketSummaryProps) {
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;

  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">
        Basket Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between type-body">
          <div className="text-text-caption">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</div>
          <Price value={subtotal} variant="summary" />
        </div>

        <div className="flex justify-between type-body">
          <div className="text-text-caption">Shipping</div>
          {shippingCost !== null ? (
            <Price value={shippingCost} variant="summary" />
          ) : (
            <span className="text-text-caption">Calculating...</span>
          )}
        </div>

        <div className="flex justify-between type-body">
          <div className="text-text-caption">Tax</div>
          <Price value={0} variant="summary" />
        </div>

        <div className="border-t border-border-primary pt-4">
          <div className="flex justify-between">
            <div className="type-section-sub">Total</div>
            <Price value={total} variant="summary" />
          </div>
          <div className="type-caption mt-1">Including VAT</div>
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
