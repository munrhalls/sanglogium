import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grandTotal, metadata } = body as {
      grandTotal?: number
      metadata?: Record<string, string>
    }

    if (!grandTotal || typeof grandTotal !== 'number') {
      return NextResponse.json(
        { error: 'grandTotal is required and must be a number' },
        { status: 400 }
      )
    }

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json(
        { error: 'metadata is required and must be an object' },
        { status: 400 }
      )
    }

    const session = await getCheckoutSession()

    let result: { id: string; client_secret: string | null }

    if (session.paymentIntentId) {
      try {
        result = await stripe.paymentIntents.update(session.paymentIntentId, {
          amount: grandTotal,
          metadata,
        })
      } catch {
        session.paymentIntentId = undefined
        result = await stripe.paymentIntents.create({
          amount: grandTotal,
          currency: 'pln',
          automatic_payment_methods: { enabled: true },
          metadata,
        })
        session.paymentIntentId = result.id
      }
    } else {
      result = await stripe.paymentIntents.create({
        amount: grandTotal,
        currency: 'pln',
        automatic_payment_methods: { enabled: true },
        metadata,
      })
      session.paymentIntentId = result.id
    }

    if (!result.client_secret) {
      throw new Error('Stripe did not return client_secret')
    }

    await session.save()

    return NextResponse.json({ clientSecret: result.client_secret })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
