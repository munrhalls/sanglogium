import { redirect } from "next/navigation";
import { getCheckoutSession } from "@/lib/session";
import { retrievePaymentIntent } from "@/lib/stripe";
import { logCheckoutEvent } from "@/lib/dev/event-logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get("payment_intent");

  const session = await getCheckoutSession();
  const traceId = session.checkoutSessionId || 'unknown';

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_start', data: { hasPaymentIntent: !!payment_intent }, outcome: 'success' });

  if (!payment_intent) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_missing_intent', data: {}, outcome: 'error' });
    redirect("/basket?error=missing_intent");
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
    redirect(
      `/checkout/success?payment_intent=${payment_intent}&error=verification_failed`
    );
  }

  // Step 1: set completedPaymentIntentId ALWAYS, regardless of status
  session.completedPaymentIntentId = pi.id;

  await logCheckoutEvent({ correlationId: traceId, slice: 'payment-submit', event: 'return_handler_session_lifecycle_start', data: { paymentIntentId: pi.id, status: pi.status }, outcome: 'success' });

  // Step 2: partial-clear per canonical lifecycle table
  switch (pi.status) {
    case "succeeded":
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
