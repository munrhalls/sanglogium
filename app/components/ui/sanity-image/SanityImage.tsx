"use client";

import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

export default function SanityImage({
  src,
  alt,
  priority,
  fill,
  sizes,
  className,
}: any) {
  if (!src?.asset) return null;

  const { width, height } = src.asset.metadata.dimensions;

  return (
    <Image
      // 1. Use the Sanity asset ID as the source
      src={src.asset._ref || src.asset._id}
      alt={alt}
      // 2. Custom loader for Sanity CDN resizing
      loader={sanityImageLoader}
      // 3. Keep Next.js layout features
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      className={className}
      sizes={sizes}
      // 4. Instant perception
      placeholder="blur"
      blurDataURL={src.asset.metadata.lqip}
    />
  );
}
