import "server-only";
import Stripe from 'stripe'
import { stripe } from './client'

export function constructWebhookEvent(
  rawBody: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, secret)
}
