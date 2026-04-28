"use client";
import { useBasketStore, selectHasHydrated } from "@/store/store";
import EmptyBasketContent from "./EmptyBasketContent";
import Basket from "./Basket";
import BasketSummary from "./BasketSummary";
import { useEffect, useState } from "react";
import { fetchBasketProducts } from "@/app/actions/basket";
import { BasketItem } from "./basket.types";
import { urlFor } from "@/sanity/lib/image";

export default function BasketClientWrapper() {
  const basket = useBasketStore((s) => s.basket);
  const hasHydrated = useBasketStore(selectHasHydrated);
  const setBasket = useBasketStore((s) => s.setBasket);
  const [isFetchingFresh, setIsFetchingFresh] = useState(false);

  useEffect(() => {
    const fetchFreshData = async () => {
      if (!hasHydrated || basket.length === 0 || isFetchingFresh) return;

      setIsFetchingFresh(true);
      const ids = basket.map((item) => item._id);
      const freshProducts = await fetchBasketProducts(ids);

      // Merge fresh product data with persisted quantities
      const mergedBasket: BasketItem[] = freshProducts.map((product) => {
        const persistedItem = basket.find((item) => item._id === product._id);
        return {
          _id: product._id,
          name: product.name,
          displayPrice: product.displayPrice,
          stock: product.stock,
          quantity: persistedItem?.quantity || 1,
          image: product.image ? urlFor(product.image).width(100).height(100).url() : '/images/placeholder-product.jpg',
          slug: product.slug.current,
          stripePriceId: product.stripePriceId,
        };
      });

      setBasket(mergedBasket);
      setIsFetchingFresh(false);
    };

    fetchFreshData();
  }, [hasHydrated, setBasket, isFetchingFresh]);

  // Show skeleton while hydrating to prevent flash of empty state
  if (!hasHydrated) {
    return (
      <div
        className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3"
        aria-busy="true"
        aria-label="Loading basket"
      >
        <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
          <div className="card-base overflow-hidden p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-secondary-800 rounded-sm w-1/4"></div>
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 bg-secondary-800 rounded-sm flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-800 rounded-sm w-3/4"></div>
                  <div className="h-3 bg-secondary-800 rounded-sm w-1/2"></div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 bg-secondary-800 rounded-sm flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-800 rounded-sm w-2/3"></div>
                  <div className="h-3 bg-secondary-800 rounded-sm w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg-desktop:col-span-1 lg-touch:col-span-1">
          <div className="card-base sticky top-4 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-secondary-800 rounded-sm w-1/2"></div>
              <div className="h-4 bg-secondary-800 rounded-sm w-3/4"></div>
              <div className="h-4 bg-secondary-800 rounded-sm w-2/3"></div>
              <div className="h-10 bg-secondary-800 rounded-sm w-full mt-4"></div>
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
    <div className="grid grid-cols-1 gap-8 lg-desktop:grid-cols-3 lg-touch:grid-cols-3">
      <div className="lg-desktop:col-span-2 lg-touch:col-span-2">
        <div className="card-base overflow-hidden">
          <Basket />
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
