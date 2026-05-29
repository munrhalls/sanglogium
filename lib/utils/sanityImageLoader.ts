import urlBuilder from "@sanity/image-url";
import { dataset, projectId } from "@/sanity-cms/env";

const builder = urlBuilder({ projectId, dataset });

function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Pass through plain URLs (e.g., Unsplash, external images, GridMediaBox)
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }
  // Sanity asset ref: generate optimized CDN URL
  return builder
    .image(src)
    .width(width)
    .quality(quality || 75)
    .auto("format")
    .url();
}

// Named export for manual URL building (e.g., <source srcSet>)
export { sanityImageLoader };

// Default export — Next.js global custom loader via images.loaderFile
export default sanityImageLoader;
