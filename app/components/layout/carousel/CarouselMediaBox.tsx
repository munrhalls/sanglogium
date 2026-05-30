"use client";

import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

interface CarouselMediaBoxProps {
  src: any;
  alt: string;
  priority?: boolean;
}

export default function CarouselMediaBox({ src, alt, priority }: CarouselMediaBoxProps) {
  if (!src) return <div className="bg-secondary-100 aspect-square w-full animate-pulse rounded-sm" />;

  const isStringUrl = typeof src === "string";
  const imageRef = isStringUrl ? src : (src?.asset?._ref || src?.asset?._id);

  return (
    <div className="relative aspect-square w-full overflow-hidden">
      <Image
        src={imageRef}
        loader={isStringUrl ? undefined : sanityImageLoader}
        alt={alt || "Product image"}
        fill
        sizes="(max-width: 768px) 40vw, 20vw"
        className="object-contain transition-transform duration-700 group-hover:scale-105"
        priority={priority}
      />
    </div>
  );
}
