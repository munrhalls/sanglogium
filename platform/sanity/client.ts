// READ-ONLY client for public/frontend access
// No token required - uses CDN for performance
// Used for: product catalog, homepage components, public queries
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

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

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  next,
}: {
  query: string;
  params?: any;
  /** Next.js Data Cache options. Omitted = the fetch is not cached. */
  next?: { revalidate?: number | false; tags?: string[] };
}): Promise<QueryResponse> {
  return next
    ? client.fetch<QueryResponse>(query, params, { next })
    : client.fetch<QueryResponse>(query, params);
}
