// WRITE client for backend operations
// Uses SANITY_STUDIO_READ_WRITE_CREATE (primary) or SANITY_STUDIO_READ_WRITE (fallback)
// Used for: basket reservations, stock updates, profile operations, orders
// SANITY_STUDIO_READ_WRITE_CREATE required for create operations (basketReservation documents)
import { createClient } from "next-sanity";

import { apiVersion, projectId, dataset } from "../env";

export function getBackendClient() {
  const writeToken =
    process.env.SANITY_STUDIO_READ_WRITE_CREATE ||
    process.env.SANITY_STUDIO_READ_WRITE

  return createClient({
    projectId,
    apiVersion,
    dataset,
    useCdn: false,
    token: writeToken,
  });
}

// Named export for backward compatibility
export const backendClient = getBackendClient();
