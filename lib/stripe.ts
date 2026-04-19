import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

export async function getVerifiedPrice(stripePriceId: string): Promise<number> {
  try {
    const price = await stripe.prices.retrieve(stripePriceId)
    if (!price.unit_amount) {
      throw new Error(`Price ${stripePriceId} has no unit_amount`)
    }
    return price.unit_amount / 100 // Convert from cents to dollars
  } catch (error) {
    console.error(`Failed to fetch Stripe price ${stripePriceId}:`, error)
    throw new Error(`Failed to verify price: ${stripePriceId}`)
  }
}
