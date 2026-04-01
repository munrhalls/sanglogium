"use client";

import React from 'react';
import Image from 'next/image';
import { dataset, projectId } from '@/sanity/lib/api/api';
import urlBuilder from '@sanity/image-url';

const builder = urlBuilder({ projectId, dataset });

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export function ProductImage({ image, alt, className, imgClassName, priority = false }: ProductImageProps) {
  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;
  console.log(assetRef)

  if (!assetRef) {
    return (
      <div className={`aspect-[4/3] bg-surface-productImage rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative aspect-[4/3] bg-surface-productImage ${className}`} data-testid="product-image">
      <Image
        src={assetRef}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-cover rounded ${imgClassName || ''}`}
        priority={priority}
        loader={({ src, width, quality }) => {
          const url = builder
            .image(src)
            .width(width)
            .quality(quality || 75)
            .auto("format")
            .url();
          console.log('Loader URL:', url);
          return url;
        }}
      />
    </div>
  );
}
