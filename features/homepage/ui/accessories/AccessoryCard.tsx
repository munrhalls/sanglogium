import Image from "next/image";
import Link from "next/link";
import type { AccessoryItem } from "@/features/homepage/core/rules/accessoryTypes";
import { BasketControls } from "@/features/basket";
import { Price } from "@/platform/design/ui/Price";
import { ProductBadge } from "@/features/homepage/ui/shared/ProductBadge";
import { centsToDisplay } from "@/platform/utils/price";

interface AccessoryCardProps {
  item: AccessoryItem;
  idx: number;
  badge?: string;
}

export default function AccessoryCard({ item, badge }: AccessoryCardProps) {
  if (!item) return null;

  const productName = item.name;
  const brandName = item.brand?.name;

  return (
    <article className="card-product-dark group flex h-full min-w-0 flex-col overflow-hidden !p-0">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage lg-touch:aspect-[16/9]">
          {badge && (
            <ProductBadge label={badge} className="absolute right-3 top-3 z-10" />
          )}
          <Image
            src={item.image?.asset?._id ?? ""}
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
          value={centsToDisplay(item.price_data.unit_amount)}
          className="type-product-price tabular-nums"
        />
        <div className="flex min-h-9 w-full items-center sm:ml-auto sm:min-h-0 sm:w-auto">
          <BasketControls
            productId={item._id}
            isBasketPage={false}
            size="sm"
            fullWidth
            label="To cart"
            addClassName="btn-cart whitespace-nowrap"
            wrapperClassName="flex items-center gap-1"
          />
        </div>
      </div>
    </article>
  );
}
