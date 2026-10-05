import { backendClient } from "@/platform/db/backendClient";

export async function getWishlistProductIdsByAuthId(
  authId: string
): Promise<string[]> {
  const profile = await backendClient.fetch<{ ids?: string[] | null }>(
    `*[_type == "userProfile" && authId == $authId][0]{ "ids": wishlist[]._ref }`,
    { authId }
  );

  return profile?.ids ?? [];
}
