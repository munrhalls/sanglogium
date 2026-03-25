import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

export default function DacCard({ item, idx }: { item: any; idx: number }) {
  if (!item) return null;

  const productName = item.name || "Unknown Product";
  const brandName = item.brand || "Generic";
  const price = item.displayPrice ? `$${item.displayPrice}` : "Contact for Price";

  return (
  <a href={`/products/${item.slug}`} className="block group">
    <article className="card-product flex h-full flex-col gap-4 group-hover:shadow-cardHover group-hover:-translate-y-1 transition-all duration-300">
      <figure className="aspect-[4/3] rounded-none relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
        <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
          {brandName}
        </span>
        <Image
          src={urlFor(item.image).width(400).auto('format').quality(75).url()}
          alt={productName}
          width={400}
          height={400}
          loading="lazy"
          className="h-auto max-h-[95%] w-auto max-w-[95%] transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />
      </figure>

      <div className="flex flex-col min-h-[3rem] pb-2">
        <p className="type-body font-medium transition-colors group-hover:text-brand-50 line-clamp-2">
          {productName}
        </p>
      </div>
      <div className="mt-auto flex items-center">
        <p className="text-cap type-price text-center">{price}</p>
        <button className="btn-cart transition-all active:scale-95 ml-auto">
          <ShoppingCart size={18} weight="regular" />
          <span className="text-cap font-bold">Add</span>
        </button>
      </div>
    </article>
  </a>
  );
}