import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/sanity/lib/products';
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

  // Fetch related products by category
  const relatedProducts = await getRelatedProducts(
    product._id,
    product.catalogueLocationKeys || [],
    6
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="type-caption text-secondary hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li>
            <Link href="/products/headphones" className="type-caption text-secondary hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li className="type-caption text-primary font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  );
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
