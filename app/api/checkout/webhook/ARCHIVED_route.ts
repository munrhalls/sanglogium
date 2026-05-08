import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkoutClient } from '@/sanity-cms/lib/checkoutClient';
import { groq } from 'next-sanity';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

/**
 * Stripe webhook handler for checkout events
 * Handles checkout.session.expired to release reserved stock
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle checkout session expired event
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const idempotencyKey = session.metadata?.idempotencyKey;

      if (!idempotencyKey) {
        console.error('Webhook: No idempotencyKey found in session metadata');
        return NextResponse.json({ error: 'No idempotencyKey found' }, { status: 400 });
      }

      console.log(`Webhook: Releasing reservation for expired session ${session.id}, idempotencyKey: ${idempotencyKey}`);

      // Find products with this reservation
      const query = groq`*[_type == "product" && reservations[idempotencyKey == $idempotencyKey && status == "active"]]{
        _id,
        name,
        stock,
        reservedStock,
        reservations
      }`;

      const products = await checkoutClient.fetch(query, { idempotencyKey });

      if (products.length === 0) {
        console.log(`Webhook: No active reservations found for idempotencyKey: ${idempotencyKey}`);
        return NextResponse.json({ message: 'No reservations to release' });
      }

      // Release reservations
      const transaction = checkoutClient.transaction();

      for (const product of products) {
        const activeReservations = product.reservations.filter(
          (r: any) => r.idempotencyKey === idempotencyKey && r.status === 'active'
        );

        for (const reservation of activeReservations) {
          transaction.patch(product._id, (p) =>
            p
              .dec({ reservedStock: reservation.quantity })
              .set({
                reservations: product.reservations.map((r: any) =>
                  r.idempotencyKey === idempotencyKey
                    ? { ...r, status: 'expired' }
                    : r
                )
              })
          );
        }
      }

      await transaction.commit();

      console.log(`Webhook: Released ${products.length} product reservations for idempotencyKey: ${idempotencyKey}`);

      return NextResponse.json({ 
        message: 'Reservations released',
        productsReleased: products.length
      });
    }

    // Return 200 for other events
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
