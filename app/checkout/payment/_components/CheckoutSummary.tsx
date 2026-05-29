interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  shippingCost: number;
  shippingCode?: string;
  shippingCarrier?: string;
  shippingMethodName?: string;
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
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span>
              {item.name || "Product"} × {item.quantity}
            </span>
            <span>{formatPLN(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPLN(subtotal)}</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between text-sm">
          <span>{shippingLabel}</span>
          <span>{formatPLN(shippingCost)}</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPLN(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
