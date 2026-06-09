import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'
import { getBackendClient } from '@/sanity-cms/lib/backendClient'
import groq from 'groq'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grandTotal, metadata } = body as { 
      grandTotal?: number
      metadata?: Record<string, string>
    }

    // Sanity check: client must send a valid positive integer (display total)
    // Server will re-derive authoritatively from live Sanity data.
    if (grandTotal !== undefined && (!Number.isInteger(grandTotal) || grandTotal < 1)) {
      return NextResponse.json(
        { error: 'grandTotal must be a positive integer' },
        { status: 400 }
      )
    }

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { error: 'metadata is required' },
        { status: 400 }
      )
    }

    const session = await getCheckoutSession()
    const traceId = session.checkoutSessionId || 'unknown'

    // ── Re-derive grandTotal from live Sanity data (authoritative) ──
    if (!session.basket?.length) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_empty_basket', data: {}, outcome: 'error' })
      return NextResponse.json({ error: 'Basket is empty' }, { status: 400 })
    }

    if (session.shippingCost === undefined || session.shippingCost === null) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_missing_shipping', data: {}, outcome: 'error' })
      return NextResponse.json({ error: 'Shipping cost is missing' }, { status: 400 })
    }

    const ids = session.basket.map(i => i.productId)
    const products = await getBackendClient().fetch<{ _id: string; price_data: { unit_amount: number } | null }[]>(
      groq`*[_type == "product" && _id in $ids]{ _id, price_data { unit_amount } }`,
      { ids }
    )

    if (products.length !== session.basket.length) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_product_mismatch', data: { expected: session.basket.length, received: products.length }, outcome: 'error' })
      return NextResponse.json({ error: 'Product mismatch — one or more basket items not found' }, { status: 400 })
    }

    let subtotal = 0
    for (const item of session.basket) {
      const product = products.find(p => p._id === item.productId)
      const unitPrice = product?.price_data?.unit_amount
      if (!unitPrice || !Number.isFinite(unitPrice)) {
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_price', data: { productId: item.productId }, outcome: 'error' })
        return NextResponse.json({ error: `Invalid price for product ${item.productId}` }, { status: 400 })
      }
      subtotal += unitPrice * item.quantity
    }

    const computedGrandTotal = Math.round(subtotal + session.shippingCost)

    if (!Number.isInteger(computedGrandTotal) || computedGrandTotal < 1) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_invalid_total', data: { subtotal, shippingCost: session.shippingCost, computedGrandTotal }, outcome: 'error' })
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 })
    }

    // Build a lean address for Stripe metadata. session.address carries the
    // full Google Places enrichment (geocode, placeId, etc.) which is never
    // used downstream and would exceed Stripe's 500-char metadata value limit.
    const a = session.address
    const leanAddress = a
      ? {
          firstName: a.firstName,
          lastName: a.lastName,
          phone: a.phone,
          regionCode: a.regionCode,
          postalCode: a.postalCode,
          street: a.street,
          streetNumber: a.streetNumber,
          city: a.city,
        }
      : {}

    // C-02: Compact basket representation to stay well under Stripe's 500-char metadata limit
    // Format: productId:quantity,productId:quantity
    const basketCompact = session.basket.map(i => `${i.productId}:${i.quantity}`).join(',')

    // H-02: Calculate Polish standard VAT (23%) — gross pricing breakdown
    const vatAmount = computedGrandTotal - Math.round(computedGrandTotal / 1.23)

    // Merge session data into metadata so the webhook can build the order
    // without depending on basketReservation documents
    const enrichedMetadata: Record<string, string> = {
      ...metadata,
      basket: basketCompact,
      address: JSON.stringify(leanAddress),
      shippingCode: session.shippingCode ?? '',
      shippingCost: String(session.shippingCost ?? ''),
      shippingMethodName: session.shippingMethodName ?? '',
      shippingCarrier: session.shippingCarrier ?? '',
      shippingEstimatedDays: String(session.shippingEstimatedDays ?? ''),
      email: session.email ?? '',
      checkoutSessionId: traceId,
      vat: String(vatAmount),
    }

    // C-02 guard: Stripe metadata values have a 500-character limit
    const oversizeKeys = Object.entries(enrichedMetadata)
      .filter(([, v]) => v.length > 500)
      .map(([k]) => k)
    if (oversizeKeys.length > 0) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_metadata_oversize', data: { keys: oversizeKeys }, outcome: 'error' })
      return NextResponse.json(
        { error: `Metadata values exceed Stripe 500-char limit for keys: ${oversizeKeys.join(', ')}` },
        { status: 400 }
      )
    }

    let result: { id: string; client_secret: string | null }

    // M-03: Reject non-idempotent fallback; idempotency key must be stable
    if (!session.checkoutSessionId) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_missing_session_id', data: {}, outcome: 'error' })
      return NextResponse.json({ error: 'Checkout session ID is missing' }, { status: 400 })
    }
    const idempotencyKey = session.checkoutSessionId

    if (session.paymentIntentId) {
      try {
        result = await stripe.paymentIntents.update(session.paymentIntentId, { amount: computedGrandTotal, metadata: enrichedMetadata }, { idempotencyKey })
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update', data: { paymentIntentId: session.paymentIntentId, amount: computedGrandTotal }, outcome: 'success' })
      } catch (err) {
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update_failed', data: { error: err instanceof Error ? err.message : String(err) }, outcome: 'error' })
        session.paymentIntentId = undefined
        result = await stripe.paymentIntents.create({ amount: computedGrandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata: enrichedMetadata }, { idempotencyKey })
        session.paymentIntentId = result.id
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: computedGrandTotal, currency: 'pln' }, outcome: 'success' })
      }
    } else {
      result = await stripe.paymentIntents.create({ amount: computedGrandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata: enrichedMetadata }, { idempotencyKey })
      session.paymentIntentId = result.id
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: computedGrandTotal, currency: 'pln' }, outcome: 'success' })
    }

    if (!result.client_secret) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_no_client_secret', data: { paymentIntentId: result.id }, outcome: 'error' })
      return NextResponse.json(
        { error: 'Stripe did not return client_secret' },
        { status: 500 }
      )
    }

    // C-02: Cookie size pre-check before save (warn threshold ~3KB before 4KB hard limit)
    const sessionJsonSize = Buffer.byteLength(JSON.stringify(session), 'utf8')
    if (sessionJsonSize > 3000) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_session_cookie_warn', data: { size: sessionJsonSize }, outcome: 'error' })
    }

    await session.save()

    return NextResponse.json({
      clientSecret: result.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
