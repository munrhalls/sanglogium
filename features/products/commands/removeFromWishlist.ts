'use server';

import { requireSession } from "@/features/auth/server";
import { getProfileIdByAuthId, removeWishlistItem } from "@/features/profile/server";
import { isValidProductId } from "@/features/products/core/rules/productId";

export async function removeFromWishlist(productId: string) {
  const session = await requireSession();
  if (!isValidProductId(productId)) return { error: "Invalid product." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await removeWishlistItem(profile._id, productId);

  return { success: true };
}
