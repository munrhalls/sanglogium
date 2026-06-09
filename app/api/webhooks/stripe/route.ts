import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createOrderFromPaymentIntent } from '@/lib/checkout/createOrderFromPaymentIntent'
import { logCheckoutEvent } from '@/lib/dev/event-logger'

// Stripe requires the raw request body for signature verification —
// Next.js App Router does NOT automatically parse it, so we read it as text.
export const runtime = 'nodejs'

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const paymentIntentId = pi.id
  const traceId = pi.metadata?.checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_start', data: { paymentIntentId }, outcome: 'success' });

  try {
    await createOrderFromPaymentIntent(pi)
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_complete', data: { paymentIntentId }, outcome: 'success' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId, error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${paymentIntentId}:`, message)
    throw err
  }
}

export async function POST(request: NextRequest) {
  await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_post_start', data: {}, outcome: 'success' });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_secret', data: {}, outcome: 'error' });
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_signature', data: {}, outcome: 'error' });
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // Read raw body — required for signature verification
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_signature_failed', data: { error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Signature verification failed: ${message}`)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
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
      await handlePaymentIntentSucceeded(pi)
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId: pi.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
      console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${pi.id}:`, err)
      // Return 500 so Stripe retries delivery
      return NextResponse.json({ error: 'Order processing failed' }, { status: 500 })
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
  return NextResponse.json({ received: true })
}
