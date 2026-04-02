"use client";
import { useBasketStore, selectHasHydrated } from "@/store/store";
import EmptyBasketContent from "./EmptyBasketContent";
import Basket from "./Basket";
import BasketSummary from "./BasketSummary";

export default function BasketClientWrapper() {
  const basket = useBasketStore((s) => s.basket);
  const hasHydrated = useBasketStore(selectHasHydrated);

  // Show skeleton while hydrating to prevent flash of empty state
  if (!hasHydrated) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card-base overflow-hidden p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="card-base sticky top-4 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (basket?.length === 0) {
    return <EmptyBasketContent />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="card-base overflow-hidden">
          <Basket />
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="card-base sticky top-4">
          <BasketSummary />
        </div>
      </div>
    </div>
  );
}
