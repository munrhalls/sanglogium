import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

export const stripe = new Stripe(stripeSecretKey, {
  // SDK types may lag behind API releases; runtime supports 2026-05-27.dahlia
  apiVersion: '2026-05-27.dahlia' as any,
  typescript: true,
})

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  })
}
