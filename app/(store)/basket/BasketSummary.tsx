"use client";
import React from "react";
import { useBasketStore } from "@/store/store";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function BasketSummary() {
  const basket = useBasketStore((s) => s.basket);
  const getTotal = useBasketStore((s) => s.getTotal);

  const shipping = 15.99;
  const subtotal = getTotal();
  const total = subtotal + shipping;
  const itemCount = basket.reduce((sum, item) => sum + item.quantity, 0);

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

      <Link href="/checkout" className="btn-primary block text-center mt-6">
        Checkout
      </Link>

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
