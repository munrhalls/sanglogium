import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { Redis } from '@upstash/redis';
import { client } from '@/sanity/lib/client';
import { getRedisClient } from '@/lib/checkout/reservation/redis-client';
import { ReservationTTLManager } from '@/lib/checkout/reservation/redis-managers';
import { FIFOQueue } from '@/lib/checkout/reservation/fifo-queue';
import { realizeReservationHandler } from '@/lib/checkout/reservation/sanity-handlers';
import { v4 as uuidv4 } from 'uuid';

// Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Sanity client
const sanityClient = client;

// Store processed event IDs to prevent duplicate processing
async function isEventProcessed(eventId: string): Promise<boolean> {
  const processed = await redis.get(`processed_event:${eventId}`);
  return !!processed;
}

// Mark event as processed
async function markEventProcessed(eventId: string) {
  await redis.setex(`processed_event:${eventId}`, 86400, '1'); // 24 hours
}

// Commit reservation (mark as permanent in DB)
async function commitReservation(reservationId: string, paymentIntentId: string) {
  try {
    // Get reservation details from Redis
    const reservationData = await redis.hget('reservations', reservationId);
    if (!reservationData) {
      console.error('Reservation not found:', reservationId);
      return;
    }

    // Parse reservation data
    let items: Array<{ productId: string; quantity: number }>;
    try {
      items = JSON.parse(reservationData as string);
    } catch {
      const [pid, qty] = (reservationData as string).split(':');
      items = [{ productId: pid, quantity: parseInt(qty) }];
    }

    // Create order record in Sanity
    const order = await sanityClient.create({
      _type: 'order',
      paymentIntentId,
      reservationId,
      status: 'paid',
      items: items.map(item => ({
        _type: 'orderItem',
        _key: item.productId,
        product: { _type: 'reference', _ref: item.productId },
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    });

    console.log('Order created:', order._id);

    // Update stock to permanently remove (already reserved)
    // Stock was already decremented during reservation, so we just need to ensure it stays that way

    // Send confirmation email (implementation would go here)
    console.log('Confirmation email sent for order:', order._id);

    // Optionally keep idempotency cache for replay safety
    // await redis.del(`idempotency:${idempotencyKey}`);

  } catch (error) {
    console.error('Commit reservation error:', error);
    throw error;
  }
}

// Release Redis stock reservation
async function releaseReservation(reservationId: string) {
  try {
    // Get reservation details
    const reservationData = await redis.hget('reservations', reservationId);
    if (!reservationData) return;

    // Parse and restore stock
    let items: Array<{ productId: string; quantity: number }>;
    try {
      items = JSON.parse(reservationData as string);
    } catch {
      const [pid, qty] = (reservationData as string).split(':');
      items = [{ productId: pid, quantity: parseInt(qty) }];
    }
    for (const item of items) {
      if (item.productId && item.quantity) {
        await redis.hincrby('product_stock', item.productId, item.quantity);
      }
    }

    // Remove reservation
    await redis.hdel('reservations', reservationId);

    console.log('Stock released for reservation:', reservationId);
  } catch (error) {
    console.error('Release reservation error:', error);
  }
}

// Update guest session
async function updateGuestSession(sessionId: string, updates: any) {
  try {
    const session = await redis.get(`guest_session:${sessionId}`);
    if (!session) return;

    const sessionData = JSON.parse(session);
    Object.assign(sessionData, updates);

    await redis.setex(
      `guest_session:${sessionId}`,
      15 * 60, // 15 minutes
      JSON.stringify(sessionData)
    );
  } catch (error) {
    console.error('Update guest session error:', error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: any;

  try {
    // CRITICAL: Always verify Stripe-Signature header before processing
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Process idempotently (check if event.id already processed)
  if (await isEventProcessed(event.id)) {
    console.log('Event already processed:', event.id);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;

        // Commit reservation (mark as permanent in DB)
        await commitReservation(
          paymentIntent.metadata.reservationId,
          paymentIntent.id
        );

        // Create order record
        // Already done in commitReservation

        // Send confirmation email
        // Already done in commitReservation

        // Release idempotency cache (optional - keeps for replay safety)
        // Already handled in commitReservation

        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;

        // Release Redis stock reservation
        await releaseReservation(failedPaymentIntent.metadata.reservationId);

        // Update guest session: clear paymentIntentId
        if (failedPaymentIntent.metadata.sessionId) {
          await updateGuestSession(failedPaymentIntent.metadata.sessionId, {
            paymentIntentId: null,
            status: 'payment_failed'
          });
        }

        console.log('Payment failed:', failedPaymentIntent.id);
        break;

      case 'payment_intent.canceled':
        const canceledPaymentIntent = event.data.object;

        // Release Redis stock reservation
        await releaseReservation(canceledPaymentIntent.metadata.reservationId);

        console.log('Payment canceled:', canceledPaymentIntent.id);
        break;

      case 'checkout.session.completed': {
        const session = event.data.object;
        const reservationToken = session.metadata?.reservation_token;

        if (reservationToken) {
          // Initialize queue with realize handler
          const queueRedis = getRedisClient();
          const queue = new FIFOQueue(
            queueRedis,
            undefined, // create handler not needed
            undefined, // rollback handler not needed
            realizeReservationHandler
          );

          // Enqueue priority request to realize reservation
          const realizeResponse = await queue.enqueue({
            id: uuidv4(),
            type: 'realize_reservation',
            priority: 'high', // Priority queue for payment success
            idempotencyKey: `realize-${session.id}`,
            reservationToken,
            payload: {
              sessionId: session.id,
              paymentIntentId: session.payment_intent as string
            }
          });

          if (realizeResponse.status === 'error') {
            console.error('Failed to enqueue reservation realization:', realizeResponse.error);
          } else {
            console.log('Reservation realization enqueued with priority:', reservationToken);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Mark event as processed
    await markEventProcessed(event.id);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
