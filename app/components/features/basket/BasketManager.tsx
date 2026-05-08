"use client";
import { useShallow } from 'zustand/shallow';
import { useState, useEffect } from 'react';
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";
import { getBasketProducts } from "@/sanity-config/lib/products/getBasketProducts";
import { parseBasketItems } from "./parseBasketItems";
import { separateByAvailability } from "./availabilityHandler";

export default function BasketManager() {
  const { items: basket, _hasHydrated: hasHydrated } = useBasketStore(
    useShallow((state) => ({ items: state.items, _hasHydrated: state._hasHydrated }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cmsBasketItems, setCmsBasketItems] = useState<Array<{
    productId: string
    name: string
    displayPrice: number
    availableStock: number
    image?: any
  }>>([]);

  useEffect(() => {
    async function fetchBasketData() {
      if (basket.length === 0) {
        setCmsBasketItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const productIds = basket.map(item => item.productId);
        const cmsProducts = await getBasketProducts(productIds);
        const parsedItems = parseBasketItems(cmsProducts);
        const { available, unavailable } = separateByAvailability(parsedItems);

        // Combine available and unavailable, available first
        setCmsBasketItems([...available, ...unavailable]);
      } catch (err) {
        console.error('Failed to fetch basket data:', err);
        setError('Unable to load products');
        setCmsBasketItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBasketData();
  }, [basket]);

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
        <p className="text-error-500">{error}</p>
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
        <div className="card-base sticky top-4">
          <BasketSummary />
        </div>
      </div>
    </div>
  );
}
