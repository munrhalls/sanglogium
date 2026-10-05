import "server-only";
import type Stripe from "stripe";
import type { Orders, Payments, OrderEmails } from "@/features/checkout/core/ports";
import { logCheckoutEvent } from "@/platform/utils/eventLogger";
import { placeOrderFromPaymentIntent } from "./placeOrderFromPaymentIntent";

export type WebhookResult = { status: number; body: { error?: string; received?: boolean } };

async function handlePaymentIntentSucceeded(
  ports: { orders: Orders; emails: OrderEmails },
  pi: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = pi.id
  const traceId = pi.metadata?.checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_start', data: { paymentIntentId }, outcome: 'success' });

  try {
    await placeOrderFromPaymentIntent({ orders: ports.orders, emails: ports.emails }, { pi })
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_complete', data: { paymentIntentId }, outcome: 'success' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId, error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${paymentIntentId}:`, message)
    throw err
  }
}

export async function handleStripeWebhook(
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

  let event: Stripe.Event
  try {
    event = ports.payments.constructWebhookEvent(input.rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_signature_failed', data: { error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Signature verification failed: ${message}`)
    return { status: 400, body: { error: `Webhook signature verification failed: ${message}` } }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WEBHOOK] Received event: ${event.type} (${event.id})`)
  }

  // Extract traceId from event data if available
  const traceId = (event.data.object as any)?.metadata?.checkoutSessionId || 'unknown';

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_event_received', data: { eventType: event.type, eventId: event.id }, outcome: 'success' });

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await handlePaymentIntentSucceeded(ports, pi)
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId: pi.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
      console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${pi.id}:`, err)
      // Return 500 so Stripe retries delivery
      return { status: 500, body: { error: 'Order processing failed' } }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const failureMessage = (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ?? 'unknown'
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_failed', data: { paymentIntentId: pi.id, failureMessage }, outcome: 'error' });
    console.error(`[WEBHOOK] payment_intent.payment_failed — PI: ${pi.id} — reason: ${failureMessage}`)
  } else if (event.type === 'payment_intent.canceled') {
    const pi = event.data.object as Stripe.PaymentIntent
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_canceled', data: { paymentIntentId: pi.id }, outcome: 'error' });
    console.error(`[WEBHOOK] payment_intent.canceled — PI: ${pi.id}`)
  }

  // Acknowledge all event types with 200 (Stripe expects 2xx for all events it delivers)
  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_post_complete', data: { eventType: event.type }, outcome: 'success' });
  return { status: 200, body: { received: true } }
}
