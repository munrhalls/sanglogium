"use server";

import { getCheckoutSession } from "@/features/checkout/server";
import { redirect } from "next/navigation";
import type { Address } from "@/features/address";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/features/checkout/core/rules/checkoutEvents";
import { checkAddress } from "@/features/address/server";

export async function saveAddressAction(
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

  // Check the address (TERYT registry; Google only when ADDRESS_VERIFY_MODE=google)
  const validationResult = await checkAddress(address, opts);
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
