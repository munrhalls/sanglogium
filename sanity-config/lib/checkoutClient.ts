import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const checkoutClient = createClient({
  projectId,
  apiVersion,
  dataset,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
