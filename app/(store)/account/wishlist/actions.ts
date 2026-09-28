"use server";

import { requireSession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import { getProfileIdByAuthId } from "@/sanity-cms/lib/account/getProfileIdByAuthId";

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

  await backendClient
    .patch(profile._id)
    .setIfMissing({ wishlist: [] })
    .unset([`wishlist[_ref == "${productId}"]`])
    .append("wishlist", [{ _type: "reference", _ref: productId }])
    .commit();

  return { success: true };
}

export async function removeFromWishlist(productId: string) {
  const session = await requireSession();
  if (!isValidProductId(productId)) return { error: "Invalid product." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await backendClient
    .patch(profile._id)
    .unset([`wishlist[_ref == "${productId}"]`])
    .commit();

  return { success: true };
}
