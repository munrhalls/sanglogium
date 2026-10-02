import { redirect } from 'next/navigation'
import { getCheckoutSession, getOrderByPaymentIntentId, PaymentConfirmed } from '@/features/checkout/server'
import { PaymentVerificationFailed, PaymentDeclined, PaymentCanceled, PaymentProcessing, PaymentUnexpectedStatus } from '@/features/checkout'
import { retrievePaymentIntent } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'

interface SuccessPageSearchParams {
  payment_intent?: string
  status?: 'failed' | 'canceled' | 'processing'
  error?: 'verification_failed'
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SuccessPageSearchParams>
}) {
  const { payment_intent, error } = await searchParams

  // Privacy guard — FIRST, before any Stripe call
  if (!payment_intent) {
    redirect('/basket')
  }

  const session = await getCheckoutSession()
  const traceId = session.checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_enter', data: { paymentIntentId: payment_intent, hasCompletedClaim: session.completedPaymentIntentId === payment_intent, hasLastClaim: session.lastPaymentIntentId === payment_intent }, outcome: 'success' });

  const hasSessionClaim =
    session.completedPaymentIntentId === payment_intent ||
    session.lastPaymentIntentId === payment_intent

  // H-04: if session gate fails, check if a completed order exists in Sanity
  let sanityOrderFallback = false
  if (!hasSessionClaim) {
    const order = await getOrderByPaymentIntentId(payment_intent)
    if (!order) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_denied', data: { paymentIntentId: payment_intent }, outcome: 'error' });
      redirect('/basket')
    }
    sanityOrderFallback = true
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_gate_sanity_fallback', data: { paymentIntentId: payment_intent, orderNumber: order.orderNumber }, outcome: 'success' });
  }

  // Verification-failed path set by Route Handler catch
  if (error === 'verification_failed') {
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_verification_failed', data: { paymentIntentId: payment_intent }, outcome: 'error' });
    return <PaymentVerificationFailed paymentIntentId={payment_intent} />
  }

  // Verify PI status server-side (try/catch — never throw on catch, user already paid)
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>> | null = null
  try {
    pi = await retrievePaymentIntent(payment_intent)
  } catch {
    // Stripe API down — render recoverable error, same as verification_failed branch
    return <PaymentVerificationFailed paymentIntentId={payment_intent} />
  }

  // Succeeded branch
  if (pi.status === 'succeeded') {
    await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_succeeded', data: { paymentIntentId: payment_intent, amount: pi.amount, sanityFallback: sanityOrderFallback }, outcome: 'success' });
    return <PaymentConfirmed paymentIntentId={pi.id} amount={pi.amount} latestCharge={pi.latest_charge} />
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'success-page', event: 'success_page_status', data: { paymentIntentId: payment_intent, status: pi.status }, outcome: 'error' });

  // Failed branch
  if (pi.status === 'requires_payment_method') {
    const declineMessage =
      (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ??
      'Payment was declined.'
    return <PaymentDeclined message={declineMessage} />
  }

  // Canceled branch
  if (pi.status === 'canceled') {
    return <PaymentCanceled />
  }

  // Processing branch
  if (pi.status === 'processing') {
    return <PaymentProcessing paymentIntentId={payment_intent} />
  }

  // Unexpected status — shouldn't reach here (Route Handler handles it), but safety net
  return <PaymentUnexpectedStatus paymentIntentId={payment_intent} />
}
