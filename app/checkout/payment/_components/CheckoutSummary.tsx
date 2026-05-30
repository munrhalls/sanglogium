interface CheckoutItem {
  productId: string;
  name: string;
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
  shippingCode?: string;
  shippingCarrier?: string;
  shippingMethodName?: string;
  shippingEstimatedDays?: number;
  address?: Address;
  subtotal: number;
  grandTotal: number;
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
  shippingCode,
  shippingCarrier,
  shippingMethodName,
  shippingEstimatedDays,
  address,
  subtotal,
  grandTotal,
}: CheckoutSummaryProps) {
  const shippingLabel = shippingCarrier && shippingMethodName
    ? `${shippingCarrier} — ${shippingMethodName}`
    : shippingCarrier
    ? shippingCarrier
    : shippingCode
    ? `Shipping (${shippingCode})`
    : "Shipping";

  const deliveryEstimate = shippingEstimatedDays
    ? `${shippingEstimatedDays} business days`
    : null;

  return (
    <div className="card-base space-y-4">
      <h2 className="type-section-hed">Order Summary</h2>

      {/* Shipping address confirmation */}
      {address && (
        <div className="border-b border-border-secondary pb-3">
          <p className="type-caption text-text-caption mb-1">Deliver to</p>
          <p className="type-body">
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

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3 type-body">
            <span className="min-w-0 flex-1 break-words">
              {item.name || "Product"} × {item.quantity}
            </span>
            <span className="type-price shrink-0">{formatPLN(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-body">
          <span className="min-w-0 flex-1">Subtotal</span>
          <span className="type-price shrink-0">{formatPLN(subtotal)}</span>
        </div>
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-start justify-between gap-4 type-body">
          <span className="min-w-0 flex-1">
            {shippingLabel}
            {deliveryEstimate && (
              <span className="block type-caption text-text-caption mt-0.5">{deliveryEstimate}</span>
            )}
          </span>
          <span className="type-price shrink-0">{formatPLN(shippingCost)}</span>
        </div>
      </div>

      {/* VAT line */}
      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-body">
          <span className="min-w-0 flex-1">VAT (included)</span>
          <span className="type-price shrink-0">{formatPLN(0)}</span>
        </div>
      </div>

      <div className="border-t border-border-secondary pt-2">
        <div className="flex items-center justify-between gap-4 type-section-hed">
          <span className="min-w-0 flex-1">Total</span>
          <span className="shrink-0">{formatPLN(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
