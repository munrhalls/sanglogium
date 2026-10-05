import { backendClient } from "@/platform/db/backendClient";

export interface UserOrderSummary {
  orderNumber: string;
  status: string;
  pricing: {
    total: number;
    currency: string;
  };
  dates: {
    orderedAt: string;
  };
}

export async function getUserOrders(userId: string): Promise<UserOrderSummary[]> {
  return backendClient.fetch<UserOrderSummary[]>(
    `*[_type == "order" && userId == $userId] | order(dates.orderedAt desc) {
      orderNumber, status, pricing, dates
    }`,
    { userId }
  );
}
