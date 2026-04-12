// Guest Checkout Inventory Reservation - Retry Button
// Shown after network/server errors
// Uses 1-second deduplication

'use client'

import { useCallback } from 'react'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { useRetryHandler } from './EventDeduplicator'

interface RetryButtonProps {
  onRetry: () => Promise<void>
}

export function RetryButton({ onRetry }: RetryButtonProps) {
  const error = useReservedBasketStore((s) => s.error)

  const handleRetryAction = useCallback(async () => {
    await onRetry()
  }, [onRetry])

  const { handleRetry, isProcessing } = useRetryHandler(handleRetryAction)

  // Only show when there's an error
  if (!error) return null

  return (
    <button
      data-testid="retry-button"
      onClick={handleRetry}
      disabled={isProcessing()}
      aria-label="Retry checkout"
      className="rounded-lg border border-red-300 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isProcessing() ? 'Retrying...' : 'Retry'}
    </button>
  )
}
