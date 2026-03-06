import data from "./data.json";

export default function NewestRelease() {
  return (
    <section className="relative w-full bg-white text-black overflow-hidden border-y border-zinc-200">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        <div className="lg:w-3/5 bg-zinc-50 flex items-center justify-center p-8 lg:p-16">
          <div className="relative group">
            <div className="absolute -inset-4 bg-zinc-200/50 rounded-full blur-3xl group-hover:bg-amber-100/50 transition-colors duration-1000"></div>
            <img
              src={data.imageUrl}
              alt={data.name}
              className="relative max-h-[450px] w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="lg:w-2/5 p-12 lg:p-20 flex flex-col justify-center border-l border-zinc-100">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-amber-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600">{data.tag}</span>
          </div>

          <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
            {data.brand}
          </h2>
          <h3 className="text-5xl font-light leading-none mb-8 tracking-tighter">
            {data.name}
          </h3>

          <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-light max-w-sm italic">
            "{data.description}"
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-zinc-400 uppercase font-bold">MSRP</span>
              <span className="text-4xl font-light tracking-tighter">
                ${data.displayPrice.toLocaleString()}
              </span>
            </div>

            <button className="w-full lg:w-fit bg-black text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95">
              Discover the 10 Series
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}