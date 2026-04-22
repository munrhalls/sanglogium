// Global setup for reservation-ttl tests
// Cleans up ALL test reservations before any tests run to prevent pollution

import { getBackendClient } from '@/sanity/lib/backendClient'

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
