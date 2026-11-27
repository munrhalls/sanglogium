import { notFound } from 'next/navigation';
import { getProductPage, getProductMetadata, ProductView } from '@/features/products/server';
import { WishlistToggle } from '@/features/wishlist';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Next reads this as a literal; it must equal FACET_REVALIDATE_SECONDS.
export const revalidate = 300;

// No product is built ahead of time: each one is built on its first visit and then cached for `revalidate` seconds.
// Without this export Next renders the route for every request (no-store).
export function generateStaticParams() {
  return [];
}

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
