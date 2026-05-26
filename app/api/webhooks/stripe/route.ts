import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { backendClient } from '@/sanity-cms/lib/backendClient'
import { logCheckoutEvent } from '@/lib/dev/event-logger'

// Stripe requires the raw request body for signature verification —
// Next.js App Router does NOT automatically parse it, so we read it as text.
export const runtime = 'nodejs'

interface BasketReservationItem {
  _id: string
  quantity: number
  verifiedPrice: number
}

interface ReservationDoc {
  _id: string
  basketReservation: BasketReservationItem[]
  shippingAddress: {
    regionCode: string
    postalCode: string
    street: string
    streetNumber: string
    city: string
  }
  shippingChoice: {
    provider: string
    serviceLevel: string
    amount: number
    currency: string
  }
}

interface ProductDoc {
  _id: string
  name: string
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const paymentIntentId = pi.id
  const checkoutSessionId = pi.metadata?.checkoutSessionId
  const traceId = checkoutSessionId || 'unknown'

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_start', data: { paymentIntentId, checkoutSessionId }, outcome: 'success' });

  // Step 1: Idempotency — skip if order already exists for this PI
  const existing = await backendClient.fetch<{ _id: string } | null>(
    `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{ _id }`,
    { paymentIntentId }
  )
  if (existing) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_order_already_exists', data: { paymentIntentId }, outcome: 'success' });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[WEBHOOK] Order already exists for PI ${paymentIntentId} — skipping`)
    }
    return
  }

  // Step 2: Read basketReservationId from PI metadata (if available)
  const basketReservationId = pi.metadata?.basketReservationId
  if (basketReservationId) {
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_has_basket_reservation_id', data: { basketReservationId, paymentIntentId }, outcome: 'success' });
  } else {
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_no_basket_reservation_id', data: { paymentIntentId }, outcome: 'error' });
  }

  // Step 3: Fetch reservation if basketReservationId exists
  let reservation: ReservationDoc | null = null
  if (basketReservationId) {
    reservation = await backendClient.fetch<ReservationDoc | null>(
      `*[_type == "basketReservation" && _id == $id][0]{
        _id,
        basketReservation[]{ _id, quantity, verifiedPrice },
        shippingAddress{ regionCode, postalCode, street, streetNumber, city },
        shippingChoice{ provider, serviceLevel, amount, currency }
      }`,
      { id: basketReservationId }
    )

    if (!reservation) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_reservation_not_found', data: { basketReservationId, paymentIntentId }, outcome: 'error' });
      console.error(`[WEBHOOK] Reservation ${basketReservationId} not found for PI ${paymentIntentId}`)
      return
    }

    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_reservation_fetched', data: { basketReservationId, itemCount: reservation.basketReservation.length }, outcome: 'success' });
  }

  // Step 4: Build order items from reservation or PI metadata
  let items: any[]
  if (reservation) {
    // Fetch product names (required by order item schema)
    const productIds = reservation.basketReservation.map((item) => item._id)
    const products = await backendClient.fetch<ProductDoc[]>(
      `*[_type == "product" && _id in $ids]{ _id, name }`,
      { ids: productIds }
    )
    const productNameMap = new Map(products.map((p) => [p._id, p.name]))

    // Build order items from reservation
    items = reservation.basketReservation.map((item) => ({
      productId: item._id,
      name: productNameMap.get(item._id) ?? item._id,
      quantity: item.quantity,
      price: item.verifiedPrice,
      subtotal: item.verifiedPrice * item.quantity,
      returnStatus: 'none',
    }))
  } else {
    // No reservation - skip order creation (current flow doesn't create reservations)
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_skip_order_creation', data: { reason: 'no_basket_reservation', paymentIntentId }, outcome: 'error' });
    console.log(`[WEBHOOK] No basket reservation for PI ${paymentIntentId} - skipping order creation`)
    return
  }

  // Step 5: Map reservation address → order shippingAddress shape
  const addr = reservation.shippingAddress
  const shippingAddress = {
    name: 'Guest',
    line1: `${addr.street} ${addr.streetNumber}`.trim(),
    city: addr.city,
    state: addr.regionCode,
    postalCode: addr.postalCode,
    country: addr.regionCode,
  }

  // Step 6: Compute pricing (subtotal + shipping = total; tax = 0)
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const shippingCost = reservation.shippingChoice?.amount ?? 0
  const total = pi.amount // trust Stripe as the authoritative total
  const currency = pi.currency.toUpperCase()

  const pricing = {
    subtotal,
    shipping: shippingCost,
    tax: 0,
    total,
    currency,
  }

  // Step 7: Generate order identifiers
  const year = new Date().getFullYear()
  const orderCount = await backendClient.fetch<number>(
    `count(*[_type == "order" && dates.orderedAt >= $yearStart])`,
    { yearStart: `${year}-01-01T00:00:00.000Z` }
  )
  const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const now = new Date().toISOString()

  // Step 8: Create order document with top-level paymentIntentId
  const orderDoc = {
    _type: 'order',
    orderNumber,
    orderId,
    paymentIntentId,
    customerEmail: 'guest@checkout',
    isGuest: true,
    items,
    shippingAddress,
    pricing,
    status: 'processing',
    dates: {
      orderedAt: now,
      paidAt: now,
    },
    payment: {
      stripePaymentIntentId: paymentIntentId,
    },
  }

  await backendClient.create(orderDoc)

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_order_created', data: { orderNumber, orderId, paymentIntentId, itemCount: items.length }, outcome: 'success' });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WEBHOOK] Order ${orderNumber} created for PI ${paymentIntentId}`)
  }

  // Step 9: Decrement stock for each item (atomic patch per item)
  await Promise.all(
    reservation.basketReservation.map((item) =>
      backendClient
        .patch(item._id)
        .dec({ stock: item.quantity })
        .commit()
    )
  )

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_stock_decremented', data: { itemCount: reservation.basketReservation.length }, outcome: 'success' });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WEBHOOK] Stock decremented for ${reservation.basketReservation.length} items`)
  }

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_succeeded_complete', data: { paymentIntentId, orderNumber }, outcome: 'success' });
}

export async function POST(request: NextRequest) {
  await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_post_start', data: {}, outcome: 'success' });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_secret', data: {}, outcome: 'error' });
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_no_signature', data: {}, outcome: 'error' });
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // Read raw body — required for signature verification
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logCheckoutEvent({ correlationId: 'webhook_unknown', slice: 'webhook', event: 'webhook_signature_failed', data: { error: message }, outcome: 'error' });
    console.error(`[WEBHOOK] Signature verification failed: ${message}`)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[WEBHOOK] Received event: ${event.type} (${event.id})`)
  }

  // Extract traceId from event data if available
  const traceId = (event.data.object as any)?.metadata?.checkoutSessionId || 'unknown';

  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_event_received', data: { eventType: event.type, eventId: event.id }, outcome: 'success' });

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await handlePaymentIntentSucceeded(pi)
    } catch (err) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_processing_error', data: { paymentIntentId: pi.id, error: err instanceof Error ? err.message : String(err) }, outcome: 'error' });
      console.error(`[WEBHOOK] Error processing payment_intent.succeeded for ${pi.id}:`, err)
      // Return 500 so Stripe retries delivery
      return NextResponse.json({ error: 'Order processing failed' }, { status: 500 })
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const failureMessage = (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ?? 'unknown'
    await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_payment_failed', data: { paymentIntentId: pi.id, failureMessage }, outcome: 'error' });
    console.error(`[WEBHOOK] payment_intent.payment_failed — PI: ${pi.id} — reason: ${failureMessage}`)
  }

  // Acknowledge all event types with 200 (Stripe expects 2xx for all events it delivers)
  await logCheckoutEvent({ correlationId: traceId, slice: 'webhook', event: 'webhook_post_complete', data: { eventType: event.type }, outcome: 'success' });
  return NextResponse.json({ received: true })
}
