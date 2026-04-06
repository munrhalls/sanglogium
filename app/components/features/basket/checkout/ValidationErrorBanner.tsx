"use client";

import { DiscrepancyPayload } from "@/store/preCheckout/preCheckoutTypes";

interface ValidationErrorBannerProps {
  discrepancy: DiscrepancyPayload;
}

export default function ValidationErrorBanner({ discrepancy }: ValidationErrorBannerProps) {
  if (discrepancy.type === "STRIPE_CONFIG") {
    return (
      <div className="bg-error-500/10 border border-error-500 p-3 lg-desktop:p-4 lg-touch:p-4 mb-3 lg-desktop:mb-4 lg-touch:mb-4 rounded-sm">
        <p className="type-caption lg-desktop:type-body lg-touch:type-body text-error-500">{discrepancy.message}</p>
      </div>
    );
  }

  if (discrepancy.type === "PRICE") {
    return (
      <div className="bg-warning-500/10 border border-warning-500 p-3 lg-desktop:p-4 lg-touch:p-4 mb-3 lg-desktop:mb-4 lg-touch:mb-4 rounded-sm">
        <h3 className="type-caption lg-desktop:type-body lg-touch:type-body text-warning-500 mb-2">Price Changes Detected</h3>
        <div className="space-y-2">
          {discrepancy.items.map((item) => (
            <div key={item.id} className="bg-surface-card p-2 lg-desktop:p-3 lg-touch:p-3 rounded-sm border border-secondary">
              <p className="type-caption lg-desktop:type-body lg-touch:type-body text-primary">{item.productName}</p>
              <p className="type-metadata lg-desktop:type-caption lg-touch:type-caption text-secondary line-through">Old price: ${item.expected}</p>
              <p className="type-metadata lg-desktop:type-caption lg-touch:type-caption text-success-500 font-semibold">New price: ${item.actual}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (discrepancy.type === "INVENTORY") {
    return (
      <div className="bg-warning-500/10 border border-warning-500 p-3 lg-desktop:p-4 lg-touch:p-4 mb-3 lg-desktop:mb-4 lg-touch:mb-4 rounded-sm">
        <h3 className="type-caption lg-desktop:type-body lg-touch:type-body text-warning-500 mb-2">Stock Availability Changed</h3>
        <div className="space-y-2">
          {discrepancy.items.map((item) => (
            <div key={item.id} className="bg-surface-card p-2 lg-desktop:p-3 lg-touch:p-3 rounded-sm border border-secondary">
              <p className="type-caption lg-desktop:type-body lg-touch:type-body text-primary">{item.productName}</p>
              <p className="type-metadata lg-desktop:type-caption lg-touch:type-caption text-secondary">Requested: {item.requested}</p>
              <p className="type-metadata lg-desktop:type-caption lg-touch:type-caption text-error-500 font-semibold">Available: {item.available}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-error-500/10 border border-error-500 p-3 lg-desktop:p-4 lg-touch:p-4 mb-3 lg-desktop:mb-4 lg-touch:mb-4 rounded-sm">
      <p className="type-caption lg-desktop:type-body lg-touch:type-body text-error-500">Validation error occurred</p>
    </div>
  );
}
