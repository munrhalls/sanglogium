import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6" data-testid="breadcrumb-skeleton">
        <ol className="flex items-center gap-2">
          <li>
            <span className="type-caption bg-secondary-800 rounded w-10 h-3 animate-pulse inline-block" />
          </li>
          <li>
            <span className="type-caption text-caption select-none">/</span>
          </li>
          <li>
            <span className="type-caption bg-secondary-800 rounded w-16 h-3 animate-pulse inline-block" />
          </li>
        </ol>
      </nav>
      <ShopHeaderSkeleton />
      {/* Mirror the loaded layout's flex row + fixed sidebar column so the
          skeleton grid gets the same width (and column count) it will have
          once results arrive — no CLS on hydration. */}
      <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
        <div
          aria-hidden="true"
          className="hidden lg-touch:block lg-desktop:block w-64 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
