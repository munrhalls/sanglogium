// Unit Test: Checkout Button - Multiple Click Failure Mode
// Tests that multiple rapid clicks result in only one reservation request
// No mocking - tests actual deduplication behavior

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import { CheckoutButton } from '@/components/checkout/reservation/CheckoutButton'
import { useBasketStore } from '@/store/store'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { eventDeduplicator } from '@/components/checkout/reservation/EventDeduplicator'
import { vi } from 'vitest'

// Mock fetch to track API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock UUID to have predictable values
vi.mock('uuid')
const mockUuid = uuidv4 as any

describe('CheckoutButton - Multiple Click Failure Mode', () => {
  beforeEach(() => {
    // Reset all mocks and stores
    vi.clearAllMocks()
    mockFetch.mockClear()
    eventDeduplicator.reset()

    // Reset stores
    useBasketStore.setState({ basket: [] })
    useReservedBasketStore.setState({
      reservedBasket: null,
      loading: false,
      error: null
    })

    // Mock UUID to return predictable values
    mockUuid
      .mockReturnValueOnce('idempotency-key-1')
      .mockReturnValueOnce('reservation-id-1')
      .mockReturnValueOnce('idempotency-key-2')
      .mockReturnValueOnce('reservation-id-2')
      .mockReturnValueOnce('idempotency-key-3')
      .mockReturnValueOnce('reservation-id-3')

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        requestId: 'reservation-id-1',
        status: 'processing',
        data: {
          reservationToken: 'token-123',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
          reservedBasket: {
            amountPln: 100,
            products: []
          }
        }
      })
    })
  })

  it('should prevent multiple reservation requests on rapid clicks', async () => {
    // Setup basket with items
    useBasketStore.setState({
      basket: [
        {
          _id: 'product-1',
          name: 'Test Product',
          quantity: 2,
          displayPrice: 50,
          stripePriceId: 'price_123',
          image: '/test.jpg',
          slug: 'test-product'
        }
      ]
    })

    // Render checkout button
    render(<CheckoutButton />)

    const button = screen.getByTestId('checkout-button')
    expect(button).toBeEnabled()
    expect(button).toHaveTextContent('Checkout')

    // Click 5 times rapidly (simulating spam clicks)
    const clicks = 5
    for (let i = 0; i < clicks; i++) {
      fireEvent.click(button)
      // Small delay between clicks to simulate rapid clicking
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    // Wait for processing to complete
    await waitFor(() => {
      expect(button).toBeEnabled()
      expect(button).toHaveTextContent('Checkout')
    }, { timeout: 2000 })

    // CRITICAL: Only ONE API call should have been made despite 5 clicks
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Verify the single API call was correct
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/checkout/reserve',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idempotency-key-1'
        }),
        body: expect.stringContaining('product-1')
      })
    )

    // Verify reservation was created only once
    const reservedBasket = useReservedBasketStore.getState().reservedBasket
    expect(reservedBasket).not.toBeNull()
    expect(reservedBasket?.idempotencyKey).toBe('idempotency-key-1')
  })

  it('should allow new reservation after previous one completes', async () => {
    // Setup basket
    useBasketStore.setState({
      basket: [
        {
          _id: 'product-1',
          name: 'Test Product',
          quantity: 1,
          displayPrice: 50,
          stripePriceId: 'price_123',
          image: '/test.jpg',
          slug: 'test-product'
        }
      ]
    })

    // Render button
    render(<CheckoutButton />)
    const button = screen.getByTestId('checkout-button')

    // First click
    fireEvent.click(button)

    // Wait for first reservation to complete
    await waitFor(() => {
      expect(button).toHaveTextContent('Checkout')
    }, { timeout: 2000 })

    // Clear the reserved basket to simulate completion
    useReservedBasketStore.setState({ reservedBasket: null })

    // Wait a bit more than debounce period (1000ms + 100ms buffer)
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Second click should work
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        requestId: 'reservation-id-2',
        status: 'processing',
        data: {
          reservationToken: 'token-456',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
          reservedBasket: {
            amountPln: 50,
            products: []
          }
        }
      })
    })

    fireEvent.click(button)

    // Wait for second reservation
    await waitFor(() => {
      expect(button).toHaveTextContent('Checkout')
    }, { timeout: 2000 })

    // Should have made exactly 2 API calls
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should not make API calls if reservation already exists', async () => {
    // Setup existing reservation
    useReservedBasketStore.setState({
      reservedBasket: {
        reservationToken: 'existing-token',
        idempotencyKey: 'existing-key',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        amountPln: 100,
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

    // Setup basket
    useBasketStore.setState({
      basket: [
        {
          _id: 'product-1',
          name: 'Test Product',
          quantity: 1,
          displayPrice: 50,
          stripePriceId: 'price_123',
          image: '/test.jpg',
          slug: 'test-product'
        }
      ]
    })

    render(<CheckoutButton />)
    const button = screen.getByTestId('checkout-button')

    // Click should not trigger API call
    fireEvent.click(button)

    // Wait a bit to ensure no async call
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockFetch).not.toHaveBeenCalled()
  })
})