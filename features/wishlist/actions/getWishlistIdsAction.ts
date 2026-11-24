'use server';

import { getWishlistProductIds } from '@/features/wishlist/server';

// The guard lives in the query: it reads the session through the auth door (getSession wired in server.ts) and returns [] when signed out.
export async function getWishlistIdsAction(): Promise<string[]> {
  return getWishlistProductIds();
}
