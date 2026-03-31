"use client";

import React from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface ProductImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ image, alt, className, priority = false }: ProductImageProps) {
  if (!image?.asset?._ref) {
    return (
      <div className={`aspect-[4/3] bg-surface-productImage rounded ${className}`} data-testid="product-image-placeholder">
        <span className="sr-only">No image</span>
      </div>
    );
  }

  const imageUrl = urlFor(image).width(400).height(300).url();

  return (
    <div className={`relative aspect-[4/3] bg-surface-productImage ${className}`} data-testid="product-image">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover rounded"
        priority={priority}
      />
    </div>
  );
}
