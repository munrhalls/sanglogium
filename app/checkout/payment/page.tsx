import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";
import PaymentForm from "./PaymentForm.client";
import CheckoutSummary from "./_components/CheckoutSummary";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

interface PaymentProduct {
  _id: string;
  name: string | null;
  price_data: { unit_amount: number } | null;
  stock: number | null;
}

export default async function Page() {
  const session = await getCheckoutSession();
  const checkoutSessionId = session.checkoutSessionId;
  const traceId = checkoutSessionId || 'unknown';

  // Log payment page load
  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_page_load', data: { hasBasket: !!session.basket?.length, hasAddress: !!session.address, hasShippingCost: session.shippingCost !== undefined && session.shippingCost !== null }, outcome: 'success' });

  if (!session.basket?.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_basket_empty', data: {}, outcome: 'error' });
    redirect("/basket");
  }

  if (session.basket.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1)) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_invalid_quantity', data: { basket: session.basket }, outcome: 'error' });
    redirect("/basket?error=invalid_basket");
  }

  if (!session.address) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_no_address', data: {}, outcome: 'error' });
    redirect("/checkout/address");
  }

  if (session.shippingCost === undefined || session.shippingCost === null) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_no_shipping_cost', data: {}, outcome: 'error' });
    redirect("/checkout/shipping");
  }

  // Quantity sanity check — prevent unreasonably high orders
  const MAX_QUANTITY_PER_ITEM = 10;
  for (const item of session.basket) {
    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_guard_excessive_quantity', data: { productId: item.productId, quantity: item.quantity, max: MAX_QUANTITY_PER_ITEM }, outcome: 'error' });
      redirect(`/basket?error=excessive_quantity&id=${item.productId}`);
    }
  }

  const ids = session.basket.map((i) => i.productId);

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_sanity_query_start', data: { productIds: ids, quantities: session.basket.map(i => ({ productId: i.productId, quantity: i.quantity })) }, outcome: 'success' });

  const sanityProducts = await client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, name, price_data { unit_amount }, stock }`,
    { ids }
  );

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_sanity_query_complete', data: { productCount: sanityProducts.length, expectedCount: session.basket.length }, outcome: 'success' });

  if (sanityProducts.length !== session.basket.length) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_product_mismatch', data: { expected: session.basket.length, received: sanityProducts.length }, outcome: 'error' });
    throw new Error("Product mismatch — basket contains unknown product IDs");
  }

  for (const product of sanityProducts) {
    if (!Number.isFinite(product.price_data?.unit_amount)) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_price', data: { productId: product._id }, outcome: 'error' });
      throw new Error(`Product ${product._id} has invalid price`);
    }
    if (product.stock === 0) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_out_of_stock', data: { productId: product._id }, outcome: 'error' });
      redirect(`/basket?error=out_of_stock&id=${product._id}`);
    }
  }

  const items = session.basket.map((item) => {
    const product = sanityProducts.find((p) => p._id === item.productId)!;
    const unitPrice = product.price_data!.unit_amount;
    return {
      productId: item.productId,
      name: product.name ?? "Product",
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = Math.round(subtotal + (session.shippingCost as number));

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_calculation', data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'success' });

  if (grandTotal < 1) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_total', data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'error' });
    redirect("/basket?error=invalid_total");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[PAYMENT PAGE] subtotal:", subtotal, "grandTotal:", grandTotal);
  }

  const address = session.address!;

  const metadata: Record<string, string> = {
    regionCode: address.regionCode,
    postalCode: address.postalCode,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    email: session.email ?? "",
    ...(checkoutSessionId && { checkoutSessionId }),
  };

  return (
    <div className="space-y-6">
      {/* Checkout progress stepper */}
      <nav aria-label="Checkout progress" className="flex items-center justify-center gap-2 type-caption text-text-caption">
        <Link href="/basket" className="hover:text-text-body transition-colors">Basket</Link>
        <span className="text-border-primary">→</span>
        <Link href="/checkout/address" className="hover:text-text-body transition-colors">Address</Link>
        <span className="text-border-primary">→</span>
        <Link href="/checkout/shipping" className="hover:text-text-body transition-colors">Shipping</Link>
        <span className="text-border-primary">→</span>
        <span className="text-text-body font-medium">Payment</span>
      </nav>

      <div className="grid gap-8 grid-cols-1 lg-touch:grid-cols-2 lg-desktop:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <CheckoutSummary
            items={items}
            shippingCost={session.shippingCost as number}
            shippingCode={session.shippingCode}
            shippingCarrier={session.shippingCarrier}
            shippingMethodName={session.shippingMethodName}
            shippingEstimatedDays={session.shippingEstimatedDays}
            address={session.address}
            subtotal={subtotal}
            grandTotal={grandTotal}
          />
          {/* Back navigation */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/checkout/shipping"
              className="inline-flex items-center gap-1 type-caption text-text-caption hover:text-text-body transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to shipping
            </Link>
            <Link
              href="/basket"
              className="inline-flex items-center gap-1 type-caption text-text-caption hover:text-text-body transition-colors"
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
