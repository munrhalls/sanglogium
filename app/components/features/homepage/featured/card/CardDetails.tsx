import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";

export default function CardDetails({
  name,
  brand,
  price,
  description = "Premium acoustic engineering with artisan craftsmanship."
}: {
  name: string;
  brand: string;
  price: number;
  description?: string;
}) {
  const formattedPrice = price?.toLocaleString("en-US") ?? "";

  return (
    <div className="flex flex-1 flex-col bg-brand-900">
      <div className="flex flex-col gap-2 p-5 sm:p-8 pb-4 sm:pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-[0.2em] text-secondary-500">
            {brand}
          </span>
          <div className="h-[1px] w-4 bg-brand-500/30" />
        </div>
        <h3 className="line-clamp-1 text-h3 font-light leading-tight tracking-tight text-secondary-50 transition-colors duration-500 group-hover:text-accent-400">
          {name}
        </h3>
        <p className="line-clamp-2 text-small leading-relaxed text-secondary-300">
          {description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 p-5 sm:p-8 py-4 sm:py-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-secondary-500">Price</span>
          <span className="text-body font-bold tabular-nums text-brand-50">
            ${formattedPrice}
          </span>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 sm:px-6 transition-all duration-300 hover:bg-accent-400 active:scale-95">
          <ShoppingCartIcon size={18} weight="bold" className="text-brand-900" />
          <span className="font-sans text-small font-bold text-brand-900 xs:block md:hidden">
            Add
          </span>
          <span className="hidden font-sans text-small font-bold text-brand-900 md:block">
            Add to cart
          </span>
        </button>
      </div>
    </div>
  );
}


