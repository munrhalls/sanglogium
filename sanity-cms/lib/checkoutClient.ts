// WRITE client for checkout operations
// Uses SANITY_API_TOKEN for webhook and checkout API operations
// Used for: stock release after checkout, product fetching during checkout
import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const checkoutClient = createClient({
  projectId,
  apiVersion,
  dataset,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
