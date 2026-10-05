import "server-only";
import { backendClient } from "@/platform/db/backendClient";

// productId must already be validated by the caller (isValidProductId in features/products/core/rules/productId.ts).
export async function removeWishlistItem(profileId: string, productId: string): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`wishlist[_ref == "${productId}"]`])
    .commit();
}
