import { NextRequest, NextResponse } from 'next/server'
import { getBackendClient } from '@/sanity-cms/lib/backendClient'
import { stripe } from '@/lib/stripe'
import { logCheckoutEvent } from '@/lib/dev/event-logger'

interface BasketReservationItem {
  _id: string
  quantity: number
  verifiedPrice: number
}

interface ShippingChoice {
  provider: string
  serviceLevel: string
  rateId: string
  amount: number
  currency: string
  estimatedDays: number
}

interface ReservationData {
  _id: string
  basketReservation: BasketReservationItem[]
  shippingChoice: ShippingChoice
}

interface ProductPriceData {
  _id: string
  price_data: {
    currency: string
    unit_amount: number
  }
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse basketReservationId and checkoutSessionId from request body
    const body = await request.json()
    const { basketReservationId, checkoutSessionId } = body as { 
      basketReservationId?: string
      checkoutSessionId?: string 
    }

    if (!basketReservationId || typeof basketReservationId !== 'string') {
      return NextResponse.json(
        { error: 'basketReservationId is required', errorClass: 'VALIDATION' },
        { status: 400 }
      )
    }

    // Log trace event
    await logCheckoutEvent({
      correlationId: checkoutSessionId || 'unknown',
      slice: 'payment-init',
      event: 'payment_intent_creation_start',
      data: { basketReservationId },
      outcome: 'success',
    });

    // Step 2: Fetch reservation from Sanity
    const backendClient = getBackendClient()
    const reservationQuery = `*[_type == "basketReservation" && _id == $id][0]{
      _id,
      basketReservation,
      shippingChoice
    }`
    const reservation = await backendClient.fetch<ReservationData>(reservationQuery, {
      id: basketReservationId,
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found', errorClass: 'VALIDATION' },
        { status: 404 }
      )
    }

    if (!reservation.basketReservation || reservation.basketReservation.length === 0) {
      return NextResponse.json(
        { error: 'Basket reservation is empty', errorClass: 'VALIDATION' },
        { status: 400 }
      )
    }

    if (!reservation.shippingChoice) {
      return NextResponse.json(
        { error: 'Shipping choice not found', errorClass: 'VALIDATION' },
        { status: 400 }
      )
    }

    // Step 3: Fetch products from Sanity
    const productIds = reservation.basketReservation.map((item) => item._id)
    const productsQuery = `*[_type == "product" && _id in $ids]{ _id, price_data }`
    const products = await backendClient.fetch<ProductPriceData[]>(productsQuery, {
      ids: productIds,
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products not found', errorClass: 'VALIDATION' },
        { status: 404 }
      )
    }

    // Step 4: Compute totalCents
    const productMap = new Map(products.map((p) => [p._id, p]))
    let totalCents = 0
    const currencies: string[] = []

    for (const item of reservation.basketReservation) {
      const product = productMap.get(item._id)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item._id} not found`, errorClass: 'VALIDATION' },
          { status: 404 }
        )
      }

      const itemTotal = product.price_data.unit_amount * item.quantity
      totalCents += itemTotal
      currencies.push(product.price_data.currency)
    }

    // Add shipping amount
    totalCents += reservation.shippingChoice.amount
    currencies.push(reservation.shippingChoice.currency)

    // Validate total
    if (totalCents <= 0) {
      return NextResponse.json(
        { error: 'Total amount must be greater than 0', errorClass: 'COMPUTATION' },
        { status: 400 }
      )
    }

    // Step 5: Validate currency consistency
    const normalizedCurrencies = currencies.map((c) => c.toLowerCase())
    const uniqueCurrencies = new Set(normalizedCurrencies)
    if (uniqueCurrencies.size !== 1) {
      return NextResponse.json(
        { error: 'Currency mismatch across items and shipping', errorClass: 'COMPUTATION' },
        { status: 400 }
      )
    }

    const currency = normalizedCurrencies[0]

    // Step 6: Create Stripe PaymentIntent with trace ID in metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: currency,
      automatic_payment_methods: { enabled: true },
      metadata: { 
        basketReservationId,
        ...(checkoutSessionId && { checkoutSessionId })
      },
    })

    await logCheckoutEvent({
      correlationId: checkoutSessionId || 'unknown',
      slice: 'payment-init',
      event: 'payment_intent_created',
      data: { paymentIntentId: paymentIntent.id, amount: totalCents, currency, basketReservationId },
      outcome: 'success',
    });

    // Step 7: Return clientSecret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    // Check if it's a Stripe error
    if (error && typeof error === 'object' && 'type' in error) {
      return NextResponse.json(
        { error: 'Stripe API error', errorClass: 'STRIPE' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent', errorClass: 'STRIPE' },
      { status: 500 }
    )
  }
}
