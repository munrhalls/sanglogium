"use client"; // Loaders run on client-side navigation

import { ImageLoaderProps } from "next/image";

export default function sanityLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  // src is expected to be the base URL from Sanity
  return `${src}?w=${width}&q=${quality || 75}&auto=format`;
}
