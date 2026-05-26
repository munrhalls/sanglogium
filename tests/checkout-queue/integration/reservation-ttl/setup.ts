// ============================================================================
// ⚠️  LEGACY - DEPRECATED - NO LONGER USED IN ACTIVE CHECKOUT FLOW ⚠️
// ============================================================================
// This checkout-queue system is LEGACY and NOT part of the current checkout implementation.
// 
// Current checkout flow uses:
//   - iron-session for state management (no queue)
//   - Direct Sanity API calls (no Redis queue)
//   - See: app/actions/checkout/index.ts
//
// DO NOT use this code for new features. It exists only for:
//   - Historical reference
//   - Legacy test compatibility
//   - Potential future audit needs
//
// To delete safely: Remove all files in lib/queue/, app/api/checkout-queue/, tests/checkout-queue/
// ============================================================================

// Global setup for reservation-ttl tests
// Cleans up ALL test reservations before any tests run to prevent pollution

import { getBackendClient } from '@/sanity-cms/lib/backendClient'

export async function setup() {
  const sanity = getBackendClient()
  // Clean up ALL test reservations (test-*, spec-*) to prevent pollution
  const existingTestDocs = await sanity.fetch(
    `*[_type == "basketReservation" && (_id match "test-*" || _id match "spec-*")][]._id`
  )
  if (existingTestDocs.length > 0) {
    await sanity.delete({ query: `*[_type == "basketReservation" && (_id match "test-*" || _id match "spec-*")]` })
    console.log(`Cleaned up ${existingTestDocs.length} test reservations`)
  }
}
