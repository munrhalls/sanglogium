import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must mock before importing the route
vi.mock('@/lib/session', () => ({
  getCheckoutSession: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/dev/event-logger', () => ({
  logCheckoutEvent: vi.fn(),
}))

vi.mock('@/sanity-cms/lib/backendClient', () => {
  const fetchMock = vi.fn()
  return {
    getBackendClient: vi.fn(() => ({
      fetch: fetchMock,
    })),
  }
})

vi.mock('groq', () => ({
  default: vi.fn(() => 'mocked-query'),
}))

import { POST } from '@/app/api/checkout/payment-intent-session/route'
import { getCheckoutSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'
import { getBackendClient } from '@/sanity-cms/lib/backendClient'

function createPostRequest(body: unknown): Request {
  return new Request('http://localhost/api/checkout/payment-intent-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any
}

describe('POST /api/checkout/payment-intent-session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates PaymentIntent with server-computed grandTotal', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 2 }],
      shippingCost: 1000,
      checkoutSessionId: 'session-123',
      paymentIntentId: undefined,
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const mockProducts = [{ _id: 'prod-1', price_data: { unit_amount: 5000 } }]
    ;(getBackendClient as any)().fetch.mockResolvedValue(mockProducts)

    ;(stripe.paymentIntents.create as any).mockResolvedValue({
      id: 'pi_test',
      client_secret: 'pi_test_secret',
    })

    const request = createPostRequest({ grandTotal: 11000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 11000,
        currency: 'pln',
        metadata: expect.objectContaining({
          basket: 'prod-1:2',
          checkoutSessionId: 'session-123',
          vat: expect.any(String),
        }),
      }),
      expect.objectContaining({ idempotencyKey: 'session-123' })
    )
    expect(data.clientSecret).toBe('pi_test_secret')
    expect(mockSession.save).toHaveBeenCalled()
  })

  it('rejects non-integer grandTotal from client', async () => {
    const request = createPostRequest({ grandTotal: 12.34, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('grandTotal must be a positive integer')
  })

  it('rejects negative grandTotal from client', async () => {
    const request = createPostRequest({ grandTotal: -1, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('grandTotal must be a positive integer')
  })

  it('rejects when basket is empty', async () => {
    const mockSession = {
      basket: [],
      shippingCost: 1000,
      checkoutSessionId: 'session-123',
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const request = createPostRequest({ grandTotal: 1000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Basket is empty')
  })

  it('rejects when shipping cost is missing', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 1 }],
      shippingCost: undefined,
      checkoutSessionId: 'session-123',
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const request = createPostRequest({ grandTotal: 5000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Shipping cost is missing')
  })

  it('rejects when Sanity product mismatch', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 1 }],
      shippingCost: 1000,
      checkoutSessionId: 'session-123',
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    ;(getBackendClient as any)().fetch.mockResolvedValue([])

    const request = createPostRequest({ grandTotal: 5000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Product mismatch — one or more basket items not found')
  })

  it('updates existing PaymentIntent when session.paymentIntentId exists', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 1 }],
      shippingCost: 1000,
      checkoutSessionId: 'session-123',
      paymentIntentId: 'pi_existing',
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const mockProducts = [{ _id: 'prod-1', price_data: { unit_amount: 5000 } }]
    ;(getBackendClient as any)().fetch.mockResolvedValue(mockProducts)

    ;(stripe.paymentIntents.update as any).mockResolvedValue({
      id: 'pi_existing',
      client_secret: 'pi_existing_secret',
    })

    const request = createPostRequest({ grandTotal: 6000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(stripe.paymentIntents.update).toHaveBeenCalledWith(
      'pi_existing',
      expect.objectContaining({ amount: 6000 }),
      expect.objectContaining({ idempotencyKey: 'session-123' })
    )
    expect(data.clientSecret).toBe('pi_existing_secret')
  })

  it('falls back to create when update fails', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 1 }],
      shippingCost: 1000,
      checkoutSessionId: 'session-123',
      paymentIntentId: 'pi_existing',
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const mockProducts = [{ _id: 'prod-1', price_data: { unit_amount: 5000 } }]
    ;(getBackendClient as any)().fetch.mockResolvedValue(mockProducts)

    ;(stripe.paymentIntents.update as any).mockRejectedValue(new Error('PI not found'))
    ;(stripe.paymentIntents.create as any).mockResolvedValue({
      id: 'pi_new',
      client_secret: 'pi_new_secret',
    })

    const request = createPostRequest({ grandTotal: 6000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          basket: 'prod-1:1',
          vat: expect.any(String),
        }),
      }),
      expect.anything()
    )
    expect(data.clientSecret).toBe('pi_new_secret')
  })

  it('rejects when checkoutSessionId is missing (M-03)', async () => {
    const mockSession = {
      basket: [{ productId: 'prod-1', quantity: 1 }],
      shippingCost: 1000,
      checkoutSessionId: undefined,
      save: vi.fn(),
    }
    ;(getCheckoutSession as any).mockResolvedValue(mockSession)

    const mockProducts = [{ _id: 'prod-1', price_data: { unit_amount: 5000 } }]
    ;(getBackendClient as any)().fetch.mockResolvedValue(mockProducts)

    const request = createPostRequest({ grandTotal: 6000, metadata: {} })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Checkout session ID is missing')
  })
})
