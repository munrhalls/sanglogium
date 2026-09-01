import Image from "next/image";
import Link from "next/link";
import { IemProduct } from "./getIemProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { Price } from "@/app/components/ui/Price";
import { ProductBadge } from "@/app/components/ui/ProductBadge";
import { centsToDisplay } from "@/lib/utils/price";

interface IemCardProps {
  product: IemProduct;
  idx: number;
  badge?: string;
}

export default function IemCard({ product, badge }: IemCardProps) {
  if (!product) return null;

  const productName = product.name;
  const brandWords = productName.trim().split(/\s+/);
  const brandName =
    product.brand?.name ||
    (brandWords.length > 1 ? brandWords.slice(0, -1).join(" ") : productName);

  return (
    <article className="card-product-dark group flex h-full min-w-0 flex-col overflow-hidden !p-0">
      <Link href={`/product/${product.slug}`} className="block">
        <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage lg-touch:aspect-[16/9]">
          {badge && (
            <ProductBadge label={badge} className="absolute right-3 top-3 z-10" />
          )}
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={productName}
            width={400}
            height={400}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
        </figure>

        <div className="flex min-w-0 flex-col gap-1 p-3">
          {brandName && (
            <span className="type-product-brand">{brandName}</span>
          )}
          <h3 className="type-product-title line-clamp-3">{productName}</h3>
        </div>
      </Link>

      <div className="mt-auto flex flex-col items-stretch gap-2 px-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <Price
          value={centsToDisplay(product.price_data.unit_amount)}
          className="type-product-price tabular-nums"
        />
        <div className="w-full sm:ml-auto sm:w-auto">
          <BasketControls
            productId={product._id}
            isBasketPage={false}
            size="sm"
            label="To cart"
            addClassName="btn-cart whitespace-nowrap"
            wrapperClassName="flex items-center gap-1"
          />
        </div>
      </div>
    </article>
  );
}
