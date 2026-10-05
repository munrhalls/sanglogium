import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { Order } from "@/sanity.types";

export async function getUserOrderByNumber(
  orderNumber: string,
  userId: string
): Promise<Order | null> {
  return backendClient.fetch<Order | null>(
    `*[_type == "order" && orderNumber == $orderNumber && userId == $userId][0]{
      orderNumber, status, items, shippingAddress, billingAddress,
      shippingMethod, pricing, dates, payment, metadata
    }`,
    { orderNumber, userId }
  );
}
