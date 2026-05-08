"use client";
import { useShallow } from 'zustand/shallow';
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketView from "./BasketView";
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

  // Hardcoded example CMS Basket Items - generated from actual basket
  const cmsBasketItems: Array<{
    productId: string
    name: string
    displayPrice: number
    availableStock: number
  }> = basket.map((item) => ({
    productId: item.productId,
    name: "Product 1",
    displayPrice: item.displayPriceAtAdd,
    availableStock: item.availableStockAtAdd
  }));

  return (
    <div className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3">
      <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
        <div className="card-base overflow-hidden">
          <BasketView basket={basket} cmsBasketItems={cmsBasketItems} />
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
