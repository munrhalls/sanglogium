'use client'

import { useState } from 'react'
import { initCheckoutSession } from '@/app/actions/checkout'

export interface CheckoutButtonProps {
  basketData?: Array<{
    productId: string;
    quantity: number;
    price_data: { currency: string; unit_amount: number };
    parcel?: {
      length: number;
      width: number;
      height: number;
      weight: number;
      distance_unit: string;
      mass_unit: string;
    };
  }>
}

export function CheckoutButton({
  basketData,
}: CheckoutButtonProps) {
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
      // Transform basketData to minimal payload format
      const items = basketData.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      // Call Server Action to create session and redirect
      await initCheckoutSession(items)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      setError(message)
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
