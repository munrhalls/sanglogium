// Cleanup infrastructure for expired basket reservations
// Handles stock release and document deletion for TTL-expired reservations

import { getBackendClient } from '@/sanity-cms/lib/backendClient'

/**
 * Release reservedStock back to available stock
 * @param productId - Product ID to release stock for
 * @param quantity - Quantity to release
 * @returns Success/failure
 */
export async function releaseReservedStock(productId: string, quantity: number): Promise<boolean> {
  try {
    const sanity = getBackendClient()
    const tx = sanity.transaction()
    tx.patch(productId, (p) => p.dec({ reservedStock: quantity }))
    await tx.commit()
    return true
  } catch (error) {
    console.error('Failed to release reserved stock:', error)
    return false
  }
}

/**
 * Delete expired basketReservation document from Sanity
 * @param reservationId - Reservation ID to delete
 * @returns Success/failure
 */
export async function deleteExpiredReservation(reservationId: string): Promise<boolean> {
  try {
    const sanity = getBackendClient()
    await sanity.delete(reservationId)
    return true
  } catch (error) {
    console.error('Failed to delete expired reservation:', error)
    return false
  }
}

/**
 * Find expired basketReservation documents
 * @returns Array of expired reservation documents
 */
export async function findExpiredReservations() {
  try {
    const sanity = getBackendClient()
    const now = new Date().toISOString()
    const expired = await sanity.fetch(
      `*[_type == "basketReservation" && expiresAt < $now]{
        _id,
        basketReservation,
        expiresAt
      }`,
      { now }
    )
    return expired
  } catch (error) {
    console.error('Failed to find expired reservations:', error)
    return []
  }
}

/**
 * Background cleanup job orchestrator
 * Finds expired reservations, releases stock, deletes documents
 * @returns Cleanup results with success/failure counts
 */
export async function backgroundCleanupJob() {
  const results = {
    processed: 0,
    stockReleased: 0,
    documentsDeleted: 0,
    errors: 0,
  }

  try {
    const expired = await findExpiredReservations()
    results.processed = expired.length

    for (const reservation of expired as any[]) {
      try {
        // Release reserved stock for each product in reservation
        for (const item of reservation.basketReservation) {
          const released = await releaseReservedStock(item._id, item.quantity)
          if (released) results.stockReleased++
        }

        // Delete the reservation document
        const deleted = await deleteExpiredReservation(reservation._id)
        if (deleted) results.documentsDeleted++
      } catch (error) {
        console.error(`Failed to cleanup reservation ${reservation._id}:`, error)
        results.errors++
      }
    }
  } catch (error) {
    console.error('Background cleanup job failed:', error)
  }

  return results
}
