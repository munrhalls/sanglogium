"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/features/checkout/core/rules/checkoutEvents";

export async function initCheckoutSessionAction(items: Array<{ productId: string; quantity: number }>, checkoutSessionId?: string) {
  const session = await getCheckoutSession();

  // Use provided checkoutSessionId or generate new one (fallback)
  const finalCheckoutSessionId = checkoutSessionId || generateCheckoutSessionId();

  session.checkoutSessionId = finalCheckoutSessionId;

  // Save items directly to the secure iron-session cookie
  session.basket = items;
  await session.save();

  await logCheckoutEvent({
    correlationId: finalCheckoutSessionId,
    slice: 'basket-address',
    event: 'checkout_init',
    data: { itemCount: items.length, items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) },
    outcome: 'success',
  });

  // Transition to the next page
  redirect("/checkout/address");
}
