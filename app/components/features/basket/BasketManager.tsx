"use client";
import { useShallow } from "zustand/shallow";
import { useMemo, useState } from "react";
import useSWR from "swr";
import useBasketStore from "@/store/basketStore";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";

async function fetchBasketProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  const res = await fetch(`/api/basket/products?ids=${productIds.join(",")}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Unable to load products");
  }
  
  const result = await res.json();
  if (!result.success) {
    throw new Error(result.error || "Unable to load products");
  }
  
  return result.data || [];
}

export default function BasketManager() {
  const { items: basket, _hasHydrated } = useBasketStore(
    useShallow((state) => ({
      items: state.items,
      _hasHydrated: state._hasHydrated,
    }))
  );

  const currentProductIds = useMemo(
    () => basket.map((item) => item.productId),
    [basket]
  );

  // High Water Mark state - only ever adds, never subtracts
  const [trackedIds, setTrackedIds] = useState<string[]>([]);

  // React 18 Render Phase State Update
  // Synchronous, avoids useEffect race conditions
  if (_hasHydrated) {
    const newIds = currentProductIds.filter((id) => !trackedIds.includes(id));
    if (newIds.length > 0) {
      setTrackedIds([...trackedIds, ...newIds]);
    }
  }

  // SWR relies ONLY on trackedIds, never currentProductIds
  const swrKey = _hasHydrated && trackedIds.length > 0
    ? `basket-products:${trackedIds.sort().join(",")}`
    : null;

  const { data: cmsProducts = [], error, isLoading } = useSWR(
    swrKey,
    () => fetchBasketProducts(trackedIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Filter cached CMS data to match CURRENT basket
  // This happens locally - no refetch
  const enrichedItems = useMemo(() => {
    return basket
      .map((item) => {
        const product = cmsProducts.find((p: any) => p._id === item.productId);
        if (!product) return null;
        
        const displayPrice = product.price_data.unit_amount / 100; // cents to dollars
        const availableStock = product.stock - product.reservedStock;
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          displayPrice,
          image: product.image,
          price_data: product.price_data,
          availableStock,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        // Available items first, then by original basket order
        const aAvailable = a.availableStock > 0;
        const bAvailable = b.availableStock > 0;
        if (aAvailable === bAvailable) return 0;
        return aAvailable ? -1 : 1;
      });
  }, [basket, cmsProducts]);

  // Summary calculations from filtered items
  const { itemCount, subtotal, checkoutData } = useMemo(() => {
    const count = basket.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce(
      (sum, item) => sum + item.displayPrice * item.quantity,
      0
    );
    const checkoutItems = enrichedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price_data: item.price_data,
    }));
    
    return { 
      itemCount: count, 
      subtotal: total, 
      checkoutData: checkoutItems 
    };
  }, [basket, enrichedItems]);

  if (!_hasHydrated || isLoading) return <BasketSkeleton />;
  if (basket.length === 0) return <EmptyBasket />;
  if (error) {
    return (
      <div className="card-base p-6">
        <p className="text-error-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-3 lg-desktop:grid-cols-3">
      <div className="lg-touch:col-span-2 lg-desktop:col-span-2">
        <div className="card-base overflow-hidden">
          {/* Header */}
          <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[3fr_1fr_1fr_1fr] lg-desktop:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr]">
            <div className="type-caption uppercase tracking-editorial text-secondary-500">
              Product
            </div>
            <div className="type-caption text-center uppercase tracking-editorial text-secondary-500">
              Price
            </div>
            <div className="type-caption text-center uppercase tracking-editorial text-secondary-500">
              Quantity
            </div>
            <div className="type-caption text-right uppercase tracking-editorial text-secondary-500">
              Total
            </div>
          </div>

          {enrichedItems.map((item) => (
            <BasketItem
              key={item.productId}
              productId={item.productId}
              name={item.name}
              quantity={item.quantity}
              displayPrice={item.displayPrice}
              image={item.image}
            />
          ))}
        </div>
      </div>
      
      <div className="lg-touch:col-span-1 lg-desktop:col-span-1">
        <div className="card-base sticky bottom-0 z-10 lg-touch:bottom-auto lg-touch:top-4 lg-desktop:bottom-auto lg-desktop:top-4">
          <BasketSummary
            itemCount={itemCount}
            subtotal={subtotal}
            basketData={checkoutData}
          />
        </div>
      </div>
    </div>
  );
}
