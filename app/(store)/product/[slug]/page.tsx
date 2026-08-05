import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/sanity-cms/lib/products';
import { ProductDetail } from '@/app/components/features/products';
import { getWishlistProductIds } from '@/lib/wishlist';
import { generateOptimizedTitle, generateSEOTitle, generateMetaDescription } from '@/lib/utils/title-optimization';

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

  const wishlistProductIds = await getWishlistProductIds();
  const isInWishlist = wishlistProductIds.includes(product._id);

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 py-6">
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
            <Link href="/products" className="type-caption text-secondary hover:text-primary transition-colors">
              Products
            </Link>
          </li>
          <li className="type-caption text-caption">/</li>
          <li className="type-caption text-primary font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetail product={product} relatedProducts={relatedProducts} isInWishlist={isInWishlist} />
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  // Generate optimized titles for different contexts
  const optimizedTitle = generateOptimizedTitle({
    productName: product.name,
    brand: product.brand,
    siteName: 'Sang Logium'
  });

  const seoTitle = generateSEOTitle({
    productName: product.name,
    brand: product.brand,
    siteName: 'Sang Logium'
  });

  const metaDescription = generateMetaDescription(
    product.description,
    product.name,
    product.brand
  );

  return {
    title: optimizedTitle, // Browser-optimized title
    description: metaDescription,
    // Additional SEO metadata
    openGraph: {
      title: seoTitle, // Full SEO title for social sharing
      description: metaDescription,
      type: 'website',
      siteName: 'Sang Logium',
    },
    twitter: {
      title: seoTitle, // Full title for Twitter cards
      description: metaDescription,
      card: 'summary_large_image',
    },
    // Structured data for search engines
    other: {
      'seo-title': seoTitle, // Custom meta for SEO tracking
    }
  };
}
