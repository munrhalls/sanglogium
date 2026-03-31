"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';

interface RelatedProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string } | null;
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  currentProductName: string;
}

export function RelatedProducts({ products, currentProductName }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-heading"
      className="mt-12 pt-8 border-t border-border-secondary"
    >
      <h2
        id="related-heading"
        className="type-section-sub mb-6"
      >
        You May Also Like
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-brand-400 scrollbar-track-transparent">
        {products.map((product) => (
          <article
            key={product._id}
            className="w-56 flex-shrink-0 snap-start"
          >
            <Link
              href={`/products/${product.slug.current}`}
              className="block card-product-dark group"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-surface-productImage rounded-sm overflow-hidden mb-3">
                {product.image ? (
                  <Image
                    src={urlFor(product.image).width(224).height(168).url()}
                    alt={product.name}
                    fill
                    sizes="224px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-secondary-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="type-card-title line-clamp-1 group-hover:text-brand-400 transition-colors">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="type-metadata">{product.brand.name}</p>
                )}
                <p className="type-price">${product.displayPrice.toFixed(2)}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
