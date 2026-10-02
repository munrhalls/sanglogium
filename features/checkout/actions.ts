"use server";

import { getCheckoutSession } from "./adapters/session";
import { redirect } from "next/navigation";
import type { Address, ServerResponse } from "./domain/checkoutTypes";
import { logCheckoutEvent, generateCheckoutSessionId } from "@/lib/dev/event-logger";
import { verifyPolishAddress } from "./adapters/terytValidator";
import { validateWithGoogle } from "./adapters/googleAddressValidator";

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


// Normalize region-code aliases on both sides of the validation round-trip.
// The customer-facing code may be "UK" but the frozen Google path's ISO
// 3166-1 alpha-2 code is "GB" — kept here since it is needed on the active
// dispatch path regardless of which verifier ultimately runs.
const normalizeRegionCode = (code?: string | null): string | undefined => {
  if (!code) return undefined;
  return code === "UK" ? "GB" : code;
};

// ACTIVE verifier — GUS TERYT (official registry, free, no key). The Google
// path is FROZEN and only reachable via ADDRESS_VERIFY_MODE=google (see
// googleAddressValidator.ts).
async function validateWithTeryt(
  input: Address,
  normalizedRegion: string,
): Promise<ServerResponse> {
  const t = await verifyPolishAddress({
    street: input.street,
    streetNumber: input.streetNumber,
    postalCode: input.postalCode,
    city: input.city,
  });

  // GUS down → never block checkout; accept as entered (region-gated).
  if (t.degraded) {
    console.warn(`[TERYT] Degraded (${t.reason}) — accepting address as entered.`);
    return { status: "ACCEPT", address: { ...input, regionCode: normalizedRegion } };
  }

  if (!t.valid) {
    console.warn(`[TERYT] Rejected — ${t.reason}`);
    return {
      status: "FIX",
      errors: {
        message:
          "We could not match this address to the official Polish address registry (TERYT). Please verify your street, city and postal code.",
      },
    };
  }

  console.log(`[TERYT] ACCEPT — ${t.streetName ?? input.street}, ${input.city}`);
  return { status: "ACCEPT", address: { ...input, regionCode: normalizedRegion } };
}

export async function submitShippingAction(
  input: Address,
  opts?: { skipValidation?: boolean },
): Promise<ServerResponse> {
  const normalizedInput =
    normalizeRegionCode(input.regionCode) ?? input.regionCode;

  // Accept the address exactly as entered (region normalized). Used by the
  // human escape hatch and by graceful degradation when Google is unavailable
  // (e.g. closed billing account) so checkout can never dead-end on Google.
  const acceptAsEntered = (): ServerResponse => {
    return {
      status: "ACCEPT",
      address: { ...input, regionCode: normalizedInput },
    };
  };

  // Human escape hatch: accept the address exactly as the customer entered it,
  // bypassing Google validation. Prevents a valid submission from dead-ending
  // on a strict Google verdict.
  if (opts?.skipValidation) {
    return acceptAsEntered();
  }

  // ACTIVE verifier: TERYT (official GUS registry, free). Runs for all PL
  // submissions; the store ships within Poland only, so other regions are
  // simply accepted as entered (region-gated).
  const verifyMode = process.env.ADDRESS_VERIFY_MODE ?? "teryt";
  if (verifyMode !== "google") {
    if (normalizedInput === "PL") {
      return validateWithTeryt(input, normalizedInput);
    }
    return acceptAsEntered();
  }

  // FROZEN path — see googleAddressValidator.ts.
  return validateWithGoogle(input, normalizedInput, acceptAsEntered);
}
