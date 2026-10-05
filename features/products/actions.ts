"use server";

import { requireSession } from "@/features/auth/server";
import { addWishlistItem } from "@/sanity-cms/lib/account/addWishlistItem";
import { removeWishlistItem } from "@/sanity-cms/lib/account/removeWishlistItem";
import { getProfileIdByAuthId } from "@/features/auth/server";

// Sanity document IDs are alphanumeric plus `_.-` (see Sanity's own ID rules).
// Rejecting anything else before it reaches a Sanity patch path expression
// closes off path injection via a tampered client-supplied productId.
const SANITY_DOC_ID_RE = /^[a-zA-Z0-9_.-]+$/;

function isValidProductId(id: string): boolean {
  return SANITY_DOC_ID_RE.test(id);
}

export async function addToWishlist(productId: string) {
  const session = await requireSession();
  if (!isValidProductId(productId)) return { error: "Invalid product." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await addWishlistItem(profile._id, productId);

  return { success: true };
}

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
