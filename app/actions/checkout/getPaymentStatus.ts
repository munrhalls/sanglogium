'use server';

import { stripe } from '@/lib/stripe';

export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: pi.status,  // 'succeeded' | 'processing' | 'requires_action' | etc
      amountReceived: pi.amount_received,
      currency: pi.currency,
    };
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    throw new Error('Failed to retrieve payment status');
  }
}
