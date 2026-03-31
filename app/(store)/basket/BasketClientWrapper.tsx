"use client";
import { useBasketStore } from "@/store/store";
import EmptyBasketContent from "./EmptyBasketContent";
import Basket from "./Basket";
import BasketSummary from "./BasketSummary";

export default function BasketClientWrapper() {
  const basket = useBasketStore((s) => s.basket);

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
