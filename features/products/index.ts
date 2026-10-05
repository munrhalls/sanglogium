// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions. Never re-export server-only or Sanity code here. Explicit named re-exports only; never bare export *.
export type { Product, ProductDetailData, RelatedProduct } from './core/rules/productTypes';
export { generateOptimizedTitle, generateSEOTitle, generateMetaDescription } from './core/rules/titleOptimization';
export { ChunkedProductGrid, CHUNK_SIZE } from './ui/listing/ChunkedProductGrid';
export { EmptyResults } from './ui/listing/EmptyResults';
export { Pagination } from './ui/listing/Pagination';
export { ProductCard } from './ui/card/ProductCard';
export { ProductDetail } from './ui/detail/ProductDetail';
export { ProductGrid } from './ui/listing/ProductGrid';
export { ProductGridSkeleton } from './ui/listing/ProductGridSkeleton';
export { ProductImage } from './ui/card/ProductImage';
export { ProductInfo } from './ui/detail/ProductInfo';
export { ShopHeader } from './ui/listing/ShopHeader';
export { ShopHeaderSkeleton } from './ui/listing/ShopHeaderSkeleton';
export { addToWishlist } from './commands/addToWishlist';
export { removeFromWishlist } from './commands/removeFromWishlist';
