import { ProductGridSkeleton } from "@/features/products";

/** Reserves the sidebar's width so the grid does not change width when results stream in. */
export function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg-touch:flex-row lg-desktop:flex-row">
      <div aria-hidden="true" className="hidden w-96 shrink-0 lg-touch:block lg-desktop:block" />
      <div className="min-w-0 flex-1">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
