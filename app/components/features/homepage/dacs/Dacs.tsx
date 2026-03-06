import dacs from "./data.json";

export default function DACs() {
  return (
    <section className="py-16 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-white uppercase">
              Signal <span className="text-amber-500 font-bold">&</span> Power
            </h2>
            <p className="text-zinc-500 text-sm mt-2">Premium DACs, Amps, and Receivers</p>
          </div>
          <div className="text-zinc-700 font-mono text-xs">
            COUNT: {dacs.length} UNITS
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dacs.map((item) => (
            <div
              key={item._id}
              className="group relative border-l border-zinc-800 pl-6 py-4 hover:border-amber-500 transition-colors"
            >
              <div className="aspect-video mb-6 overflow-hidden bg-zinc-900 flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">
                {item.brand}
              </span>
              <h3 className="text-lg text-zinc-200 mt-1 mb-4 line-clamp-1 group-hover:text-white">
                {item.name}
              </h3>

              <div className="flex justify-between items-center">
                <span className="text-xl font-light text-zinc-100">
                  ${item.displayPrice.toLocaleString()}
                </span>
                <button className="text-[10px] uppercase tracking-tighter text-zinc-500 border border-zinc-800 px-2 py-1 group-hover:border-amber-500 group-hover:text-amber-500">
                  View Specs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}