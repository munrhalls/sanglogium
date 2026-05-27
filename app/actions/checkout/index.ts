"use server";

import { getCheckoutSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";
import { stripe } from "@/lib/stripe";
import type { Address } from "@/app/(store)/checkout/checkout.types";
import { logCheckoutEvent, clearCheckoutEvents, generateCheckoutSessionId } from "@/lib/dev/event-logger";

export async function initCheckoutSession(items: Array<{ productId: string; quantity: number }>, checkoutSessionId?: string) {
  const session = await getCheckoutSession();

  // Use provided checkoutSessionId or generate new one (fallback)
  const finalCheckoutSessionId = checkoutSessionId || generateCheckoutSessionId();
  
  // Blank slate: Clear previous trace for this session
  await clearCheckoutEvents(finalCheckoutSessionId);
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

export async function saveAddress(address: Address) {
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
  const validationResult = await submitShippingAction(address);

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

  // Save validated address to session
  session.address = validationResult.address || address;

  // Cascade invalidation: Delete downstream shipping data
  session.shippingCode = undefined;
  session.shippingCost = undefined;

  await session.save();

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

export async function saveShippingAction(shippingCode: string, priceInCents: number) {
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
    data: { shippingCode, priceInCents },
    outcome: 'success',
  });

  // Save BOTH shippingCode AND shippingCost to session
  session.shippingCode = shippingCode;
  session.shippingCost = priceInCents;

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

export async function initPaymentAction(
  grandTotal: number,
  metadata: Record<string, string>
): Promise<{ clientSecret: string }> {
  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';

  let result: { id: string; client_secret: string | null };

  if (session.paymentIntentId) {
    try {
      result = await stripe.paymentIntents.update(session.paymentIntentId, { amount: grandTotal, metadata });
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update', data: { paymentIntentId: session.paymentIntentId, amount: grandTotal }, outcome: 'success' });
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update_failed', data: { error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
      session.paymentIntentId = undefined;
      result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata });
      session.paymentIntentId = result.id;
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' });
    }
  } else {
    result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata });
    session.paymentIntentId = result.id;
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' });
  }

  if (!result.client_secret) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_no_client_secret', data: { paymentIntentId: result.id }, outcome: 'error' });
    throw new Error('Stripe did not return client_secret');
  }

  await session.save();

  return { clientSecret: result.client_secret };
}
