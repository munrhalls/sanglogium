import { Product } from '@/sanity-config/lib/products/getProductBySlug';
import { RelatedProduct } from '@/sanity-config/lib/products/getRelatedProducts';
import { ImageGallery } from './ImageGallery';
import { ProductInfo } from './ProductInfo';
import { RelatedProducts } from './RelatedProducts';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: RelatedProduct[];
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  // Combine main image with gallery for the image gallery
  const allImages = product.image ? [product.image, ...(product.gallery || [])] : (product.gallery || []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="lg:w-1/2">
          <ImageGallery images={allImages} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border-secondary">
          <h2 className="type-section-sub mb-6">Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-secondary">
                  <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Specification</th>
                  <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Value</th>
                  {product.specifications.some(s => s.information) && (
                    <th className="text-left py-3 px-4 type-caption uppercase text-secondary">Info</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-surface-card' : ''}>
                    <td className="py-3 px-4 type-body text-primary">{spec.title}</td>
                    <td className="py-3 px-4 type-body text-primary">{spec.value}</td>
                    {product.specifications.some(s => s.information) && (
                      <td className="py-3 px-4 type-caption text-secondary">{spec.information || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      <RelatedProducts
        products={relatedProducts}
        currentProductName={product.name}
      />
    </div>
  );
}
