"use client";

import React from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export function ProductImage({ image, alt, className, imgClassName, priority = false }: ProductImageProps) {
  // Debug: log actual image structure in development
  console.log('[DEBUG ProductImage] Received image:', JSON.stringify(image, null, 2));
  console.log('[DEBUG ProductImage] image?.asset:', image?.asset);
  console.log('[DEBUG ProductImage] image?.asset?._ref:', image?.asset?._ref);
  console.log('[DEBUG ProductImage] image?.asset?._id:', image?.asset?._id);

  // Get the asset reference - Sanity can use either _ref or _id
  const assetRef = image?.asset?._ref || image?.asset?._id;

  if (!assetRef) {
    return (
      <div className={`aspect-[4/3] bg-surface-productImage rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  // Construct a proper image source object if needed
  const imageSource = image?.asset?._ref ? image : { asset: { _ref: assetRef } };
  const imageUrl = urlFor(imageSource).width(400).height(300).url();

  return (
    <div className={`relative aspect-[4/3] bg-surface-productImage ${className}`} data-testid="product-image">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-cover rounded ${imgClassName || ''}`}
        priority={priority}
      />
    </div>
  );
}
