import { notFound } from 'next/navigation';
import { getProductPage, getProductMetadata, ProductView } from '@/features/products/server';
import { getWishlistProductIds, WishlistToggleView } from '@/features/wishlist/server';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const wishlist = getWishlistProductIds();
  const result = await getProductPage(slug);

  if (!result.product) {
    notFound();
  }

  return (
    <ProductView
      product={result.product}
      relatedProducts={result.relatedProducts}
      wishlistSlot={<WishlistToggleView productId={result.product._id} wishlistPromise={wishlist} />}
    />
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  return getProductMetadata(slug);
}
