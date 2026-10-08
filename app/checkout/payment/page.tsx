import { getPaymentPageData } from "@/features/checkout/server";
import { CheckoutSummary, CheckoutStepper, PaymentForm, PaymentNav } from "@/features/checkout";

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
          <PaymentNav />
        </div>
        <div className="min-w-0">
          <PaymentForm grandTotal={grandTotal} metadata={metadata} address={address} traceId={traceId} />
        </div>
      </div>
    </div>
  );
}
