"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
  /** Fired once the photo is ready to be shown (or when there is nothing to load). */
  onLoad?: () => void;
}

export function ProductImage({ image, alt, className, priority = false, onLoad }: ProductImageProps) {
  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;

  // No asset to fetch: there is nothing to wait for, so report ready immediately.
  useEffect(() => {
    if (!assetRef) onLoad?.();
  }, [assetRef, onLoad]);

  if (!assetRef) {
    return (
      <div className={`aspect-[4/3] bg-surface-productImage rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`} data-testid="product-image">
      <Image
        src={assetRef}
        loader={sanityImageLoader}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-contain mix-blend-multiply transition-transform duration-700"
        priority={priority}
        onLoad={onLoad}
        // A failed image must not leave the card stuck in its skeleton forever.
        onError={onLoad}
      />
    </div>
  );
}
