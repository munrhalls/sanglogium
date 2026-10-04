import 'server-only';
// Server-only entry: the session-aware wishlist read. Never import from client components or Node .mjs scripts.
export { getWishlistProductIds } from './adapters/wishlist';
