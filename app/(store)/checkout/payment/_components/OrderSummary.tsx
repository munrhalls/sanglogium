"use client";

import { useEffect, useState } from "react";

interface BasketReservationItem {
  _id: string;
  quantity: number;
  verifiedPrice: number;
}

interface ShippingChoice {
  provider: string;
  serviceLevel: string;
  amount: number;
  currency: string;
}

interface ReservationData {
  basketReservation: BasketReservationItem[];
  shippingChoice: ShippingChoice;
}

interface Product {
  _id: string;
  name: string;
}

interface OrderSummaryProps {
  basketReservationId: string;
}

export default function OrderSummary({ basketReservationId }: OrderSummaryProps) {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch reservation
        const reservationRes = await fetch(
          `/api/basket-reservations/${basketReservationId}`
        );
        if (!reservationRes.ok) {
          throw new Error("Failed to fetch reservation");
        }
        const reservationData: ReservationData = await reservationRes.json();

        // Fetch products
        const productIds = reservationData.basketReservation.map((item) => item._id);
        const productsRes = await fetch(
          `/api/basket/products?ids=${productIds.join(",")}`
        );
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsRes.json();
        
        setReservation(reservationData);
        setProducts(productsData.data || []);
      } catch (err) {
        console.error("Error fetching order summary:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [basketReservationId]);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Unable to load order summary
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p._id, p]));
  const itemsTotal = reservation.basketReservation.reduce((sum, item) => {
    const product = productMap.get(item._id);
    if (product) {
      return sum + item.verifiedPrice * item.quantity;
    }
    return sum;
  }, 0);

  const shippingTotal = reservation.shippingChoice.amount;
  const grandTotal = itemsTotal + shippingTotal;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      
      <div className="space-y-2">
        {reservation.basketReservation.map((item) => {
          const product = productMap.get(item._id);
          if (!product) return null;
          
          const lineTotal = item.verifiedPrice * item.quantity;
          
          return (
            <div key={item._id} className="flex justify-between text-sm">
              <span>
                {product.name} × {item.quantity}
              </span>
              <span>{formatPrice(lineTotal)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between text-sm">
          <span>Shipping ({reservation.shippingChoice.provider})</span>
          <span>{formatPrice(shippingTotal)}</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
