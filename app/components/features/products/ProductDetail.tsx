import React from 'react';
import { ImageGallery } from './ImageGallery';
import { ProductInfo } from './ProductInfo';

interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;
  images?: any[];
  slug: { current: string };
  description?: string;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  // Use images array if available, otherwise wrap single image in array
  const images = product.images?.length ? product.images : [product.image];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="lg:w-1/2">
          <ImageGallery images={images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2">
          <ProductInfo
            name={product.name}
            brand={product.brand}
            displayPrice={product.displayPrice}
            description={product.description}
          />
        </div>
      </div>
    </div>
  );
}
