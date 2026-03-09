import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";

export default function SpotlightDetails({ data, accentColor, buttonClass }: any) {
  const formattedPrice = data.displayPrice?.toLocaleString("en-US");

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-4">
        {/* Uses system "small" and standard "widest" tracking */}
        <span className={`text-small font-bold uppercase tracking-widest ${accentColor}`}>
          {data.brand} — {data.headline}
        </span>
        
        {/* Uses fluid "display-2" and cap-height trim utility */}
        <h2 className="text-display-2 font-bold text-brand-50 uppercase leading-none text-cap">
          {data.name}
        </h2>

        <p className="text-body text-secondary-400 leading-relaxed max-w-md">
          {data.subheadline}
        </p>
      </div>

      {/* Structural scale 0.8 (p-8) for internal breathing room */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 border-t border-white/10 pt-8">
        <div className="flex flex-col">
          <span className="text-small uppercase tracking-widest text-secondary-500">MSRP</span>
          <span className="text-h3 font-bold tabular-nums text-brand-50">${formattedPrice}</span>
        </div>
        
        <button className={`flex items-center justify-center gap-3 rounded-full px-8 py-3 transition-all duration-300 active:scale-95 ${buttonClass}`}>
          <ShoppingCartIcon size={20} weight="bold" />
          <span className="text-small font-bold uppercase tracking-widest">Add to cart</span>
        </button>
      </div>
    </div>
  );
}
