"use server";

/**
 * Release inventory lock for RESET from SUCCESS state
 * This is a fire-and-forget operation to clean up reserved stock
 * when user navigates away from successful checkout
 */

import { checkoutClient } from "../../../sanity/lib/checkoutClient";

export async function releaseInventoryLock(
  idempotencyKey: string
): Promise<void> {
  try {
    // TODO: Implement actual inventory lock release logic
    // For now, this is a stub that would:
    // 1. Find reservations by idempotencyKey
    // 2. Decrement reservedStock for each reservation
    // 3. Use checkoutClient.transaction() for atomicity

    // Example implementation (when idempotencyKey tracking is added):
    const transaction = checkoutClient.transaction();
    // const reservations = await findReservationsByKey(idempotencyKey);
    // for (const reservation of reservations) {
    //   transaction.patch(reservation.productId, (p) =>
    //     p.dec({ reservedStock: reservation.quantity })
    //   );
    // }
    await transaction.commit();

    console.log('releaseInventoryLock called with:', idempotencyKey);
  } catch (error) {
    // Fire-and-forget: swallow error. Inngest expiry is safety net.
    console.error('Failed to release inventory lock:', error);
    // Never throw to client
  }
}
