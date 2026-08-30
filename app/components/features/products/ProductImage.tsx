import React from "react";
import Image from "next/image";
import styles from "./reveal.module.css";

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({
  image,
  alt,
  className,
  priority = false,
}: ProductImageProps) {
  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;
  const lqip: string | null = image?.asset?.metadata?.lqip ?? null;
  const isOpaque: boolean | null = image?.asset?.metadata?.isOpaque ?? null;
  // Blur-up placeholder only for opaque photos — a transparent PNG would let
  // the blurred LQIP bleed through its transparent regions, so those fall back
  // to the flat surface colour (streaming-poc parity).
  const showLqip = lqip !== null && isOpaque !== false;

  if (!assetRef) {
    return (
      <div
        className={`rounded aspect-[4/3] bg-surface-productImage ${className}`}
        data-testid="product-image-placeholder"
      >
        <span className="sr-only">No image</span>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full ${styles.wrap} ${className || ""}`}
      data-testid="product-image"
    >
      {showLqip && (
        <div
          aria-hidden
          className={styles.lqip}
          style={{ backgroundImage: `url("${lqip}")` }}
        />
      )}
      <Image
        src={assetRef}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-contain mix-blend-multiply ${styles.reveal}`}
        priority={priority}
        data-reveal=""
      />
    </div>
  );
}
