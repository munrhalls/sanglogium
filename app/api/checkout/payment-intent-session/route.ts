import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/features/checkout/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grandTotal, metadata } = body as {
      grandTotal?: number
      metadata?: Record<string, string>
    }

    const result = await createPaymentIntent({ grandTotal, metadata })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ clientSecret: result.clientSecret })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
