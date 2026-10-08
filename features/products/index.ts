// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export type { Product, ProductDetailData, RelatedProduct } from './core/rules/productTypes';
export { generateOptimizedTitle, generateSEOTitle, generateMetaDescription } from './core/rules/titleOptimization';
export { ChunkedProductGrid, CHUNK_SIZE } from './ui/listing/ChunkedProductGrid';
export { EmptyResults } from './ui/listing/EmptyResults';
export { Pagination } from './ui/listing/Pagination';
export { ProductCard } from './ui/card/ProductCard';
export type { CardAction } from './ui/card/ProductCard';
export { ProductDetail } from './ui/detail/ProductDetail';
export { ProductGrid } from './ui/listing/ProductGrid';
export { ProductGridSkeleton } from './ui/listing/ProductGridSkeleton';
export { isValidProductId } from './core/rules/productId';
export { ProductImage } from './ui/card/ProductImage';
export { ProductInfo } from './ui/detail/ProductInfo';
export { ShopHeader } from './ui/listing/ShopHeader';
export { ShopHeaderSkeleton } from './ui/listing/ShopHeaderSkeleton';
