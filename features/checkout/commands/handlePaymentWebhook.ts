import "server-only";
import type { Orders, Payments, OrderEmails } from "@/features/checkout/core/ports";
import type { PaymentEvent, PaymentSnapshot } from "@/features/checkout/core/rules/checkoutTypes";
import { logCheckoutEvent } from "@/features/checkout/core/rules/checkoutEvents";
import { placeOrderFromPayment } from "./placeOrderFromPayment";

export type WebhookResult = { status: number; body: { error?: string; received?: boolean } };

async function handlePaymentSucceeded(
  ports: { orders: Orders; emails: OrderEmails },
  payment: PaymentSnapshot
): Promise<void> {
  const paymentIntentId = payment.id
  const traceId = payment.metadata.checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_start', data: { paymentIntentId }, outcome: 'success' });

  try {
    await placeOrderFromPayment({ orders: ports.orders, emails: ports.emails }, { payment })
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_complete', data: { paymentIntentId }, outcome: 'success' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId, error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${paymentIntentId}:`, message)
    throw err
  }
}

export async function handlePaymentWebhook(
  ports: { orders: Orders; payments: Payments; emails: OrderEmails },
  input: { rawBody: string; signature: string | null }
): Promise<WebhookResult> {
  await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_post_start', data: {}, outcome: 'success' });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_secret', data: {}, outcome: 'error' });
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set')
    return { status: 500, body: { error: 'Webhook secret not configured' } }
  }

  const sig = input.signature
  if (!sig) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_signature', data: {}, outcome: 'error' });
    return { status: 400, body: { error: 'Missing stripe-signature header' } }
  }

  let event: PaymentEvent
  try {
    event = ports.payments.parseWebhookEvent(input.rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_signature_failed', data: { error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Signature verification failed: ${message}`)
    return { status: 400, body: { error: `Webhook signature verification failed: ${message}` } }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WEBHOOK] Received event: ${event.rawType} (${event.id})`)
  }

  // Extract traceId from event data if available
  const traceId = event.payment?.metadata.checkoutSessionId || 'unknown';

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_event_received', data: { eventType: event.rawType, eventId: event.id }, outcome: 'success' });

  if (event.kind === 'succeeded' && event.payment) {
    const payment = event.payment
    try {
      await handlePaymentSucceeded(ports, payment)
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId: payment.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
      console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${payment.id}:`, err)
      // Return 500 so Stripe retries delivery
      return { status: 500, body: { error: 'Order processing failed' } }
    }
  } else if (event.kind === 'failed' && event.payment) {
    const payment = event.payment
    const failureMessage = payment.failureMessage ?? 'unknown'
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_failed', data: { paymentIntentId: payment.id, failureMessage }, outcome: 'error' });
    console.error(`[WEBHOOK] payment_intent.payment_failed — PI: ${payment.id} — reason: ${failureMessage}`)
  } else if (event.kind === 'canceled' && event.payment) {
    const payment = event.payment
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_canceled', data: { paymentIntentId: payment.id }, outcome: 'error' });
    console.error(`[WEBHOOK] payment_intent.canceled — PI: ${payment.id}`)
  }

  // Acknowledge all event types with 200 (Stripe expects 2xx for all events it delivers)
  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_post_complete', data: { eventType: event.rawType }, outcome: 'success' });
  return { status: 200, body: { received: true } }
}
