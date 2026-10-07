import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";
import type { MergedGuestOrderCountParams } from "@/features/account/core/rules/accountTypes";

export async function countMergedGuestOrders(params: MergedGuestOrderCountParams): Promise<number> {
  const orders = await backendClient.fetch<Array<{ _id: string }>>(
    `*[_type == "order" && userId == $userId && customerEmail == $email && isGuest == false && dates.orderedAt < $userCreatedAt]{_id}`,
    params
  );

  return orders?.length ?? 0;
}
