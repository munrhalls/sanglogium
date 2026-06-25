import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import { IemProduct } from "./getIemProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { Price } from "@/app/components/ui/Price";
import { centsToDisplay } from "@/lib/utils/price";

export default function IemCard({
  product,
  idx,
}: {
  product: IemProduct;
  idx: number;
}) {
  if (!product) return null;

  const stockStatus = product.stock === 0
    ? { text: 'Out of Stock', color: 'text-error-500' }
    : product.stock <= 5
    ? { text: `Only ${product.stock} left`, color: 'text-warning-500' }
    : { text: 'In Stock', color: 'text-success-500' };

  return (
    <article className="card-product-dark flex h-full flex-col gap-4 !p-3 xs:!p-6">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface-productImage pt-6 pb-2 xs:pt-8 xs:pb-4 md:pt-12">
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            width={375}
            height={375}
            loading="lazy"
            className="h-[70%] w-[70%] object-cover object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-105 xs:h-[60%] xs:w-[60%]"
          />
          <div className="absolute left-2 right-2 top-2 xs:top-3">
            <span className="block truncate text-small font-bold uppercase tracking-editorial text-brand-900">
              {product.brand.name}
            </span>
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute right-2 top-2 xs:top-4">
              <span className="rounded-sm bg-warning-500/20 px-1.5 py-0.5 text-small font-medium uppercase tracking-editorial text-warning-500">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
          <p className={`type-caption ${stockStatus.color}`}>{stockStatus.text}</p>
        </div>
      </Link>

      <div className="flex flex-row items-center justify-between gap-2">
        <Price value={centsToDisplay(product.price_data.unit_amount)} />
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
