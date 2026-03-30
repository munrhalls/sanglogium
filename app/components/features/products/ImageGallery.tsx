"use client";

import React from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface ImageGalleryProps {
  images: any[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const mainImage = images?.[0];

  if (!mainImage?.asset?._ref) {
    return (
      <div className="aspect-square bg-gray-200 rounded" data-testid="image-gallery-placeholder">
        <span className="sr-only">No images available</span>
      </div>
    );
  }

  const imageUrl = urlFor(mainImage).width(800).height(800).url();

  return (
    <div className="space-y-4" data-testid="image-gallery">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
