import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grandTotal, metadata } = body as { 
      grandTotal?: number
      metadata?: Record<string, string>
    }

    if (!grandTotal || typeof grandTotal !== 'number') {
      return NextResponse.json(
        { error: 'grandTotal is required' },
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

    let result: { id: string; client_secret: string | null }

    if (session.paymentIntentId) {
      try {
        result = await stripe.paymentIntents.update(session.paymentIntentId, { amount: grandTotal, metadata })
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update', data: { paymentIntentId: session.paymentIntentId, amount: grandTotal }, outcome: 'success' })
      } catch (err) {
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_update_failed', data: { error: err instanceof Error ? err.message : String(err) }, outcome: 'error' })
        session.paymentIntentId = undefined
        result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata })
        session.paymentIntentId = result.id
        await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' })
      }
    } else {
      result = await stripe.paymentIntents.create({ amount: grandTotal, currency: 'pln', automatic_payment_methods: { enabled: true }, metadata })
      session.paymentIntentId = result.id
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_intent_create', data: { paymentIntentId: result.id, amount: grandTotal, currency: 'pln' }, outcome: 'success' })
    }

    if (!result.client_secret) {
      await logCheckoutEvent({ correlationId: traceId, slice: 'payment-init', event: 'payment_no_client_secret', data: { paymentIntentId: result.id }, outcome: 'error' })
      return NextResponse.json(
        { error: 'Stripe did not return client_secret' },
        { status: 500 }
      )
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
