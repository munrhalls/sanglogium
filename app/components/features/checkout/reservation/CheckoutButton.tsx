'use client'

export interface CheckoutButtonProps {
  disabled?: boolean
  isProcessing?: boolean
  error?: string | null
  onClick?: () => void
  basketData?: Array<{ productId: string; quantity: number; price_data: { currency: string; unit_amount: number } }>
}

export function CheckoutButton({
  disabled = false,
  isProcessing = false,
  error = null,
  onClick,
  basketData,
}: CheckoutButtonProps) {
  return (
    <>
      <button
        data-testid="checkout-button"
        onClick={onClick}
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
