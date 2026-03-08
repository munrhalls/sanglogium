export default function CardDetails({ name, brand, price }: { name: string; brand: string; price: number }) {
  return (
    <div className="p-8 pt-6 flex flex-col justify-between flex-1">
      <div className="flex flex-col gap-2">
        <span className="text-small font-mono text-secondary-400 uppercase tracking-tighter">
          {brand}
        </span>
        <h3 className="text-h3 font-light leading-tight text-brand-900 line-clamp-2">
          {name}
        </h3>
      </div>
      <div className="mt-8 flex items-baseline justify-between pt-6 border-t border-secondary-100">
        <span className="text-body font-bold text-brand-900">${price}</span>
        <span className="text-small font-bold uppercase tracking-widest text-brand-600 transition-all group-hover:translate-x-1">
          Shop
        </span>
      </div>
    </div>
  );
}
