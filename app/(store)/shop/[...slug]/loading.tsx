import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
import { ShopHeaderSkeleton } from '@/app/components/features/products/ShopHeaderSkeleton';
import { ProductGridSkeleton } from '@/app/components/features/products/ProductGridSkeleton';

// Default skeleton count while loading
const DEFAULT_SKELETON_COUNT = 12;

export default function CategoryLoading() {
  return (
    <ShopLayout>
      <ShopHeaderSkeleton />
      <ProductGridSkeleton count={DEFAULT_SKELETON_COUNT} />
    </ShopLayout>
  );
}
