// Guest Checkout Inventory Reservation - Cancel Button
// Opens confirmation dialog before rollback
// Uses 1-second deduplication

'use client'

import { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { useCancelHandler } from './EventDeduplicator'
import { ConfirmDialog } from './ConfirmDialog'

export function CancelButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const reservedBasket = useReservedBasketStore((s) => s.reservedBasket)
  const clearReservedBasket = useReservedBasketStore((s) => s.clearReservedBasket)
  const setLoading = useReservedBasketStore((s) => s.setLoading)
  const setError = useReservedBasketStore((s) => s.setError)

  const performRollback = useCallback(async () => {
    if (!reservedBasket) return

    setIsCancelling(true)
    setShowConfirm(false)
    setLoading(true)

    try {
      const idempotencyKey = uuidv4()

      await fetch('/api/checkout/rollback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          reservationToken: reservedBasket.reservationToken,
          products: reservedBasket.products.map((p) => ({
            id: p.id,
            reservedQuantity: p.reservedQuantity,
          })),
        }),
      })

      clearReservedBasket()
    } catch {
      setError('Failed to cancel reservation')
    } finally {
      setIsCancelling(false)
      setLoading(false)
    }
  }, [reservedBasket, clearReservedBasket, setLoading, setError])

  const { handleCancel } = useCancelHandler(async () => {
    setShowConfirm(true)
  })

  if (!reservedBasket) return null

  return (
    <>
      <button
        data-testid="cancel-button"
        onClick={handleCancel}
        disabled={isCancelling}
        aria-label="Cancel reservation"
        className={`rounded-lg border px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isCancelling
            ? 'cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
        }`}
      >
        {isCancelling ? 'Cancelling...' : 'Cancel'}
      </button>

      <ConfirmDialog
        open={showConfirm}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this reservation? Your reserved items will be released."
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep"
        onConfirm={performRollback}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
