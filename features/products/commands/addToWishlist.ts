'use server';

import { requireSession, getProfileIdByAuthId } from "@/features/auth/server";
import { wishlist } from "@/features/products/server";
import { isValidProductId } from "@/features/products/core/rules/productId";

export async function addToWishlist(productId: string) {
  const session = await requireSession();
  if (!isValidProductId(productId)) return { error: "Invalid product." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await wishlist.addWishlistItem(profile._id, productId);

  return { success: true };
}
