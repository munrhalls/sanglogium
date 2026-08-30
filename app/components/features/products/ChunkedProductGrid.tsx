import React, { Suspense } from "react";
import { cn } from "@/lib/utils/tailwind";
import { ProductChunk } from "./ProductChunk";
import { ProductChunkSkeleton } from "@/app/components/skeletons/ProductChunkSkeleton";
import { productGridClass } from "./gridLayout";
import { ImageRevealScript } from "./ImageRevealScript";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

export const CHUNK_SIZE = 6;

interface ChunkedProductGridProps {
  chunkPromises: Promise<Product[]>[];
  className?: string;
  wishlistProductIds?: string[];
}

// Renders one continuous responsive grid where each chunk streams in
// independently via its own Suspense boundary, per the confirmed
// streaming-poc mechanism: promises are created (unawaited) by the caller
// and handed down as props, never fetched inside this component.
export function ChunkedProductGrid({
  chunkPromises,
  className,
  wishlistProductIds,
}: ChunkedProductGridProps) {
  return (
    <>
      <ImageRevealScript />
      <div
        data-testid="product-grid"
        className={cn(productGridClass, className)}
      >
        {chunkPromises.map((promise, i) => (
          <Suspense
            key={i}
            fallback={<ProductChunkSkeleton count={CHUNK_SIZE} />}
          >
            <ProductChunk
              promise={promise}
              wishlistProductIds={wishlistProductIds}
              priority={i === 0}
            />
          </Suspense>
        ))}
      </div>
    </>
  );
}
