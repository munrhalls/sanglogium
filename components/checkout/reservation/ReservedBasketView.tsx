// Guest Checkout Inventory Reservation - Reserved Basket View
// Renders all five UI states from PRD:
// 1. full       - All items reserved at requested quantity → Proceed button
// 2. decremented - Some items have reduced quantity → Approve + Cancel
// 3. empty      - All items out of stock → Cancel only
// 4. error      - API/network error → Retry + Cancel
// 5. loading    - Processing → Spinner

'use client'

import { useCallback } from 'react'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { CheckoutButton } from './CheckoutButton'
import { CancelButton } from './CancelButton'
import { ApproveButton } from './ApproveButton'
import { RetryButton } from './RetryButton'

interface ReservedBasketViewProps {
  onProceed: () => void
}

export function ReservedBasketView({ onProceed }: ReservedBasketViewProps) {
  const reservedBasket = useReservedBasketStore((s) => s.reservedBasket)
  const basketStatus = useReservedBasketStore((s) => s.basketStatus)
  const isLoading = useReservedBasketStore((s) => s.isLoading)
  const error = useReservedBasketStore((s) => s.error)
  const setError = useReservedBasketStore((s) => s.setError)
  const setReservedBasket = useReservedBasketStore((s) => s.setReservedBasket)

  const handleRetry = useCallback(async () => {
    setError(null)
    // Re-trigger checkout by clearing the reserved basket
    // The CheckoutButton will create a new reservation
    setReservedBasket(null)
  }, [setError, setReservedBasket])

  // ========================================================================
  // State: No reservation yet → Show checkout button
  // ========================================================================
  if (!reservedBasket && !error) {
    return (
      <div data-testid="reservation-idle" className="space-y-4">
        <CheckoutButton />
      </div>
    )
  }

  // ========================================================================
  // State: Error → Show error message + retry
  // ========================================================================
  if (error) {
    return (
      <div data-testid="reservation-error" className="space-y-4">
        <div
          data-testid="error-message"
          className="rounded-lg border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
        <div className="flex gap-3">
          <RetryButton onRetry={handleRetry} />
          <CancelButton />
        </div>
        <CheckoutButton />
      </div>
    )
  }

  // ========================================================================
  // State: Loading → Show spinner
  // ========================================================================
  if (isLoading) {
    return (
      <div data-testid="reservation-loading" className="flex items-center justify-center py-8">
        <div
          data-testid="loading-spinner"
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"
          aria-label="Loading reservation"
        />
      </div>
    )
  }

  if (!reservedBasket) return null

  // ========================================================================
  // State: Empty (all products out of stock)
  // ========================================================================
  if (basketStatus === 'empty') {
    return (
      <div data-testid="reservation-empty" className="space-y-4">
        <div data-testid="reserved-basket" className="rounded-lg border border-gray-200 p-4">
          <div
            data-testid="out-of-stock-message"
            className="rounded-lg border border-orange-200 bg-orange-50 p-4"
            role="alert"
          >
            <p className="text-sm font-medium text-orange-800">
              We apologize - these products are out of stock.
            </p>
          </div>

          <ProductList products={reservedBasket.products} />
        </div>

        <div className="flex gap-3">
          <CancelButton />
        </div>
      </div>
    )
  }

  // ========================================================================
  // State: Decremented (some items have reduced quantity)
  // ========================================================================
  if (basketStatus === 'decremented') {
    return (
      <div data-testid="reservation-decremented" className="space-y-4">
        <div data-testid="reserved-basket" className="rounded-lg border border-gray-200 p-4">
          <div
            data-testid="decrement-message"
            className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
            role="alert"
          >
            <p className="text-sm font-medium text-yellow-800">
              We&apos;ve had to revise your basket based on latest inventory check.
            </p>
          </div>

          <ProductList products={reservedBasket.products} />

          <div className="mt-4 border-t pt-4">
            <p className="text-lg font-semibold">
              Total: {(reservedBasket.amountPln / 100).toFixed(2)} PLN
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <ApproveButton onApprove={onProceed} />
          <CancelButton />
        </div>
      </div>
    )
  }

  // ========================================================================
  // State: Full (all items reserved at requested quantity)
  // ========================================================================
  return (
    <div data-testid="reservation-full" className="space-y-4">
      <div data-testid="reserved-basket" className="rounded-lg border border-gray-200 p-4">
        <ProductList products={reservedBasket.products} />

        <div className="mt-4 border-t pt-4">
          <p className="text-lg font-semibold">
            Total: {(reservedBasket.amountPln / 100).toFixed(2)} PLN
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          data-testid="proceed-button"
          onClick={onProceed}
          aria-label="Proceed to next step"
          className="flex-1 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Proceed to Next Step
        </button>
        <CancelButton />
      </div>

      <ExpiryTimer expiresAt={reservedBasket.expiresAt} />
    </div>
  )
}

// ============================================================================
// Product List Sub-Component
// ============================================================================

function ProductList({ products }: { products: Array<{
  id: string
  name: string
  requestedQuantity: number
  reservedQuantity: number
  pricePln: number
  totalPricePln: number
  imageUrl: string | null
  slug: string
  brand: { name: string }
}> }) {
  return (
    <ul className="divide-y divide-gray-100" data-testid="reserved-products-list">
      {products.map((product) => {
        const isDecremented = product.reservedQuantity < product.requestedQuantity
        const isOutOfStock = product.reservedQuantity === 0

        return (
          <li
            key={product.id}
            data-testid={`reserved-product-${product.id}`}
            className="flex items-center gap-4 py-3"
          >
            {product.imageUrl && (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.brand.name}</p>

              <div className="mt-1 flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="text-xs font-medium text-red-600">Out of stock</span>
                ) : isDecremented ? (
                  <span className="text-xs text-yellow-700">
                    {product.reservedQuantity} of {product.requestedQuantity} available
                  </span>
                ) : (
                  <span className="text-xs text-gray-600">
                    Qty: {product.reservedQuantity}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {(product.totalPricePln / 100).toFixed(2)} PLN
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// ============================================================================
// Expiry Timer Sub-Component
// ============================================================================

function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const remainingMs = expiryDate.getTime() - now.getTime()
  const remainingMinutes = Math.max(0, Math.ceil(remainingMs / 60000))

  if (remainingMinutes <= 0) {
    return (
      <div
        data-testid="timeout-message"
        className="rounded-lg border border-red-200 bg-red-50 p-3 text-center"
        role="alert"
      >
        <p className="text-sm text-red-700">Reservation expired. Please try again.</p>
      </div>
    )
  }

  return (
    <div
      data-testid="expiry-timer"
      className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center"
    >
      <p className="text-sm text-blue-700">
        Reservation expires in {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
