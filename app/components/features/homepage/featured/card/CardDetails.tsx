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
  const formattedPrice = price?.toLocaleString() ?? "";

  return (
    <div className="flex flex-1 flex-col bg-[#111111]">
      <div className="flex flex-col gap-2 p-8 pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-secondary-500">
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

      <div className="mt-auto flex items-center justify-between border-t border-white/10 p-8 py-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-secondary-500">Price</span>
          <span className="text-body font-bold tabular-nums text-brand-50">
            ${formattedPrice}
          </span>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-accent-500 px-6 py-2 transition-all duration-300 hover:bg-accent-400 active:scale-95">
          <ShoppingCartIcon size={18} weight="bold" className="text-brand-900" />
          <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-brand-900">
            Add to cart
          </span>
        </button>
      </div>
    </div>
  );
}
