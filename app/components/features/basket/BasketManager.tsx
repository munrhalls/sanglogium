"use client";
import { useShallow } from 'zustand/shallow';
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";

export default function BasketManager() {
  const { items: basket, _hasHydrated: hasHydrated } = useBasketStore(
    useShallow((state) => ({ items: state.items, _hasHydrated: state._hasHydrated }))
  );
  
  if (!hasHydrated) {
    return <BasketSkeleton />;
  }

  if (basket.length === 0) {
    return <EmptyBasket />;
  }

  // TODO: Replace with actual CMS fetch
  const cmsBasketItems: Array<{
    productId: string
    name: string
    displayPrice: number
    availableStock: number
  }> = basket.map((item) => ({
    productId: item.productId,
    name: "Product 1",
    displayPrice: 0,
    availableStock: 99
  }));

  return (
    <div className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3">
      <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
        <div className="card-base overflow-hidden">
          {/* Header row - desktop only */}
          <div className="hidden lg-desktop:grid lg-touch:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] border-b border-border-secondary px-6 py-3">
            <div className="type-caption uppercase tracking-editorial text-secondary-500">Product</div>
            <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Price</div>
            <div className="type-caption uppercase tracking-editorial text-secondary-500 text-center">Quantity</div>
            <div className="type-caption uppercase tracking-editorial text-secondary-500 text-right">Total</div>
          </div>

          {basket
            .map((item) => {
              const cmsItem = cmsBasketItems.find(cms => cms.productId === item.productId);
              if (!cmsItem) return null;
              return (
                <BasketItem
                  key={item.productId}
                  productId={item.productId}
                  name={cmsItem.name}
                  quantity={item.quantity}
                  displayPrice={cmsItem.displayPrice}
                />
              );
            })
            .filter(Boolean)}
        </div>
      </div>
      <div className="lg-desktop:col-span-1 lg-touch:col-span-1">
        <div className="card-base sticky top-4">
          <BasketSummary />
        </div>
      </div>
    </div>
  );
}
