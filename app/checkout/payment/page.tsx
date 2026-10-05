import Link from "next/link";
import { getPaymentPageData } from "@/features/checkout/server";
import { CheckoutSummary, CheckoutStepper, PaymentForm } from "@/features/checkout";

export default async function Page() {
  const {
    items,
    subtotal,
    grandTotal,
    vatAmount,
    shippingCost,
    shippingEstimatedDays,
    shippingLabel,
    address,
    metadata,
    traceId,
  } = await getPaymentPageData();

  return (
    <div className="space-y-6">
      <CheckoutStepper currentStep={3} />

      <div className="grid gap-8 grid-cols-1 items-start lg-touch:grid-cols-2 lg-desktop:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <CheckoutSummary
            items={items}
            shippingCost={shippingCost}
            shippingLabel={shippingLabel}
            shippingEstimatedDays={shippingEstimatedDays}
            address={address}
            subtotal={subtotal}
            grandTotal={grandTotal}
            vatAmount={vatAmount}
          />
          {/* Back navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/checkout/shipping"
              className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to shipping
            </Link>
            <Link
              href="/basket"
              className="flex items-center gap-1 min-h-[44px] type-caption text-text-secondary hover:text-text-body transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Edit basket
            </Link>
          </div>
        </div>
        <div className="min-w-0">
          <PaymentForm grandTotal={grandTotal} metadata={metadata} address={address} traceId={traceId} />
        </div>
      </div>
    </div>
  );
}
