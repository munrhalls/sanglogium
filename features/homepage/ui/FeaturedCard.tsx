import Image from "next/image";
import Link from "next/link";
import { BasketControls } from "@/features/basket";
import { formatPrice } from "@/platform/utils/price";
import type { FeaturedProduct } from "@/features/homepage/core/types/homepageTypes";

interface FeaturedCardProps {
  product: FeaturedProduct;
  idx: number;
}

const getModelName = (productName: string, brandName: string): string => {
  // Escape special regex characters in brand name (handles spaces, ampersands, etc.)
  const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Case-insensitive regex to remove brand name from product name
  const regex = new RegExp(`^${escapedBrand}\\s+`, 'i');
  const modelName = productName.replace(regex, '').trim();
  // Return model name, or full name if empty
  return modelName || productName;
};

export const FeaturedCard = ({ product, idx }: FeaturedCardProps) => {
  const modelName = getModelName(product.name, product.brand.name);

  return (
    <article className="group card-product-dark flex h-full min-w-0 flex-col overflow-hidden !p-0">
      <Link href={`/product/${product.slug}`} className="flex flex-grow flex-col">
        <figure className="relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden bg-surface-productImage">
          <span className="type-product-brand absolute left-3 top-3 z-10 text-brand-900">
            {product.brand.name}
          </span>
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            width={450}
            height={450}
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        </figure>

        <div className="flex min-w-0 flex-grow flex-col gap-1 p-3">
          <h3 className="type-product-title line-clamp-2 min-h-[2.5em]">{modelName}</h3>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <p className="type-product-price tabular-nums">
          {formatPrice(product.price_data.unit_amount)}
        </p>
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          label="Add"
          addClassName="btn-product-add"
          wrapperClassName="flex items-center gap-1"
        />
      </div>
    </article>
    );
  };
