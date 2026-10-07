import React, { Suspense } from "react";
import { cn } from "@/platform/utils/tailwind";
import { ProductChunkSkeleton } from "./ProductChunkSkeleton";
import { productGridClass, CHUNK_SIZE } from "@/features/products/core/definitions/gridLayout";
import { ImageRevealScript } from "@/features/products/ui/card/ImageRevealScript";
import { ImageReveal } from "@/features/products/ui/card/ImageReveal";

export { CHUNK_SIZE };

interface ChunkedProductGridProps {
  // One rendered <ProductChunk /> element per chunk promise — the caller
  // (a view) maps promises to elements so this stays a presentational
  // wrapper and ui/ never imports view/.
  chunks: React.ReactNode[];
  className?: string;
}

// Renders one continuous responsive grid where each chunk streams in
// independently via its own Suspense boundary, per the confirmed
// streaming-poc mechanism: chunk elements are created (unawaited) by the
// caller and handed down as props, never fetched inside this component.
export function ChunkedProductGrid({
  chunks,
  className,
}: ChunkedProductGridProps) {
  return (
    <>
      <ImageRevealScript />
      <ImageReveal />
      <div
        data-testid="product-grid"
        className={cn(productGridClass, className)}
      >
        {chunks.map((chunk, i) => (
          <Suspense
            key={i}
            fallback={<ProductChunkSkeleton count={CHUNK_SIZE} />}
          >
            {chunk}
          </Suspense>
        ))}
      </div>
    </>
  );
}
