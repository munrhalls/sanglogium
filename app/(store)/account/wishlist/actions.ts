"use server";

import { requireSession } from "@/lib/auth/dal";
import { backendClient } from "@/sanity-cms/lib/backendClient";

async function getProfileId(authId: string) {
  return backendClient.fetch<{ _id: string }>(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId }
  );
}

export async function addToWishlist(productId: string) {
  const session = await requireSession();
  if (!productId) return { error: "Product ID is required." };

  const profile = await getProfileId(session.userId);
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
  if (!productId) return { error: "Product ID is required." };

  const profile = await getProfileId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await backendClient
    .patch(profile._id)
    .unset([`wishlist[_ref == "${productId}"]`])
    .commit();

  return { success: true };
}
