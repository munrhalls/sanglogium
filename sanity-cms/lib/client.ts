// READ-ONLY client for public/frontend access
// No token required - uses CDN for performance
// Used for: product catalog, homepage components, public queries
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview",
    studioUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/studio`
      : "http://localhost:3000/studio",
  },
  perspective: "published",
});

// WRITE client for backend atomic operations
// Uses SANITY_STUDIO_READ_WRITE_CREATE (preferred) or SANITY_API_TOKEN (fallback)
// Used for: basket reservations, stock updates, profile operations
const writeToken = process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN;

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for writes
  token: writeToken,
});


const builder = imageUrlBuilder(client);

// Helper to generate image URLs from Sanity source
export function urlFor(source: any) {
  return builder.image(source);
}

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
}: {
  query: string;
  params?: any;
}): Promise<QueryResponse> {
  return client.fetch<QueryResponse>(query, params);
}
