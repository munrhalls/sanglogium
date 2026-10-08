'use server';

import { requireSession } from "@/features/auth/server";
import { getProfileIdByAuthId, addWishlistItem } from "@/features/profile/server";
import { isValidProductId } from "@/features/products";

export async function addToWishlistAction(productId: string) {
  const session = await requireSession();
  if (!isValidProductId(productId)) return { error: "Invalid product." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await addWishlistItem(profile._id, productId);

  return { success: true };
}
