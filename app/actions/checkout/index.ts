"use server";

import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";
import type { Address } from "@/app/checkout/checkout.types";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/lib/dev/event-logger";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }>, checkoutSessionId?: string) {
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

export async function saveAddress(
  address: Address,
  opts?: { skipValidation?: boolean }
) {
  const session = await getCheckoutSession();

  // Guard: Ensure basket exists
  if (!session.basket || session.basket.length === 0) {
    console.log("[SAVE ADDRESS] No basket in session, redirecting to basket");
    redirect("/basket");
  }

  // Get or create logger (use existing checkoutSessionId if present)
  const checkoutSessionId = session.checkoutSessionId || generateCheckoutSessionId();
  session.checkoutSessionId = checkoutSessionId;

  await logCheckoutEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'address_submit_start',
    data: { address: { city: address.city, postalCode: address.postalCode } },
    outcome: 'success',
  });

  // Call Google Address Validation
  const validationResult = await submitShippingAction(address, opts);
  console.log("[SAVE ADDRESS] validationResult.status:", validationResult.status);
  console.log("[SAVE ADDRESS] validationResult.address:", validationResult.address);

  await logCheckoutEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'address_validation_result',
    data: { status: validationResult.status },
    outcome: validationResult.status === 'ACCEPT' ? 'success' : 'error',
  });

  // Only proceed if validation succeeds
  if (validationResult.status !== "ACCEPT") {
    await logCheckoutEvent({
      correlationId: checkoutSessionId,
      slice: 'address-submit',
      event: 'address_validation_failed',
      data: { errors: validationResult.errors },
      outcome: 'error',
    });
    return validationResult;
  }

  // Save validated address to session, preserving contact info from the original input
  session.address = {
    ...address,
    ...(validationResult.address || {}),
    geocode: validationResult.geocode,
    placeId: validationResult.placeId,
  };
  console.log("[SAVE ADDRESS] About to save session.address:", session.address);

  // Cascade invalidation: Delete downstream shipping data
  session.shippingCode = undefined;
  session.shippingCost = undefined;
  session.shippingMethodName = undefined;
  session.shippingCarrier = undefined;
  session.shippingEstimatedDays = undefined;

  await session.save();
  console.log("[SAVE ADDRESS] Session saved. session.address after save:", session.address);

  await logCheckoutEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'address_saved',
    data: { hasAddress: !!session.address, basketItemCount: session.basket.length },
    outcome: 'success',
  });

  // Redirect to shipping page
  redirect("/checkout/shipping");
}

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

  await logCheckoutEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'shipping_selection_start',
    data: { shippingCode },
    outcome: 'success',
  });

  // Validate priceInCents is a positive integer
  if (!Number.isInteger(priceInCents) || priceInCents < 1) {
    await logCheckoutEvent({
      correlationId: checkoutSessionId,
      slice: 'address-submit',
      event: 'shipping_invalid_price',
      data: { shippingCode, priceInCents },
      outcome: 'error',
    });
    throw new Error("Invalid shipping price");
  }

  await logCheckoutEvent({
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

  await logCheckoutEvent({
    correlationId: checkoutSessionId,
    slice: 'address-submit',
    event: 'shipping_saved',
    data: { shippingCode: session.shippingCode, shippingCost: session.shippingCost },
    outcome: 'success',
  });

  // Redirect to payment
  redirect("/checkout/payment");
}

export async function saveEmailToSession(email: string) {
  "use server";
  const session = await getCheckoutSession();
  session.email = email;
  await session.save();
}

