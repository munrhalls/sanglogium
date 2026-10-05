import { backendClient } from "@/platform/db/backendClient";

// productId must already be validated by the caller (isValidProductId in features/products/actions.ts).
export async function addWishlistItem(profileId: string, productId: string): Promise<void> {
  await backendClient
    .patch(profileId)
    .setIfMissing({ wishlist: [] })
    .unset([`wishlist[_ref == "${productId}"]`])
    .append("wishlist", [{ _type: "reference", _ref: productId }])
    .commit();
}
