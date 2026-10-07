import { notFound } from 'next/navigation';
import { getProductPage, getProductMetadata, ProductView } from '@/features/products/server';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
      isInWishlist={result.isInWishlist}
    />
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  return getProductMetadata(slug);
}
