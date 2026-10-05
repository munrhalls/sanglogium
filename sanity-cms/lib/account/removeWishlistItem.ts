import { backendClient } from "@/platform/db/backendClient";

// productId must already be validated by the caller (isValidProductId in features/products/actions.ts).
export async function removeWishlistItem(profileId: string, productId: string): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`wishlist[_ref == "${productId}"]`])
    .commit();
}
