import 'server-only';
import { getSession } from '@/features/auth/server';
import { getWishlistProductIdsByAuthId } from './adapters/sanity/getWishlistProductIdsByAuthId';
import { getWishlistProducts } from './adapters/sanity/getWishlistProducts';
import { getWishlistProductIds as getWishlistProductIdsQuery } from './queries/getWishlistProductIds';
import type { WishlistPorts } from './core/ports';

const wishlist: WishlistPorts = {
  getWishlistProductIdsByAuthId,
  getWishlistProducts,
};

export const getWishlistProductIds = () => getWishlistProductIdsQuery({ getSession, wishlist });

export { getWishlistProducts };

export { default as WishlistView } from './view/WishlistView';
export { default as WishlistToggleView } from './view/WishlistToggleView';
