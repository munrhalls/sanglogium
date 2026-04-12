// Guest Checkout Inventory Reservation - Approve & Proceed Button
// Shown only when basket has stock decrements (reservedQuantity < requestedQuantity)
// User explicitly approves the adjusted basket

'use client'

import { useCallback } from 'react'
import { useReservedBasketStore } from '@/store/checkout/reservedBasketSlice'
import { useApproveHandler } from './EventDeduplicator'

interface ApproveButtonProps {
  onApprove: () => void | Promise<void>
}

export function ApproveButton({ onApprove }: ApproveButtonProps) {
  const reservedBasket = useReservedBasketStore((s) => s.reservedBasket)
  const basketStatus = useReservedBasketStore((s) => s.basketStatus)

  const handleApproveAction = useCallback(async () => {
    await onApprove()
  }, [onApprove])

  const { handleApprove, isProcessing } = useApproveHandler(handleApproveAction)

  // Only show when basket is decremented (not empty, not full)
  if (!reservedBasket || basketStatus !== 'decremented') return null

  return (
    <button
      data-testid="approve-button"
      onClick={handleApprove}
      disabled={isProcessing()}
      aria-label="Approve and proceed with adjusted basket"
      className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-green-300"
    >
      {isProcessing() ? 'Processing...' : 'Approve & Proceed'}
    </button>
  )
}
