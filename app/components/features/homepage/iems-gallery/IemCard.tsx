export default function IemCard({ product }: { product: any }) {
  return (
    <div className="group relative flex flex-col gap-4 p-4 rounded-xl border border-transparent hover:bg-brand-800/20 transition-all">
      <div className="flex flex-col gap-1">
        <span className="text-small font-mono uppercase tracking-widest text-brand-400">
          {product.category}
        </span>
        <h3 className="text-small font-bold text-brand-100 truncate">
          {product.name}
        </h3>
      </div>
    </div>
  );
}
