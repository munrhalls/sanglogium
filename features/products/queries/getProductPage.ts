import type { CatalogPorts } from '@/features/products/core/ports';
import type { ProductDetailData, RelatedProduct } from '@/features/products/core/rules/productTypes';
import {
  generateOptimizedTitle,
  generateSEOTitle,
  generateMetaDescription,
} from '@/features/products/core/rules/titleOptimization';

export interface ProductPagePorts {
  catalog: Pick<CatalogPorts, 'getProductBySlug' | 'getRelatedProducts'>;
}

export type ProductPageResult =
  | { product: null }
  | {
      product: ProductDetailData;
      relatedProducts: RelatedProduct[];
    };

export function createGetProductPage(ports: ProductPagePorts) {
  return async function getProductPage(slug: string): Promise<ProductPageResult> {
    const product = await ports.catalog.getProductBySlug(slug);

    if (!product) {
      return { product: null };
    }

    // Fetch related products by category
    const relatedProducts = await ports.catalog.getRelatedProducts(
      product._id,
      product.catalogueLocationKeys || [],
      6
    );

    return {
      product,
      relatedProducts,
    };
  };
}

export function createGetProductMetadata(ports: Pick<ProductPagePorts, 'catalog'>) {
  return async function getProductMetadata(slug: string) {
    const product = await ports.catalog.getProductBySlug(slug);

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
  };
}
