import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";
import type { UserOrderSummary } from "@/features/account/core/rules/accountTypes";

export async function getUserOrders(userId: string): Promise<UserOrderSummary[]> {
  return backendClient.fetch<UserOrderSummary[]>(
    `*[_type == "order" && userId == $userId] | order(dates.orderedAt desc) {
      orderNumber, status, pricing, dates
    }`,
    { userId }
  );
}
