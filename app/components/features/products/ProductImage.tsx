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
  const [loaded, setLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // onLoad doesn't fire for images the browser already has cached, which would leave
  // the LQIP layer showing forever - catch that case on mount via .complete.
  React.useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

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

  // Nothing to crossfade from when there's no LQIP - show the photo at full opacity.
  const showReal = loaded || !lqip;

  return (
    <div className={`relative w-full h-full ${className || ''}`} data-testid="product-image">
      {lqip && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${lqip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-testid="product-image-lqip"
        />
      )}
      <Image
        ref={imgRef}
        src={assetRef}
        loader={sanityImageLoader}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-contain mix-blend-multiply transition-transform duration-700 ${showReal ? 'opacity-100' : 'opacity-0'}`}
        // extends the existing transform transition with an opacity leg; the hover-scale
        // timing (700ms, Tailwind's default ease) is preserved exactly as the first entry.
        style={{
          transitionProperty: 'transform, opacity',
          transitionDuration: '700ms, 450ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1), ease-out',
        }}
        priority={priority}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
