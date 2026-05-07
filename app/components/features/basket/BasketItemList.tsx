"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BasketControls } from "./BasketControls";
import { Price } from "@/app/components/ui/Price";

export default function Basket() {
  return (
    <div>
      {/* Header row - desktop only */}
      <div className="hidden lg-desktop:grid lg-touch:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] border-b border-border-secondary px-6 py-3">
        <div className="type-caption uppercase tracking-editorial text-secondary-500">Product</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Price</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Qty</div>
        <div className="type-caption uppercase tracking-editorial text-secondary-500 text-right">Total</div>
      </div>

      {/* Basket items would map here - structure only */}
      <div
        className="grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] hover:bg-secondary-900/50"
      >
        {/* Product column */}
        <div className="flex items-center gap-5">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
            <Image
              src="/placeholder"
              alt="Product name"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <div>
            <Link href="/product/slug">
              <h3 className="type-body hover:text-brand-100 transition-colors">
                Product Name
              </h3>
            </Link>
            <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
              <Price value={100} />
              {" "}× 1
            </p>
          </div>
        </div>

        {/* Price column - desktop only */}
        <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
          <Price value={100} />
        </div>

        {/* Quantity column */}
        <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
          {/* <BasketControls /> */}
        </div>

        {/* Total column - desktop only */}
        <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
          <Price value={100} />
        </div>
      </div>
    </div>
  );
}
