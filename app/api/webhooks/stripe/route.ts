import { NextRequest, NextResponse } from 'next/server'
import { handleStripeWebhook } from '@/features/checkout/server'

// Stripe requires the raw request body for signature verification —
// Next.js App Router does NOT automatically parse it, so we read it as text.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  const result = await handleStripeWebhook({ rawBody, signature })

  return NextResponse.json(result.body, { status: result.status })
}
