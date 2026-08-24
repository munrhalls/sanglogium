import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { PaginationSkeleton } from '@/app/components/features/products/Pagination';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { SortAndCountBar } from './SortAndCountBar';
import { ProductRowSkeleton } from './ProductRowSkeleton';
import { PER_PAGE, ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';

export default function CategoryLoading() {
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8">
        <FilterSidebar />
        <main className="min-w-0 w-full pt-6">
          <div className="pb-4">
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
                <li>
                  <span className="type-caption text-caption select-none">/</span>
                </li>
                <li>
                  <span className="type-caption bg-secondary-800 rounded w-20 h-3 animate-pulse inline-block" />
                </li>
              </ol>
            </nav>
            <ShopHeaderSkeleton />
          </div>
          <SortAndCountBar />
          <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
            {Array.from({ length: Math.ceil(PER_PAGE / ROW_SIZE) }).map((_, i) => (
              <ProductRowSkeleton key={i} />
            ))}
          </div>
          <PaginationSkeleton />
        </main>
      </div>
    </div>
  );
}
