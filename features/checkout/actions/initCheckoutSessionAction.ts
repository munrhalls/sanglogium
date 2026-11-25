"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/platform/utils/eventLogger";
import { generateCheckoutSessionId } from "@/features/checkout/core/rules/checkoutSessionId";

export async function initCheckoutSessionAction(items: Array<{ productId: string; quantity: number }>, checkoutSessionId?: string) {
  const session = await getCheckoutSession();

  // Use provided checkoutSessionId or generate new one (fallback)
  const finalCheckoutSessionId = checkoutSessionId || generateCheckoutSessionId();

  session.checkoutSessionId = finalCheckoutSessionId;

  const previous = new Map<string, number>();
  for (const item of session.basket ?? []) {
    previous.set(item.productId, (previous.get(item.productId) ?? 0) + item.quantity);
  }
  for (const item of items) {
    previous.set(item.productId, (previous.get(item.productId) ?? 0) - item.quantity);
  }
  let sameGoods = true;
  for (const quantity of previous.values()) {
    if (quantity !== 0) sameGoods = false;
  }
  if (!sameGoods) {
    session.shippingCode = undefined;
    session.shippingCost = undefined;
    session.shippingMethodName = undefined;
    session.shippingCarrier = undefined;
    session.shippingEstimatedDays = undefined;
    session.shippingOffers = undefined;
  }

  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();

  await logEvent({
    correlationId: finalCheckoutSessionId,
    slice: 'basket-address',
    event: 'checkout_init',
    data: { itemCount: items.length, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) },
    outcome: 'success',
  });

  // Transition to the next page
  redirect("/checkout/address");
}
