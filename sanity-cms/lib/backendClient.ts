// WRITE client for backend operations
// Uses SANITY_STUDIO_READ_WRITE (verified to have create permissions)
// Used for: basket reservations, stock updates, profile operations, orders
import { createClient } from "next-sanity";

import { apiVersion, projectId, dataset } from "../env";

export function getBackendClient() {
  const writeToken = process.env.SANITY_STUDIO_READ_WRITE

  return createClient({
    projectId,
    apiVersion,
    dataset,
    useCdn: false,
    token: writeToken,
  });
}

export const backendClient = getBackendClient();
