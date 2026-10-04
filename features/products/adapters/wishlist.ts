import "server-only";
import { getSession } from "@/features/auth/server";
import { getWishlistProductIdsByAuthId } from "@/sanity-cms/lib/account/getWishlistProductIdsByAuthId";

export async function getWishlistProductIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  return getWishlistProductIdsByAuthId(session.userId);
}
