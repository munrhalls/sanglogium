"use client";

import { useEffect, useState } from "react";
import { getOrderBySession } from "@/app/actions/checkout/getOrderBySession";
import { useBasketStore } from "@/store/store";
import Link from "next/link";
import { SuccessMessage } from "./SuccessMessage";
import { WhatHappensNext } from "./WhatHappensNext";
import { OrderSummary } from "./OrderSummary";
import { ActionButtons } from "./ActionButtons";

interface Order {
  orderNumber: string;
  orderId: string;
  status: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  dates: {
    orderedAt: string;
    paidAt?: string;
  };
}

interface CheckoutReturnClientProps {
  sessionId: string | null;
  initialOrder: Order | null;
}

export function CheckoutReturnClient({
  sessionId,
  initialOrder,
}: CheckoutReturnClientProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [attempts, setAttempts] = useState(0);
  const clearBasket = useBasketStore((s) => s.clearBasket);

  useEffect(() => {
    if (order) {
      clearBasket();
      return;
    }

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const maxAttempts = 30;
    const interval = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setLoading(false);
        return;
      }

      try {
        const fetchedOrder = await getOrderBySession(sessionId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          clearBasket();
          clearInterval(interval);
          return;
        }
        setAttempts((a) => a + 1);
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, attempts, clearBasket, order]);

  if (!sessionId) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Invalid session</p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600">Processing your order...</p>
          <p className="mt-2 text-sm text-gray-500">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
          <p className="mt-2 text-sm text-gray-600">
            If you completed payment, your order will appear shortly.
          </p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-50 to-white py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <SuccessMessage orderNumber={order.orderNumber} />
          <WhatHappensNext />
          <OrderSummary order={order} />
          <ActionButtons />
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@sang-logium.com"
            className="text-blue-600 hover:underline"
          >
            support@sang-logium.com
          </a>
        </p>
      </div>
    </div>
  );
}
