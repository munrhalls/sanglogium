// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions. Never re-export server-only or Sanity code here. Explicit named re-exports only; never bare export *.
export type { Product, ProductDetailData, RelatedProduct } from './domain/productTypes';
export { generateOptimizedTitle, generateSEOTitle, generateMetaDescription } from './domain/titleOptimization';
export { ChunkedProductGrid, CHUNK_SIZE } from './ui/ChunkedProductGrid';
export { EmptyResults } from './ui/EmptyResults';
export { Pagination } from './ui/Pagination';
export { ProductCard } from './ui/ProductCard';
export { ProductDetail } from './ui/ProductDetail';
export { ProductGrid } from './ui/ProductGrid';
export { ProductGridSkeleton } from './ui/ProductGridSkeleton';
export { ProductImage } from './ui/ProductImage';
export { ProductInfo } from './ui/ProductInfo';
export { ShopHeader } from './ui/ShopHeader';
export { ShopHeaderSkeleton } from './ui/ShopHeaderSkeleton';
