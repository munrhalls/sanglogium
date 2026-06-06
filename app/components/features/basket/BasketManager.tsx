"use client";
import { useShallow } from "zustand/shallow";
import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import useBasketStore from "@/store/basketStore";
import { detectCountry } from "@/lib/shipping/countryDetector";
import { DEFAULT_PARCEL } from "@/lib/shipping/parcel-calculator";
import BasketSkeleton from "./BasketSkeleton";
import EmptyBasket from "./EmptyBasket";
import BasketItem from "./BasketItem";
import BasketSummary from "./BasketSummary";

interface CmsProduct {
  _id: string;
  name: string;
  image: string;
  stock: number;
  reservedStock: number;
  price_data: {
    unit_amount: number;
    currency: string;
  };
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}

async function fetchBasketProducts(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  const res = await fetch(`/api/basket/products?ids=${productIds.map(encodeURIComponent).join(",")}`);
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

  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const currentProductIds = useMemo(
    () => basket.map((item) => item.productId),
    [basket]
  );

  const [trackedIds, setTrackedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!_hasHydrated) return;
    setTrackedIds((prev) => {
      const prevSet = new Set(prev);
      const newIds = currentProductIds.filter((id) => !prevSet.has(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, [currentProductIds, _hasHydrated]);

  // SWR relies ONLY on trackedIds, never currentProductIds
  const swrKey = _hasHydrated && trackedIds.length > 0
    ? `basket-products:${[...trackedIds].sort().join(",")}`
    : null;

  const { data: cmsProducts = [], error, isLoading } = useSWR<CmsProduct[]>(
    swrKey,
    () => fetchBasketProducts(trackedIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  
  const enrichedItems = useMemo(() => {
    return basket
      .map((item) => {
        const product = cmsProducts.find((p) => p._id === item.productId);
        if (!product) return null;

        const displayPrice = product.price_data.unit_amount / 100; // cents to dollars
        const availableStock = product.stock - product.reservedStock;

        const cappedQuantity = Math.min(item.quantity, availableStock);
        return {
          productId: item.productId,
          quantity: cappedQuantity,
          originalQuantity: item.quantity,
          name: product.name,
          displayPrice,
          image: product.image,
          price_data: product.price_data,
          availableStock,
          parcel: product.parcel,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        const aAvailable = a.availableStock > 0;
        const bAvailable = b.availableStock > 0;
        if (aAvailable === bAvailable) return 0;
        return aAvailable ? -1 : 1;
      });
  }, [basket, cmsProducts]);

  const { itemCount, subtotal, checkoutData, parcelData } = useMemo(() => {
    const count = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = enrichedItems.reduce(
      (sum, item) => sum + item.displayPrice * item.quantity,
      0
    );
    const checkoutItems = enrichedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price_data: item.price_data,
      parcel: item.parcel,
      availableStock: item.availableStock,
    }));

    const parcels = enrichedItems
      .flatMap((item) => {
        const parcel = item.parcel ?? DEFAULT_PARCEL;
        return Array(item.quantity).fill(parcel);
      });

    return {
      itemCount: count,
      subtotal: total,
      checkoutData: checkoutItems,
      parcelData: parcels,
    };
  }, [enrichedItems]);

  // Fetch shipping rates
  useEffect(() => {
    if (parcelData.length === 0) return;

    // Reset shipping cost to null to show "Calculating..." during debounce delay
    setShippingCost(null);

    const timeoutId = setTimeout(() => {
      const fetchShippingRates = async () => {
        try {
          const country = await detectCountry();
          const res = await fetch('/api/basket/shipping-rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parcelData,
              countryCode: country,
            }),
          });
          const data = await res.json();
          setShippingCost(data.rate.amount);
        } catch (e) {
          console.error('Failed to fetch shipping rates:', e);
        }
      };

      fetchShippingRates();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [parcelData]);

  if (!_hasHydrated || isLoading) return <BasketSkeleton />;
  if (basket.length === 0) return <EmptyBasket />;
  if (error) {
    return (
      <div className="card-base p-6">
        <p className="text-error-700 type-body">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg-touch:grid-cols-3 lg-desktop:grid-cols-3">
      <div className="lg-touch:col-span-2 lg-desktop:col-span-2">
        <div className="card-base overflow-hidden">
          {/* Header */}
          <div className="hidden border-b border-border-secondary px-6 py-3 lg-touch:grid lg-touch:grid-cols-[3fr_1fr_1fr_1fr] lg-desktop:grid lg-desktop:grid-cols-[3fr_1fr_1fr_1fr]">
            <div className="type-overline">
              Product
            </div>
            <div className="type-overline text-center">
              Price
            </div>
            <div className="type-overline text-center">
              Quantity
            </div>
            <div className="type-overline text-right">
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
              availableStock={item.availableStock}
              originalQuantity={item.originalQuantity}
            />
          ))}
        </div>
      </div>
      
      <div className="lg-touch:col-span-1 lg-desktop:col-span-1">
        <div className="card-product-dark sticky bottom-0 z-10 lg-touch:bottom-auto lg-touch:top-4 lg-desktop:bottom-auto lg-desktop:top-4">
          <BasketSummary
            itemCount={itemCount}
            subtotal={subtotal}
            basketData={checkoutData}
            shippingCost={shippingCost}
          />
        </div>
      </div>
    </div>
  );
}
