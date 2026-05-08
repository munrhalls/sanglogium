// Final SanityImage implementation
import Image from "next/image";
import { dataset, projectId } from "@/sanity-cms/lib/api/api";
import urlBuilder from "@sanity/image-url";

const builder = urlBuilder({ projectId, dataset });

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
      // 2. Delegate resizing to Sanity's CDN
      loader={({ src, width, quality }) =>
        builder
          .image(src)
          .width(width)
          .quality(quality || 75)
          .auto("format")
          .url()
      }
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
