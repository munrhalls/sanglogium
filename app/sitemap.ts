import { MetadataRoute } from "next";
import { getSitemapEntries } from "@/features/products/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
