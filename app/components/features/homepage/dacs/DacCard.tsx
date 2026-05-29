import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity-cms/lib/image";
import Link from "next/link";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function DacCard({ item, idx }: { item: any; idx: number }) {
  if (!item) return null;

  const productName = item.name || "Unknown Product";
  const brandName = item.brand?.name || "Generic";
  const price = item.price_data
    ? `$${centsToDisplay(item.price_data.unit_amount)}`
    : "Contact for Price";

  return (
    <article className="card-product flex h-full flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cardHover">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="rounded-none relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
            {brandName}
          </span>
          <Image
            src={urlFor(item.image).width(400).auto("format").quality(75).url()}
            alt={productName}
            width={400}
            height={400}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-auto max-h-[95%] w-auto max-w-[95%] transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
          />
        </figure>

        <div className="flex min-h-[3rem] flex-col px-4 pb-2">
          <p className="type-body line-clamp-2 font-medium transition-colors group-hover:text-brand-50">
            {productName}
          </p>
        </div>
      </Link>

      <div className="flex items-center px-4 pb-4">
        <p className="type-price text-center text-cap">{price}</p>
        <div className="ml-auto">
          <BasketControls
            productId={item._id}
            isBasketPage={false}
            addClassName="btn-cart"
            wrapperClassName="flex items-center gap-1"
            decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
            incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
            quantityClassName="w-7 text-center type-body text-primary tabular-nums"
          />
        </div>
      </div>
    </article>
  );
}
