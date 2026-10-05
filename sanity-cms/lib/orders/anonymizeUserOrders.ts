import { backendClient } from "@/platform/db/backendClient";

export async function anonymizeUserOrders(userId: string): Promise<void> {
  await backendClient
    .patch({
      query: `*[_type == "order" && userId == $userId]`,
      params: { userId },
    })
    .unset(["userId"])
    .set({ isGuest: true })
    .commit();
}
