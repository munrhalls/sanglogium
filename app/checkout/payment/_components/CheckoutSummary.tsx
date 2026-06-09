import Image from "next/image";

interface CheckoutItem {
  productId: string;
  name: string;
  condition?: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Address {
  firstName?: string;
  lastName?: string;
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  regionCode: string;
}

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  shippingCost: number;
  shippingLabel: string;
  shippingEstimatedDays?: number;
  address?: Address;
  subtotal: number;
  grandTotal: number;
  vatAmount: number;
}

function formatPLN(cents: number): string {
  return (cents / 100).toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

export default function CheckoutSummary({
  items,
  shippingCost,
  shippingLabel,
  shippingEstimatedDays,
  address,
  subtotal,
  grandTotal,
  vatAmount,
}: CheckoutSummaryProps) {
  const deliveryEstimate = shippingEstimatedDays
    ? `${shippingEstimatedDays} business days`
    : null;

  return (
    <div className="card-base space-y-4">
      <h2 className="type-section-hed">Order Summary</h2>

      {/* Shipping address confirmation */}
      {address && (
        <div className="rounded-md px-3 py-2 mb-4 bg-surface-subtle">
          <p className="type-caption text-text-caption mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Deliver to
          </p>
          <p className="type-body font-medium">
            {address.firstName || address.lastName
              ? `${address.firstName ?? ''} ${address.lastName ?? ''}`.trim()
              : 'Guest'}
          </p>
          <p className="type-body">
            {address.street} {address.streetNumber}
          </p>
          <p className="type-body">
            {address.postalCode} {address.city}
          </p>
          <p className="type-body">{address.regionCode}</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start gap-3">
            {/* Product thumbnail */}
            {item.imageUrl ? (
              <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-surface-elevated">
                <Image
                  src={item.imageUrl}
                  alt={item.name || "Product"}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 shrink-0 rounded bg-surface-elevated flex items-center justify-center text-text-caption text-xs">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {item.condition && (
                    <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded-sm bg-warning-500/20 text-warning-500 type-caption font-medium">
                      {item.condition}
                    </span>
                  )}
                  <span className="type-card-title break-words" style={{ wordBreak: "break-word" }}>
                    {item.name || "Product"} <span className="text-text-secondary">× {item.quantity}</span>
                  </span>
                </div>
                <span className="type-price shrink-0 tabular-nums min-w-[72px] text-right">{formatPLN(item.lineTotal)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-body">
          <span className="min-w-0 flex-1 text-text-secondary">Subtotal</span>
          <span className="type-price shrink-0 tabular-nums">{formatPLN(subtotal)}</span>
        </div>
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-start justify-between gap-4 type-body">
          <span className="min-w-0 flex-1 text-text-secondary">
            {shippingLabel}
            {deliveryEstimate && (
              <span className="block type-caption text-text-caption mt-0.5">{deliveryEstimate}</span>
            )}
          </span>
          <span className="type-price shrink-0 tabular-nums">{formatPLN(shippingCost)}</span>
        </div>
      </div>

      {/* VAT line — de-emphasised */}
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 flex-1 type-caption text-text-caption">VAT (included)</span>
          <span className="type-caption text-text-caption shrink-0 tabular-nums">{formatPLN(vatAmount)}</span>
        </div>
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-section-sub">
          <span className="min-w-0 flex-1">Total</span>
          <span className="shrink-0 tabular-nums text-brand-400">{formatPLN(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
