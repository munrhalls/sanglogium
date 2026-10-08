"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import { logEvent } from "@/platform/utils/eventLogger";

export async function saveShippingAction(
  shippingCode: string,
  priceInCents: number,
  shippingMethodName?: string,
  shippingCarrier?: string,
  shippingEstimatedDays?: number
) {
  const session = await getCheckoutSession();

  // Guard: Ensure basket and address exist
  if (!session.basket || session.basket.length === 0) {
    console.log("[SAVE SHIPPING] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  if (!session.address) {
    console.log("[SAVE SHIPPING] No address in session, redirecting to address");
    redirect("/checkout/address");
  }

  // Get logger (checkoutSessionId should exist from initCheckoutSession)
  const checkoutSessionId = session.checkoutSessionId;
  if (!checkoutSessionId) {
    console.error("[SAVE SHIPPING] No checkoutSessionId in session");
    redirect("/basket");
  }

  await logEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'shipping_selection_start',
    data: { shippingCode },
    outcome: 'success',
  });

  // Validate priceInCents is a positive integer
  if (!Number.isInteger(priceInCents) || priceInCents < 1) {
    await logEvent({
      correlationId: checkoutSessionId,
      slice: 'address-submit',
      event: 'shipping_invalid_price',
      data: { shippingCode, priceInCents },
      outcome: 'error',
    });
    throw new Error("Invalid shipping price");
  }

  await logEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'shipping_option_selected',
    data: { shippingCode, priceInCents, shippingMethodName, shippingCarrier, shippingEstimatedDays },
    outcome: 'success',
  });

  // Save shipping details to session
  session.shippingCode = shippingCode;
  session.shippingCost = priceInCents;
  session.shippingMethodName = shippingMethodName;
  session.shippingCarrier = shippingCarrier;
  session.shippingEstimatedDays = shippingEstimatedDays;

  await session.save();

  await logEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'shipping_saved',
    data: { shippingCode: session.shippingCode, shippingCost: session.shippingCost },
    outcome: 'success',
  });

  // Redirect to payment
  redirect("/checkout/payment");
}
