export default function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 py-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-4 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-4 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="lg:w-1/2 space-y-4">
          <div className="aspect-square bg-surface-elevated rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
            <div className="w-20 h-20 bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="lg:w-1/2 space-y-6">
          {/* Brand */}
          <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
          {/* Name */}
          <div className="h-10 w-3/4 bg-surface-elevated rounded animate-pulse" />
          {/* Price */}
          <div className="h-6 w-32 bg-surface-elevated rounded animate-pulse" />
          {/* Stock */}
          <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />

          {/* Overview fields */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-secondary">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
              <div className="h-4 w-24 bg-surface-elevated rounded animate-pulse" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-surface-elevated rounded animate-pulse" />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 bg-surface-elevated rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-surface-elevated rounded animate-pulse" />
                <div className="w-12 h-10 bg-surface-elevated rounded animate-pulse" />
                <div className="w-10 h-10 bg-surface-elevated rounded animate-pulse" />
              </div>
            </div>
            <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Specifications Section Skeleton */}
      <div className="mt-12 pt-8 border-t border-border-secondary">
        <div className="h-8 w-32 bg-surface-elevated rounded animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
          <div className="h-12 w-full bg-surface-elevated rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
