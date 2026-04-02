"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import type { Order as SanityOrder } from "@/sanity/lib/orders/orderTypes";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  orderNumber: string;
  orderId: string;
  status: string;
  customerEmail: string;
  items: OrderItem[];
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

export async function getOrderBySession(
  sessionId: string | null
): Promise<Order | null> {
  if (!sessionId) return null;

  try {
    const sanityOrder = await backendClient.fetch<SanityOrder | null>(
      `*[_type == "order" && payment.stripeCheckoutSessionId == $sessionId][0] {
        orderNumber,
        orderId,
        status,
        customerEmail,
        items,
        pricing,
        dates
      }`,
      { sessionId }
    );

    if (!sanityOrder) return null;

    return {
      orderNumber: sanityOrder.orderNumber,
      orderId: sanityOrder.orderId,
      status: sanityOrder.status,
      customerEmail: sanityOrder.customerEmail,
      items: sanityOrder.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      pricing: sanityOrder.pricing,
      dates: sanityOrder.dates,
    };
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}
