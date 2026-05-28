import urlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity-cms/env";

const builder = urlBuilder({ projectId, dataset });

/**
 * Next.js custom image loader for Sanity CDN images.
 * Receives the requested width from Next.js based on the `sizes` prop
 * and device pixel ratio, then generates the appropriately sized Sanity URL.
 *
 * Usage: Pass as the `loader` prop to next/image, with `src` being the
 * raw Sanity asset reference (e.g., image-abc123-400x400-jpg).
 */
export function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return builder
    .image(src)
    .width(width)
    .quality(quality || 75)
    .auto("format")
    .url();
}
