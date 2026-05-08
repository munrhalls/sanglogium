'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface CheckoutButtonProps {
  basketData?: Array<{ productId: string; quantity: number; price_data: { currency: string; unit_amount: number } }>
}

export function CheckoutButton({
  basketData,
}: CheckoutButtonProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = !basketData || basketData.length === 0 || isProcessing

  const handleCheckout = async () => {
    if (!basketData || basketData.length === 0) {
      setError('Basket is empty')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Transform basketData to BasketReservation format
      const basketReservation = basketData.map(item => ({
        _id: item.productId,
        quantity: item.quantity,
        price_data: item.price_data
      }))

      const payload = {
        basketReservation,
        createdAt: new Date().toISOString()
      }

      // Call checkout-queue API
      const response = await fetch('/api/checkout-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Checkout failed' }))
        throw new Error(errorData.error || 'Checkout failed')
      }

      const result = await response.json()

      // Save reservationId to sessionStorage
      if (result.reservationId) {
        sessionStorage.setItem('basketReservationId', result.reservationId)
      }

      // Redirect to checkout
      router.push('/checkout')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

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
