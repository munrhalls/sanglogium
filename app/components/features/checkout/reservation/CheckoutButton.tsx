'use client'

import { useState } from 'react'
import { initCheckoutSession } from '@/app/actions/checkout'

export interface CheckoutButtonProps {
  basketData?: Array<{
    productId: string;
    quantity: number;
    price_data: { currency: string; unit_amount: number };
    availableStock?: number;
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

// Generate checkoutSessionId on client side
function generateCheckoutSessionId(): string {
  return `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function CheckoutButton({
  basketData,
}: CheckoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allOutOfStock = basketData?.every((item) => item.availableStock === 0) ?? false;
  const disabled = !basketData || basketData.length === 0 || allOutOfStock || isProcessing

  const handleCheckout = async () => {
    if (!basketData || basketData.length === 0) {
      setError('Basket is empty')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Generate checkoutSessionId (traceId) at first click
      const checkoutSessionId = generateCheckoutSessionId()

      // Transform basketData to minimal payload format
      const items = basketData.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      // Call Server Action with checkoutSessionId
      await initCheckoutSession(items, checkoutSessionId)
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
        aria-disabled={disabled}
        className={`btn-primary w-full px-6 py-3 ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span
              data-testid="loading-spinner"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            Processing...
          </span>
        ) : (
          'Checkout'
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-error-500" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
