import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import { IemProduct } from "./getIemProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function IemCard({
  product,
  idx,
}: {
  product: IemProduct;
  idx: number;
}) {
  if (!product) return null;

  return (
    <article className="card-product-dark flex h-full flex-col gap-4 p-0 xs:p-6">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-t-lg bg-surface-productImage pb-0 pt-0 md:pt-12 xs:pb-4 xs:pt-8">
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            width={375}
            height={375}
            loading="lazy"
            className="h-[70%] w-[70%] object-cover object-center transition-transform duration-300 group-hover:scale-105 xs:h-[60%] xs:w-[60%]"
          />
          <div className="absolute left-2 top-2 xs:top-4">
            <span className="whitespace-nowrap text-[7px] font-bold uppercase tracking-editorial text-brand-900 xs:whitespace-normal xs:text-small">
              {product.brand.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col px-4 xs:gap-1">
          <p className="type-overline mb-1">In-Ear Monitors</p>
          <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
          <p className="type-price mt-2">
            ${centsToDisplay(product.price_data.unit_amount)}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
