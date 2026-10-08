import { redirect } from "next/navigation";
import type {
  CheckoutSessions,
  Orders,
  Payments,
} from "@/features/checkout/core/ports";
import type { PaymentMethodDetails } from "@/features/order";
import type { PaymentSnapshot } from "@/features/checkout/core/types/checkoutTypes";
import { logEvent } from "@/platform/utils/eventLogger";

type SuccessPageResult =
  | { kind: "verificationFailed"; paymentIntentId: string }
  | {
      kind: "succeeded";
      paymentIntentId: string;
      amount: number;
      paymentMethod: PaymentMethodDetails | null;
    }
  | { kind: "declined"; message: string }
  | { kind: "canceled" }
  | { kind: "processing"; paymentIntentId: string }
  | { kind: "unexpected"; paymentIntentId: string };

export async function getSuccessPageResult(
  ports: { sessions: CheckoutSessions; orders: Orders; payments: Payments },
  input: { paymentIntent?: string; errorParam?: string }
): Promise<SuccessPageResult> {
  const { paymentIntent: payment_intent, errorParam: error } = input;

  // Privacy guard — FIRST, before any Stripe call
  if (!payment_intent) {
    redirect('/basket')
  }

  const session = await ports.sessions.getCheckoutSession()
  const traceId = session.checkoutSessionId || 'unknown'

  await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_enter', data: { paymentIntentId: payment_intent, hasCompletedClaim: session.completedPaymentIntentId === payment_intent, hasLastClaim: session.lastPaymentIntentId === payment_intent }, outcome: 'success' });

  const hasSessionClaim =
    session.completedPaymentIntentId === payment_intent ||
    session.lastPaymentIntentId === payment_intent

  // H-04: if session gate fails, check if a completed order exists in Sanity
  let sanityOrderFallback = false
  if (!hasSessionClaim) {
    const order = await ports.orders.getOrderByPaymentIntentId(payment_intent)
    if (!order) {
      await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_denied', data: { paymentIntentId: payment_intent }, outcome: 'error' });
      redirect('/basket')
    }
    sanityOrderFallback = true
    await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_sanity_fallback', data: { paymentIntentId: payment_intent, orderNumber: order.orderNumber }, outcome: 'success' });
  }

  // Verification-failed path set by Route Handler catch
  if (error === 'verification_failed') {
    await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_verification_failed', data: { paymentIntentId: payment_intent }, outcome: 'error' });
    return { kind: 'verificationFailed', paymentIntentId: payment_intent }
  }

  // Verify PI status server-side (try/catch — never throw on catch, user already paid)
  let payment: PaymentSnapshot | null = null
  try {
    payment = await ports.payments.retrievePayment(payment_intent)
  } catch {
    // Stripe API down — render recoverable error, same as verification_failed branch
    return { kind: 'verificationFailed', paymentIntentId: payment_intent }
  }

  // Succeeded branch
  if (payment.status === 'succeeded') {
    await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_succeeded', data: { paymentIntentId: payment_intent, amount: payment.amount, sanityFallback: sanityOrderFallback }, outcome: 'success' });
    return { kind: 'succeeded', paymentIntentId: payment.id, amount: payment.amount, paymentMethod: payment.paymentMethod }
  }

  await logEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_status', data: { paymentIntentId: payment_intent, status: payment.status }, outcome: 'error' });

  // Failed branch
  if (payment.status === 'requires_payment_method') {
    return { kind: 'declined', message: payment.failureMessage ?? 'Payment was declined.' }
  }

  // Canceled branch
  if (payment.status === 'canceled') {
    return { kind: 'canceled' }
  }

  // Processing branch
  if (payment.status === 'processing') {
    return { kind: 'processing', paymentIntentId: payment_intent }
  }

  // Unexpected status — shouldn't reach here (Route Handler handles it), but safety net
  return { kind: 'unexpected', paymentIntentId: payment_intent }
}
