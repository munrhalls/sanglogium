import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { client } from "@/sanity-cms/lib/client";
import groq from "groq";
import PaymentForm from "./PaymentForm.client";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

interface PaymentProduct {
  _id: string;
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

  const ids = session.basket.map((i) => i.productId);

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_sanity_query_start', data: { productIds: ids, quantities: session.basket.map(i => ({ productId: i.productId, quantity: i.quantity })) }, outcome: 'success' });

  const sanityProducts = await client.fetch<PaymentProduct[]>(
    groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount }, stock }`,
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

  const subtotal = session.basket.reduce((sum, item) => {
    const product = sanityProducts.find((p) => p._id === item.productId)!;
    return sum + product.price_data!.unit_amount * item.quantity;
  }, 0);

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

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/checkout/payment-intent-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grandTotal, metadata }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  const { clientSecret } = await response.json();

  return <PaymentForm clientSecret={clientSecret} address={address} traceId={traceId} />;
}
