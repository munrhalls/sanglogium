import iems from "./data.json";

export default function IemsGallery() {
  return (
    <section className="py-12 px-4 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
          IEM Collection Audit
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {iems.map((iem) => (
            <div
              key={iem._id}
              className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg hover:border-amber-500/50 transition-colors group"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded bg-zinc-950">
                <img
                  src={iem.imageUrl}
                  alt={iem.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>

              <p className="text-[10px] font-mono text-amber-500 uppercase tracking-tighter">
                {iem.brand}
              </p>
              <h3 className="text-sm font-medium text-zinc-200 line-clamp-2 min-h-[40px] mb-2">
                {iem.name}
              </h3>
              <p className="text-lg font-bold text-zinc-100">${iem.displayPrice}</p>

              <div className="mt-3 pt-3 border-t border-zinc-800/50">
                <code className="text-[9px] text-zinc-600 block truncate">
                  ID: {iem._id}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}