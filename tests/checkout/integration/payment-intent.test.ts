import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from 'next-sanity'
import { apiVersion, projectId, dataset } from '../../../sanity-cms/env'
import { getTestProducts } from '../../helpers/sanity-test-products'
import { stripe } from '../../../lib/stripe'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
})

const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

describe('PaymentIntent API Integration', () => {
  let reservationId: string
  let testProducts: Awaited<ReturnType<typeof getTestProducts>>

  beforeEach(async () => {
    // Get test products from Sanity
    testProducts = await getTestProducts()
    if (testProducts.length < 1) {
      throw new Error('Test dataset must have at least 1 product')
    }

    // Create a test basket reservation with valid data
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes in future

    const reservation = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].price_data.unit_amount,
        },
      ],
      shippingChoice: {
        provider: 'test-provider',
        serviceLevel: 'test-service',
        rateId: 'test-rate-id',
        amount: 1000, // $10.00 in cents
        currency: testProducts[0].price_data.currency,
        estimatedDays: 5,
      },
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })
    reservationId = reservation._id
  })

  afterEach(async () => {
    // Cleanup: delete test reservation
    try {
      await writeClient.delete(reservationId)
    } catch {
      // Reservation may have been deleted already
    }
  })

  test('happy path: valid reservation returns clientSecret', async () => {
    // Call POST /api/checkout/payment-intent
    const response = await fetch('http://localhost:3000/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketReservationId: reservationId }),
    })

    // Assert 200 status
    expect(response.ok).toBe(true)

    const data = await response.json()

    // Assert clientSecret exists and has correct format
    expect(data.clientSecret).toBeDefined()
    expect(data.clientSecret).toMatch(/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/)

    // Verify PaymentIntent exists in Stripe with correct amount
    const paymentIntentId = data.clientSecret.split('_secret_')[0]
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    const expectedAmount = testProducts[0].price_data.unit_amount * 1 + 1000 // product + shipping
    expect(paymentIntent.amount).toBe(expectedAmount)
    expect(paymentIntent.currency).toBe(testProducts[0].price_data.currency.toLowerCase())
    expect(paymentIntent.metadata.basketReservationId).toBe(reservationId)
  })

  test('missing basketReservationId returns 400 VALIDATION', async () => {
    const response = await fetch('http://localhost:3000/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('basketReservationId is required')
    expect(data.errorClass).toBe('VALIDATION')
  })

  test('non-existent reservation ID returns 404 VALIDATION', async () => {
    const response = await fetch('http://localhost:3000/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketReservationId: 'non-existent-id' }),
    })

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Reservation not found')
    expect(data.errorClass).toBe('VALIDATION')
  })

  test('missing shippingChoice returns 400 VALIDATION', async () => {
    // Create reservation without shippingChoice
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000)

    const reservationWithoutShipping = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].price_data.unit_amount,
        },
      ],
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    const response = await fetch('http://localhost:3000/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketReservationId: reservationWithoutShipping._id }),
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Shipping choice not found')
    expect(data.errorClass).toBe('VALIDATION')

    // Cleanup
    await writeClient.delete(reservationWithoutShipping._id)
  })

  test('currency mismatch returns 400 COMPUTATION', async () => {
    // Create reservation with mismatched currency
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000)

    const reservationWithMismatch = await writeClient.create({
      _type: 'basketReservation',
      basketReservation: [
        {
          _id: testProducts[0]._id,
          quantity: 1,
          verifiedPrice: testProducts[0].price_data.unit_amount,
        },
      ],
      shippingChoice: {
        provider: 'test-provider',
        serviceLevel: 'test-service',
        rateId: 'test-rate-id',
        amount: 1000,
        currency: 'eur', // Different from product currency
        estimatedDays: 5,
      },
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    })

    const response = await fetch('http://localhost:3000/api/checkout/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketReservationId: reservationWithMismatch._id }),
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Currency mismatch across items and shipping')
    expect(data.errorClass).toBe('COMPUTATION')

    // Cleanup
    await writeClient.delete(reservationWithMismatch._id)
  })
})
