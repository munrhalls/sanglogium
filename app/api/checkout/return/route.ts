import { redirect } from "next/navigation";
import { getCheckoutSession } from "@/lib/session";
import { retrievePaymentIntent } from "@/lib/stripe";
import { logCheckoutEvent } from "@/lib/dev/event-logger";
import { createOrderFromPaymentIntent, type OrderSessionData } from "@/lib/checkout/createOrderFromPaymentIntent";
import { getSession } from "@/lib/auth/dal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get("payment_intent");

  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';

  const authSession = await getSession();

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_start', data: { hasPaymentIntent: !!payment_intent }, outcome: 'success' });

  if (!payment_intent) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_missing_intent', data: {}, outcome: 'error' });
    redirect("/basket?error=missing_intent");
  }

  // M-1: Guard against arbitrary PI retrieval — session must know this intent
  if (!session.paymentIntentId && !session.completedPaymentIntentId) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_no_active_intent', data: { urlPaymentIntent: payment_intent }, outcome: 'error' });
    redirect("/basket?error=no_active_intent");
  }

  if (session.paymentIntentId && session.paymentIntentId !== payment_intent) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_intent_mismatch', data: { sessionPaymentIntentId: session.paymentIntentId, urlPaymentIntent: payment_intent }, outcome: 'error' });
    redirect("/basket?error=intent_mismatch");
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[RETURN HANDLER] payment_intent extracted:", payment_intent);
    console.log(
      "[RETURN HANDLER] payment_intent_client_secret and redirect_status read but ignored"
    );
  }

  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>>;
  try {
    pi = await retrievePaymentIntent(payment_intent);
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_pi_retrieved', data: { paymentIntentId: payment_intent, status: pi.status, amount: pi.amount }, outcome: 'success' });
    if (process.env.NODE_ENV !== "production") {
      console.log("[RETURN HANDLER] PI retrieved — status:", pi.status, "amount:", pi.amount);
    }
  } catch (err) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_pi_retrieve_failed', data: { paymentIntentId: payment_intent, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
    // H-01: never set completedPaymentIntentId on failure paths
    session.lastPaymentIntentId = payment_intent;
    await session.save();
    redirect(
      `/checkout/success?payment_intent=${payment_intent}&error=verification_failed`
    );
  }

  // H-01: lastPaymentIntentId is set for ANY PI the handler processes,
  // but completedPaymentIntentId is ONLY set on succeeded
  session.lastPaymentIntentId = pi.id;

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_lifecycle_start', data: { paymentIntentId: pi.id, status: pi.status }, outcome: 'success' });

  // Capture session data before clearing — needed for concurrent order creation on succeeded path
  const capturedSessionData: OrderSessionData | null = pi.status === 'succeeded' ? {
    basket: session.basket ?? [],
    address: session.address,
    shippingCode: session.shippingCode,
    shippingCost: session.shippingCost,
    shippingMethodName: session.shippingMethodName,
    shippingCarrier: session.shippingCarrier,
    shippingEstimatedDays: session.shippingEstimatedDays,
    email: session.email,
    checkoutSessionId: session.checkoutSessionId,
    userId: authSession?.userId,
  } : null;

  // Step 2: partial-clear per canonical lifecycle table
  // C-01: webhook is the authoritative fulfillment path; return handler only does cleanup + routing
  switch (pi.status) {
    case "succeeded":
      session.completedPaymentIntentId = pi.id;
      session.paymentIntentId = undefined;
      session.basket = [];
      session.address = undefined;
      session.shippingCode = undefined;
      session.shippingCost = undefined;

      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_cleared_succeeded', data: {}, outcome: 'success' });
      break;

    case "requires_payment_method":
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_failed', data: {}, outcome: 'error' });
      break;

    case "canceled":
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_canceled', data: {}, outcome: 'error' });
      break;

    case "processing":
      // KEEP everything — async confirmation may still resolve
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_kept_processing', data: {}, outcome: 'success' });
      break;

    default:
      session.paymentIntentId = undefined;
      // KEEP basket, address, shippingCode, shippingCost
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_partial_cleared_unknown', data: { status: pi.status }, outcome: 'error' });
      await session.save();
      redirect(`/basket?error=unexpected_status`);
  }

  // Step 3: persist session
  await session.save();

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_saved', data: { status: pi.status }, outcome: 'success' });

  // Step 3b: on succeeded path, create order synchronously before redirect
  // Idempotent — createOrderFromPaymentIntent skips if order already exists (webhook may also fire).
  // Non-fatal: wrapped in try/catch so a Sanity error never blocks the user redirect.
  if (pi.status === 'succeeded' && capturedSessionData) {
    try {
      await createOrderFromPaymentIntent(pi, capturedSessionData);
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_order_created', data: { paymentIntentId: pi.id }, outcome: 'success' });
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_order_create_failed', data: { paymentIntentId: pi.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
    }
  }

  // Step 4: redirect to success page with appropriate status hint
  const redirectTarget = (() => {
    switch (pi.status) {
      case "succeeded":
        return `/checkout/success?payment_intent=${pi.id}`;
      case "requires_payment_method":
        return `/checkout/success?payment_intent=${pi.id}&status=failed`;
      case "canceled":
        return `/checkout/success?payment_intent=${pi.id}&status=canceled`;
      case "processing":
        return `/checkout/success?payment_intent=${pi.id}&status=processing`;
      default:
        return `/basket?error=unexpected_status`;
    }
  })();

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_redirect', data: { status: pi.status, redirectTarget }, outcome: 'success' });

  redirect(redirectTarget);
}
