"use client";

import React from 'react';
import Image from 'next/image';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ image, alt, className, priority = false }: ProductImageProps) {
  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;
  const lqip: string | null = image?.asset?.metadata?.lqip ?? null;

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
        objectFit="contain"
        priority={priority}
        {...(lqip ? { placeholder: 'blur' as const, blurDataURL: lqip } : {})}
      />
    </div>
  );
}
