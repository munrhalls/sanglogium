"use client";

import React from "react";
import { Price } from "@/app/components/ui/Price";

interface MockItem {
  productId: string;
  name: string;
  variantLabel?: string;
  displayPrice: number;
  quantity: number;
}

const MOCK_ITEMS: MockItem[] = [
  { productId: "m1", name: "Audeze LCD-5 Flagship Planar Magnetic Open-Back Headphones with Fluxor Magnet Array and Uniforce Voice Coil Technology for Audiophile Reference Listening", variantLabel: "Color: Matte Black | Impedance: 300 Ohms | Pad: Perforated Lambskin", displayPrice: 14299.49, quantity: 1 },
  { productId: "m2", name: "Focal Utopia", variantLabel: "Color: Black Carbon | Cable: 3m Balanced XLR", displayPrice: 8999.99, quantity: 2 },
  { productId: "m3", name: "Sennheiser HD 800 S", displayPrice: 1399.0, quantity: 1 },
  { productId: "m4", name: "HiFiMAN Susvara", variantLabel: "Impedance: 60 Ohms | Sensitivity: 83 dB", displayPrice: 17999.0, quantity: 1 },
  { productId: "m5", name: "Meze Audio Elite", displayPrice: 3999.5, quantity: 3 },
  { productId: "m6", name: "Dan Clark Audio EXPANSE", variantLabel: "Color: Gunmetal | Pad: Leather", displayPrice: 3999.0, quantity: 1 },
  { productId: "m7", name: "Abyss AB-1266 Phi TC", displayPrice: 4995.0, quantity: 1 },
  { productId: "m8", name: "Stax SR-009S", variantLabel: "Earspeaker | Bias: 580V", displayPrice: 3925.0, quantity: 2 },
  { productId: "m9", name: "HIFIMAN HE1000se", displayPrice: 1999.0, quantity: 1 },
  { productId: "m10", name: "Focal Clear MG", variantLabel: "Color: Chestnut | Cable: 3.5mm Unbalanced", displayPrice: 1499.0, quantity: 2 },
  { productId: "m11", name: "Sony MDR-Z1R", displayPrice: 1699.99, quantity: 1 },
  { productId: "m12", name: "Audio-Technica ATH-ADX5000 Air Dynamic Open-Back Headphones with Tungsten-Coated Diaphragm and 3D Wing Support System for Extended Listening Sessions", variantLabel: "Color: Black | Impedance: 420 Ohms | Driver: 58mm", displayPrice: 1999.49, quantity: 1 },
];

function MockBasketItem({ item }: { item: MockItem }) {
  const lineTotal = item.displayPrice * item.quantity;
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center px-6 py-5 gap-5 border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-1">Remove</span>
          </div>
        </div>
        <div className="flex items-center justify-center whitespace-nowrap"><Price value={item.displayPrice} /></div>
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">−</button>
            <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
            <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div className="flex items-center justify-end whitespace-nowrap"><Price value={lineTotal} /></div>
      </div>

      {/* Mobile */}
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary flex items-center justify-center text-text-caption type-caption">No image</div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="type-card-title line-clamp-2">{item.name}</h3>
            {item.variantLabel && <span className="text-text-secondary text-small">{item.variantLabel}</span>}
            <span className="type-metadata">Unit: <Price value={item.displayPrice} /></span>
            <span className="text-text-caption hover:text-text-secondary transition-colors duration-150 cursor-pointer text-small mt-0.5">Remove</span>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between py-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Decrease quantity">−</button>
              <span className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none">{item.quantity}</span>
              <button type="button" className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div className="type-price"><Price value={lineTotal} /></div>
        </div>
      </div>
    </>
  );
}

function MockBasketSummary({ shippingCost }: { shippingCost: number | null }) {
  const subtotal = MOCK_ITEMS.reduce((s, i) => s + i.displayPrice * i.quantity, 0);
  const itemCount = MOCK_ITEMS.reduce((s, i) => s + i.quantity, 0);
  const total = shippingCost !== null ? subtotal + shippingCost : subtotal;
  return (
    <>
      <h2 className="type-section-sub border-b border-border-primary pb-4 mb-6">Basket Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Subtotal ({itemCount} items)</span>
          <Price value={subtotal} className="whitespace-nowrap" />
        </div>
        <div className="flex justify-between items-baseline gap-4">
          <span className="type-caption whitespace-nowrap">Shipping (estimated)</span>
          {shippingCost !== null ? (
            <Price value={shippingCost} className="whitespace-nowrap" />
          ) : (
            <span className="type-caption whitespace-nowrap">Calculating...</span>
          )}
        </div>
        <div className="border-t border-border-primary pt-4 mt-1 mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="type-section-sub whitespace-nowrap">Total</span>
            <span className="text-text-accent font-bold text-spotlight tabular-nums whitespace-nowrap">
              <Price value={total} />
            </span>
          </div>
          <div className="type-caption mt-1 mb-4">Including VAT</div>
        </div>
      </div>
      <div className="pb-24 lg-touch:pb-0 lg-desktop:pb-0">
        <button type="button" className="btn-primary w-full px-6 py-3">Checkout</button>
        <button type="button" className="btn-secondary block text-center mt-3 py-3 w-full">Continue Shopping</button>
      </div>
    </>
  );
}

export default function BasketUIMock({ shippingCost = null }: { shippingCost?: number | null }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-[65%_1fr] lg-desktop:grid-cols-[65%_1fr]">
      <div className="card-base overflow-hidden pb-48 lg-touch:pb-0 lg-desktop:pb-0">
        <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg-desktop:grid lg-desktop:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-5">
          <div className="type-overline">Product</div>
          <div className="type-overline text-center">Price</div>
          <div className="type-overline text-center">Quantity</div>
          <div className="type-overline text-right">Total</div>
        </div>
        {MOCK_ITEMS.map((item) => (
          <MockBasketItem key={item.productId} item={item} />
        ))}
      </div>
      {/* Desktop sticky summary */}
      <div className="hidden lg-touch:block lg-desktop:block lg-touch:sticky lg-touch:top-4 lg-desktop:sticky lg-desktop:top-4 self-start">
        <div className="card-product-dark shadow-cardDark">
          <MockBasketSummary shippingCost={shippingCost} />
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="lg-touch:hidden lg-desktop:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-card border-t border-border-secondary px-4 py-4">
        <MockBasketSummary shippingCost={shippingCost} />
      </div>
    </div>
  );
}
