import React, { Suspense } from "react";
import { cn } from "@/lib/utils/tailwind";
import { ProductChunk } from "./ProductChunk";
import { ProductChunkSkeleton } from "./ProductChunkSkeleton";
import { productGridClass } from "../../config/gridLayout";
import { ImageRevealScript } from "../card/ImageRevealScript";
import { ImageRevealClient } from "../card/ImageRevealClient";
import type { Product } from "../../domain/productTypes";

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
      <ImageRevealClient />
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
