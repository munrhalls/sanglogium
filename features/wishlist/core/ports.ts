import type { Product } from '@/features/products';

export type WishlistPorts = {
  getWishlistProductIdsByAuthId: (authId: string) => Promise<string[]>;
  getWishlistProducts: (authId: string) => Promise<Product[]>;
};

export type WishlistQueryPorts = {
  getSession: () => Promise<{ userId: string } | null>;
  wishlist: WishlistPorts;
};
