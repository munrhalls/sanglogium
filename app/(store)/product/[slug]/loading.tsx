import { ProductDetail } from '@/app/components/features/products/ProductDetail';

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="lg:w-1/2">
          <div className="aspect-square bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="lg:w-1/2 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-24 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
