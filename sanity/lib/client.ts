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

// Write-enabled client for atomic operations
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for writes
  token: process.env.SANITY_API_TOKEN,
});

// Debug: Verify token is loaded
console.log('WriteClient token loaded:', process.env.SANITY_API_TOKEN ? 'YES' : 'NO');
console.log('WriteClient projectId:', projectId);
console.log('WriteClient dataset:', dataset);

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
