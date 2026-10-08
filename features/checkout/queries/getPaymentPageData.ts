import "server-only";
import { redirect } from "next/navigation";
import type {
  CheckoutSessions,
  CheckoutCatalog,
} from "@/features/checkout/core/ports";
import type { CheckoutSession } from "@/features/checkout/core/types/checkoutTypes";
import { buildPaymentLineItems, computePaymentTotals } from "@/features/checkout/core/rules/paymentSummary";
import type { PaymentLineItem } from "@/features/checkout/core/rules/paymentSummary";
import { dedupeShippingLabel } from "@/features/shipping";
import { logCheckoutEvent } from "@/features/checkout/core/rules/checkoutEvents";

export type PaymentPageData = {
  items: PaymentLineItem[];
  subtotal: number;
  grandTotal: number;
  vatAmount: number;
  shippingCost: number;
  shippingEstimatedDays?: number;
  shippingLabel: string;
  address: NonNullable<CheckoutSession["address"]>;
  metadata: Record<string, string>;
  traceId: string;
};

export async function getPaymentPageData(ports: {
  sessions: CheckoutSessions;
  catalogue: CheckoutCatalog;
}): Promise<PaymentPageData> {
  const session = await ports.sessions.getCheckoutSession();
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

  const sanityProducts = await ports.catalogue.getPaymentProducts(ids);

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

  const items = buildPaymentLineItems(session.basket, sanityProducts);
  const { subtotal, grandTotal, vatAmount } = computePaymentTotals(items, session.shippingCost);

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_calculation', data: { subtotal, shippingCost: session.shippingCost, grandTotal, vatAmount }, outcome: 'success' });

  if (grandTotal < 1) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_invalid_total', data: { subtotal, shippingCost: session.shippingCost, grandTotal }, outcome: 'error' });
    redirect("/basket?error=invalid_total");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[PAYMENT PAGE] subtotal:", subtotal, "grandTotal:", grandTotal);
  }

  const address = session.address!;
  const shippingLabel = dedupeShippingLabel(session.shippingCarrier, session.shippingMethodName);

  const metadata: Record<string, string> = {
    regionCode: address.regionCode,
    postalCode: address.postalCode,
    street: address.street,
    streetNumber: address.streetNumber,
    city: address.city,
    email: session.email ?? "",
    ...(checkoutSessionId && { checkoutSessionId }),
  };

  return {
    items,
    subtotal,
    grandTotal,
    vatAmount,
    shippingCost: session.shippingCost,
    shippingEstimatedDays: session.shippingEstimatedDays,
    shippingLabel,
    address,
    metadata,
    traceId,
  };
}
