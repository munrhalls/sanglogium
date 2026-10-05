import { backendClient } from "@/platform/db/backendClient";

export async function countMergedGuestOrders(params: {
  userId: string;
  email: string;
  userCreatedAt: string;
}): Promise<number> {
  const orders = await backendClient.fetch<Array<{ _id: string }>>(
    `*[_type == "order" && userId == $userId && customerEmail == $email && isGuest == false && dates.orderedAt < $userCreatedAt]{_id}`,
    params
  );

  return orders?.length ?? 0;
}
