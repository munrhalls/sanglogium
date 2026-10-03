"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { sanityImageLoader } from '@/lib/utils/sanityImageLoader';

interface ImageGalleryProps {
  images: any[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Filter valid images
  const validImages = images?.filter((img) => img?.asset?._ref) || [];

  // Handle keyboard events for modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsZoomOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isZoomOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isZoomOpen, handleKeyDown]);

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-surface-productImage rounded-lg flex items-center justify-center" data-testid="image-gallery-placeholder">
        <span className="sr-only">No images available</span>
        <svg className="w-16 h-16 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const mainImage = validImages[selectedIndex];
  const mainImageRef = mainImage?.asset?._ref || mainImage?.asset?._id;

  return (
    <>
      <div className="space-y-4" data-testid="image-gallery">
        {/* Main Image */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="relative aspect-square lg-touch:aspect-[4/3] bg-surface-productImage rounded-lg overflow-hidden w-full max-w-[520px] lg-touch:max-w-[380px] mx-auto block cursor-zoom-in group"
          aria-label={`View ${productName} image ${selectedIndex + 1} in full size`}
        >
          <figure className="w-full h-full">
            <Image
              src={mainImageRef}
              loader={sanityImageLoader}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority={selectedIndex === 0}
            />
          </figure>
        </button>

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {validImages.map((image, index) => {
              const thumbRef = image?.asset?._ref || image?.asset?._id;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-brand-800'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={isSelected}
                >
                  <Image
                    src={thumbRef}
                    loader={sanityImageLoader}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} - Full size image`}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 transition-opacity duration-200 ease-out" />

          {/* Modal Content */}
          <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-sm text-body hover:text-primary transition-colors duration-150"
              aria-label="Close zoom view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Zoomed Image */}
            <figure
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mainImageRef}
                loader={sanityImageLoader}
                alt={`${productName} - Full size image ${selectedIndex + 1}`}
                width={1600}
                height={1600}
                className="object-contain max-w-[90vw] max-h-[90vh] w-auto h-auto"
                sizes="90vw"
                priority
              />
            </figure>
          </div>
        </div>
      )}
    </>
  );
}
