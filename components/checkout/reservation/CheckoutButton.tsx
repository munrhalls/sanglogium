'use client'

import { useCallback, useState } from 'react'
import { useBasketStore } from '@/store/store'
import { useRouter } from 'next/navigation'

export function CheckoutButton() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const basket = useBasketStore((s) => s.basket)

  const handleCheckout = useCallback(async () => {
    console.log('TRACE: User clicked checkout button', { basketLength: basket.length })

    if (basket.length === 0) {
      console.log('TRACE: Basket empty, aborting checkout')
      setError('Your basket is empty')
      return
    }

    console.log('TRACE: Setting processing state to true')
    setIsProcessing(true)
    setError(null)

    try {
      const validItems = basket.filter((item) => item.stripePriceId && item.stripePriceId.length > 0)
      if (validItems.length === 0) {
        console.log('TRACE: No valid items with stripePriceId, aborting checkout')
        setError('No valid items in basket')
        return
      }

      const requestBody = {
        basketReservation: validItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
          stripePriceId: item.stripePriceId,
          displayPrice: item.displayPrice,
        })),
        createdAt: new Date().toISOString(),
      }
      console.log('TRACE: API request formation', { endpoint: '/api/checkout-queue', body: requestBody })

      const response = await fetch('/api/checkout-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('TRACE: API response received', { status: response.status, ok: response.ok })

      const result = await response.json()
      console.log('TRACE: Data parsed', { result })

      if (!response.ok || !result.ok) {
        console.log('TRACE: Checkout failed', { responseOk: response.ok, resultOk: result.ok, error: result.error })
        setError(result.error || 'Failed to process checkout')
        return
      }

      // Success - queue processed the request
      console.log('TRACE: Checkout queued successfully', { reservationId: result.reservationId })

      // Save reservationId to sessionStorage
      sessionStorage.setItem('basketReservationId', result.reservationId)

      setError(null)
      router.push('/checkout')
    } catch (error) {
      console.log('TRACE: Error occurred', { error })
      setError('Failed to process checkout')
    } finally {
      console.log('TRACE: Setting processing state to false')
      setIsProcessing(false)
    }
  }, [basket])

  const disabled = isProcessing || basket.length === 0

  return (
    <>
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

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
