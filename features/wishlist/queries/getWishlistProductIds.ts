import type { WishlistQueryPorts } from '@/features/wishlist/core/ports';

export async function getWishlistProductIds({ getSession, wishlist }: WishlistQueryPorts): Promise<string[]> {
    const session = await getSession();
    if (!session) return [];

    return wishlist.getWishlistProductIdsByAuthId(session.userId);
}
