"use client";
import { useShallow } from 'zustand/shallow';
import { useMemo } from 'react';
import useSWR from 'swr';
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";
import { parseBasketItems } from "./parseBasketItems";
import { separateByAvailability } from "./availabilityHandler";

export default function BasketManager() {
  const { items: basket, _hasHydrated: hasHydrated } = useBasketStore(
    useShallow((state) => ({ items: state.items, _hasHydrated: state._hasHydrated }))
  );

  const productIds = useMemo(() => basket.map(item => item.productId), [basket]);

  const swrKey = hasHydrated && productIds.length > 0 ? ['basket-products', productIds] : null;

  const { data: cmsBasketItems = [], error, isLoading } = useSWR(
    swrKey,
    async ([_, ids]: [string, string[]]) => {
      const res = await fetch(`/api/basket/products?ids=${ids.join(',')}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Unable to load products');
      }
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Unable to load products');
      }
      const parsedItems = parseBasketItems(result.data || []);
      const { available, unavailable } = separateByAvailability(parsedItems);
      return [...available, ...unavailable];
    }
  );

  if (!hasHydrated) {
    return <BasketSkeleton />;
  }

  if (basket.length === 0) {
    return <EmptyBasket />;
  }

  if (isLoading) {
    return <BasketSkeleton />;
  }

  if (error) {
    return (
      <div className="card-base p-6">
        <p className="text-error-500">{error.message || 'Unable to load products'}</p>
      </div>
    );
  }

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
                  image={cmsItem.image}
                />
              );
            })
            .filter(Boolean)}
        </div>
      </div>
      <div className="lg-desktop:col-span-1 lg-touch:col-span-1">
        <div className="card-base sticky bottom-0 lg-desktop:top-4 lg-touch:top-4 lg-desktop:bottom-auto lg-touch:bottom-auto z-10">
          <BasketSummary />
        </div>
      </div>
    </div>
  );
}
