import type { WishlistQueryPorts } from '@/features/products/core/ports';

export function createGetWishlistProductIds({ getSession, wishlist }: WishlistQueryPorts) {
  return async function getWishlistProductIds(): Promise<string[]> {
    const session = await getSession();
    if (!session) return [];

    return wishlist.getWishlistProductIdsByAuthId(session.userId);
  };
}
