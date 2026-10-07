import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

// productId must already be validated by the caller (isValidProductId in the products slice productId rules).
export async function removeWishlistItem(profileId: string, productId: string): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`wishlist[_ref == "${productId}"]`])
    .commit();
}
