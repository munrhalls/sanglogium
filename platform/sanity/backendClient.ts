import "server-only";
// WRITE client for backend operations
// Uses SANITY_STUDIO_READ_WRITE (verified to have create permissions)
// Used for: stock updates, profile operations, orders
import { createClient } from "next-sanity";

import { apiVersion, projectId, dataset } from "./env";

export const backendClient = createClient({
  projectId,
  apiVersion,
  dataset,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
