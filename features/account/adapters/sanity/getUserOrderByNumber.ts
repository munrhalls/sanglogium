import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { OrderDetail } from "@/features/account/core/rules/accountTypes";

export async function getUserOrderByNumber(
  orderNumber: string,
  userId: string
): Promise<OrderDetail | null> {
  return backendClient.fetch<OrderDetail | null>(
    `*[_type == "order" && orderNumber == $orderNumber && userId == $userId][0]{
      orderNumber, status, items, shippingAddress, billingAddress,
      shippingMethod, pricing, dates, payment, metadata
    }`,
    { orderNumber, userId }
  );
}
