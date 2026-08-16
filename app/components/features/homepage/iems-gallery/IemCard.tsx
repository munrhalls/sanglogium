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
    <article className="card-product-dark group flex h-full flex-col overflow-hidden !p-0 rounded-[0.4rem]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-[0.4rem] bg-surface-productImage p-0">
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
            className="object-cover object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <ProductBadge
              label={badge}
              className="absolute right-2 top-8 z-10"
            />
          )}
          <div className="absolute left-2 right-2 top-2">
            <span className="block truncate text-tiny font-bold uppercase tracking-tight text-brand-900 xs:text-small">
              {brandName}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-4 pt-3 md:px-8 md:pt-4">
          <h3 className="text-body leading-snug">{productName}</h3>
        </div>
      </Link>

      <div className="mt-auto flex flex-row items-center justify-between gap-3 pt-2 px-4 pb-6 md:px-8 md:pb-8">
        <Price
          value={centsToDisplay(product.price_data.unit_amount)}
          className="type-price tabular-nums text-base leading-tight"
        />
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart md:py-0.5"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
