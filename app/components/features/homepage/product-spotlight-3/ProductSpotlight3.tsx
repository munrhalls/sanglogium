import product from "./prod.json";
import copyData from "./copy.json";

export default function ProductSpotlight() {
  // Cast to any for the audit if TS is still complaining about the JSON structure
  const copy = copyData as any;

  return (
    <section className="border-2 border-dotted border-amber-500 p-4">
      <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
        Raw Audit: {product.slug}
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="bg-zinc-900 p-4 rounded shrink-0">
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full max-w-md h-auto object-contain"
          />
        </div>

        <div className="flex-1">
          <p className="text-amber-500 font-mono text-sm">{product.brand}</p>
          <h1 className="text-4xl font-bold my-2">{product.name}</h1>

          {product.isGold && (
            <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded">
              GOLD STATUS
            </span>
          )}

          <p className="text-2xl text-zinc-300 my-4">${product.displayPrice}</p>

          <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
            <h3 className="text-xs font-bold uppercase mb-2 text-zinc-400">Marketing Truth (copy.json):</h3>
            <div className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
              {/* Using the string property specifically */}
              {typeof copy.text === 'string' ? copy.text : "Error: Data is not a string"}
            </div>
          </div>

          <p className="mt-4 text-[10px] text-zinc-600 font-mono uppercase">
            System ID: {product.id}
          </p>
        </div>
      </div>
    </section>
  );
}