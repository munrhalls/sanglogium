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
