import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
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
      <ProductGridSkeleton />
    </div>
  );
}
