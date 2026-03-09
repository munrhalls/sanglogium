import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";

export default function SpotlightDetails({ data, accentColor, buttonClass }: any) {
  const formattedPrice = data.displayPrice?.toLocaleString("en-US");

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-col gap-2">
        <span className={`text-small font-bold uppercase tracking-[0.2em] ${accentColor}`}>
          {data.brand}
        </span>
        <h2 className="text-display-2 font-bold text-brand-50 italic uppercase leading-none">
          {data.name}
        </h2>
        <p className="text-body text-secondary-300 leading-relaxed max-w-xl">
          {data.headline} — {data.subheadline}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-small uppercase tracking-widest text-secondary-500">Price</span>
          <span className="text-h3 font-bold tabular-nums text-brand-50">${formattedPrice}</span>
        </div>
        
        <button className={`flex items-center gap-2 rounded-full px-8 py-3 transition-all duration-300 active:scale-95 ${buttonClass}`}>
          <ShoppingCartIcon size={20} weight="bold" />
          <span className="font-sans text-small font-bold uppercase tracking-widest sm:hidden">Add</span>
          <span className="hidden font-sans text-small font-bold uppercase tracking-widest sm:block">Add to cart</span>
        </button>
      </div>
    </div>
  );
}
