import { createClient } from "next-sanity";

import { apiVersion, projectId, dataset } from "../env";

export function getBackendClient() {
  const writeToken =
    process.env.SANITY_STUDIO_READ_WRITE ||
    process.env.SANITY_STUDIO_READ_WRITE_CREATE

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
