// Guest Checkout Inventory Reservation - Checkout Button
// Initiates reservation flow with 1-second deduplication
// Handles: idle, processing, disabled states

'use client'

import { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { useBasketStore } from '@/store/store'
import { useCheckoutHandler } from './EventDeduplicator'
import type { ReservedBasket } from '@/store/checkout/reservedBasketSlice'

export function CheckoutButton() {
  const [isProcessing, setIsProcessing] = useState(false)

  const basket = useBasketStore((s) => s.basket)
  const reservedBasket = useReservedBasketStore((s) => s.reservedBasket)
  const setReservedBasket = useReservedBasketStore((s) => s.setReservedBasket)
  const setLoading = useReservedBasketStore((s) => s.setLoading)
  const setError = useReservedBasketStore((s) => s.setError)

  const handleCheckoutAction = useCallback(async () => {
    // Bus Stop 1: Button Click Handler
    console.log('TRACE: Checkout button clicked', {
      requestId: uuidv4(),
      idempotencyKey: uuidv4(),
      timestamp: Date.now()
    });

    // Validate basket not empty
    if (basket.length === 0) {
      setError('Your basket is empty')
      return
    }

    // If reservation already exists, don't create new one
    if (reservedBasket) {
      return
    }

    setIsProcessing(true)
    setLoading(true)
    setError(null)

    try {
      const idempotencyKey = uuidv4()

      // Bus Stop 2: Request Formation
      const requestPayload = {
        clientBasket: {
          products: basket.map((item) => ({
            id: item._id,
            stripePriceId: item.stripePriceId || '',
            quantity: item.quantity,
          })),
          totalAmount: basket.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0),
          currency: 'PLN',
        },
      };

      console.log('TRACE: Queue request formed', {
        request: {
          idempotencyKey,
          payloadKeys: Object.keys(requestPayload),
          clientBasketKeys: Object.keys(requestPayload.clientBasket),
          productCount: requestPayload.clientBasket.products.length,
          totalAmount: requestPayload.clientBasket.totalAmount,
          currency: requestPayload.clientBasket.currency,
        }
      });

      // Bus Stop 3: API Call Initiation
      console.log('TRACE: API call initiated', {
        url: '/api/checkout/reserve',
        method: 'POST',
        bodySize: JSON.stringify(requestPayload).length,
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }
      });

      const response = await fetch('/api/checkout/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(requestPayload),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error?.message || 'Failed to create reservation')
        return
      }

      // Map API response to ReservedBasket
      const data = result.data
      const reserved: ReservedBasket = {
        reservationToken: data.reservationToken,
        idempotencyKey,
        expiresAt: data.expiresAt,
        amountPln: data.reservedBasket?.amountPln ?? 0,
        products: data.reservedBasket?.products ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setReservedBasket(reserved)
    } catch {
      setError('Failed to create reservation')
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }, [basket, reservedBasket, setReservedBasket, setLoading, setError])

  const { handleCheckout } = useCheckoutHandler(handleCheckoutAction)

  const disabled = isProcessing || basket.length === 0

  return (
    <button
      data-testid="checkout-button"
      onClick={handleCheckout}
      disabled={disabled}
      aria-label="Checkout button"
      aria-disabled={disabled}
      role="button"
      className={`w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled
          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
          : 'bg-black text-white hover:bg-gray-800 focus:ring-black'
      }`}
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <span
            data-testid="loading-spinner"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
          Processing...
        </span>
      ) : (
        'Checkout'
      )}
    </button>
  )
}
