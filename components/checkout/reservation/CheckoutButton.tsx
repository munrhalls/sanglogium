'use client'

import { useCallback, useState } from 'react'
import { useBasketStore } from '@/store/store'

export function CheckoutButton() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const basket = useBasketStore((s) => s.basket)

  const handleCheckout = useCallback(async () => {
    if (basket.length === 0) {
      setError('Your basket is empty')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicBasket: basket.map((item) => ({
            _id: item._id,
            quantity: item.quantity,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create checkout session')
        return
      }

      // Redirect to Stripe checkout
      if (result.client_secret) {
        const { loadStripe } = await import('@stripe/stripe-js')
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

        if (stripe) {
          const { error } = await stripe.confirmPayment({
            clientSecret: result.client_secret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/return`,
            },
          })

          if (error) {
            setError(error.message || 'Payment failed')
          }
        }
      }
    } catch {
      setError('Failed to create checkout session')
    } finally {
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
