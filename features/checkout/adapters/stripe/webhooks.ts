import "server-only";
import Stripe from 'stripe'
import { stripe, toPaymentSnapshot } from './client'
import type { PaymentEvent } from '@/features/checkout/core/rules/checkoutTypes'

export function parseWebhookEvent(
  rawBody: string,
  signature: string,
  secret: string
): PaymentEvent {
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  const kind =
    event.type === 'payment_intent.succeeded'
      ? 'succeeded'
      : event.type === 'payment_intent.payment_failed'
        ? 'failed'
        : event.type === 'payment_intent.canceled'
          ? 'canceled'
          : 'other'
  const payment = event.type.startsWith('payment_intent.')
    ? toPaymentSnapshot(event.data.object as Stripe.PaymentIntent)
    : null
  return { id: event.id, rawType: event.type, kind, payment }
}
