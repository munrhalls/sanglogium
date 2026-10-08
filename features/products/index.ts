// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export type { Product } from './core/types/productTypes';
export { EmptyResults } from './ui/listing/EmptyResults';
export type { CardAction } from './ui/card/ProductCard';
export { ProductDetailSkeleton } from './ui/detail/ProductDetailSkeleton';
export { ProductGrid } from './ui/listing/ProductGrid';
export { ProductGridSkeleton } from './ui/listing/ProductGridSkeleton';
export { isValidProductId } from './core/rules/productId';
export { ProductImage } from './ui/card/ProductImage';
export { ShopHeaderSkeleton } from './ui/listing/ShopHeaderSkeleton';
