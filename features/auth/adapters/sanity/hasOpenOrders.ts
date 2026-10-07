import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

const OPEN_STATUSES = [
  "pending_payment",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
];

export async function hasOpenOrders(userId: string): Promise<boolean> {
  const openOrders = await backendClient.fetch<{ _id: string }[]>(
    `*[_type == "order" && userId == $userId && status in $openStatuses]{_id}`,
    { userId, openStatuses: OPEN_STATUSES }
  );

  return !!openOrders && openOrders.length > 0;
}
