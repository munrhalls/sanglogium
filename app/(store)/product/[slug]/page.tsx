import { notFound } from 'next/navigation';
import { getProductPage, getProductMetadata, ProductView } from '@/features/products/server';
import { WishlistToggle } from '@/features/wishlist';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Next reads this as a literal; it must equal FACET_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getProductPage(slug);

  if (!result.product) {
    notFound();
  }

  return (
    <ProductView
      product={result.product}
      relatedProducts={result.relatedProducts}
      wishlistSlot={<WishlistToggle productId={result.product._id} variant="quiet" />}
    />
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  return getProductMetadata(slug);
}
