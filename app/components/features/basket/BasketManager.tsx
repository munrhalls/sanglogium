"use client";
import { useShallow } from 'zustand/shallow';
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItemList from "./BasketItemList";
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

  return (
    <div className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3">
      <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
        <div className="card-base overflow-hidden">
          <BasketItemList />
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
