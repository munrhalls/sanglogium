import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  })
}
