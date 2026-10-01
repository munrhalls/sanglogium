import { getSession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function getWishlistProductIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  const profile = await backendClient.fetch<{ ids?: string[] | null }>(
    `*[_type == "userProfile" && authId == $authId][0]{ "ids": wishlist[]._ref }`,
    { authId: session.userId }
  );

  return profile?.ids ?? [];
}
