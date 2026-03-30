import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/sanity/lib/products';
import { ProductDetail } from '@/app/components/features/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.name} — ${product.brand.name} — Sang Logium`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} from ${product.brand.name}`,
  };
}
