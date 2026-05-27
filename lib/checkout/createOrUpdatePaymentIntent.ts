import { stripe } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'
import type { CheckoutSession } from '@/lib/session'
import type { IronSession } from 'iron-session'

export async function createOrUpdatePaymentIntent(
  session: IronSession<CheckoutSession>,
  grandTotal: number,
  metadata: Record<string, string>
): Promise<string> {
  const traceId = session.checkoutSessionId || 'unknown'
  let result: { id: string; client_secret: string | null }

  if (session.paymentIntentId) {
    try {
      result = await stripe.paymentIntents.update(session.paymentIntentId, { amount: grandTotal, metadata })
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update', data: { paymentIntentId: session.paymentIntentId, amount: grandTotal }, outcome: 'success' })
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update_failed', data: { error: err instanceof Error ? err.message : String(err) }, outcome: 'error' })
      session.paymentIntentId = undefined
      result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata })
      session.paymentIntentId = result.id
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' })
    }
  } else {
    result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata })
    session.paymentIntentId = result.id
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' })
  }

  if (!result.client_secret) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_no_client_secret', data: { paymentIntentId: result.id }, outcome: 'error' })
    throw new Error('Stripe did not return client_secret')
  }

  await session.save()

  return result.client_secret
}
