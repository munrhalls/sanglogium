import "server-only";
import Stripe from 'stripe'
import type {
  PaymentSnapshot,
  PaymentHandle,
} from '@/features/checkout/core/rules/checkoutTypes'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

export const stripe = new Stripe(stripeSecretKey, {
  // SDK types may lag behind API releases; runtime supports 2026-05-27.dahlia
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
})

export function toPaymentSnapshot(pi: Stripe.PaymentIntent): PaymentSnapshot {
  const charge =
    typeof pi.latest_charge === 'object' && pi.latest_charge !== null
      ? pi.latest_charge
      : null
  const card = charge?.payment_method_details?.card
  return {
    id: pi.id,
    status: pi.status,
    amount: pi.amount,
    currency: pi.currency,
    receiptEmail: pi.receipt_email ?? null,
    metadata: pi.metadata ?? {},
    paymentMethod: charge
      ? {
          type: charge.payment_method_details?.type ?? 'unknown',
          card: card
            ? {
                brand: card.brand ?? null,
                last4: card.last4 ?? null,
                walletType: card.wallet?.type ?? null,
              }
            : null,
        }
      : null,
    failureMessage: pi.last_payment_error?.message ?? null,
  }
}

export async function retrievePayment(paymentId: string): Promise<PaymentSnapshot> {
  const pi = await stripe.paymentIntents.retrieve(paymentId, {
    expand: ['latest_charge'],
  })
  return toPaymentSnapshot(pi)
}

export async function updatePaymentAmount(
  paymentId: string,
  amount: number,
  metadata: Record<string, string>,
  idempotencyKey: string
): Promise<PaymentHandle> {
  const pi = await stripe.paymentIntents.update(
    paymentId,
    { amount, metadata },
    { idempotencyKey }
  )
  return { id: pi.id, clientSecret: pi.client_secret }
}

export async function createPayment(
  amount: number,
  metadata: Record<string, string>,
  idempotencyKey: string
): Promise<PaymentHandle> {
  const pi = await stripe.paymentIntents.create(
    { amount, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata },
    { idempotencyKey }
  )
  return { id: pi.id, clientSecret: pi.client_secret }
}
