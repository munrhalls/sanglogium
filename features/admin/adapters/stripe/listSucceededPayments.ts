import "server-only";
import Stripe from 'stripe'
import type { PaidPayment } from '@/features/admin/core/types/adminTypes'

let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required')
    }
    stripe = new Stripe(stripeSecretKey, {
      // SDK types may lag behind API releases; runtime supports 2026-05-27.dahlia
      apiVersion: '2026-05-27.dahlia' as any,
      typescript: true,
    })
  }
  return stripe
}

// Every succeeded PaymentIntent created at or after createdSince (seconds), all pages.
export async function listSucceededPayments(createdSince: number): Promise<PaidPayment[]> {
  const client = getStripe()
  const payments: PaidPayment[] = []
  let startingAfter: string | undefined
  for (;;) {
    const page = await client.paymentIntents.list({
      created: { gte: createdSince },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const pi of page.data) {
      if (pi.status === 'succeeded') {
        payments.push({ id: pi.id, amount: pi.amount, currency: pi.currency, created: pi.created })
      }
    }
    if (!page.has_more || page.data.length === 0) return payments
    startingAfter = page.data[page.data.length - 1].id
  }
}
