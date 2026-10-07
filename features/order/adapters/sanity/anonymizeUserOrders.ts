import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

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
