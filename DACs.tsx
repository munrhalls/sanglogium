import dacs from "./data.json";
import Grid from "@/app/components/layout/grid/Grid";
import Shelf from "@/app/components/layout/general/Shelf";

export default function DACs() {
  return (
    <Shelf className="bg-zinc-950">
      <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
        <div>
          <h2 className="text-display-3 font-light tracking-tight text-white uppercase">
            Signal <span className="text-brand-400 font-bold">&</span> Power
          </h2>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-mono">
            Premium DACs, Amps, and Receivers
          </p>
        </div>
        <div className="text-zinc-700 font-mono text-xs hidden md:block">
          // SYSTEM_COUNT: {dacs.length} UNITS
        </div>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12">
        {dacs.map((item: any) => (
          <div
            key={item._id}
            className="group relative flex flex-col hover:bg-zinc-900/30 p-4 transition-all duration-300"
          >
            <div className="aspect-video mb-6 overflow-hidden bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-brand-400/50 transition-colors">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
              />
            </div>

            <span className="text-[10px] font-bold text-brand-500 tracking-[0.2em] uppercase mb-2">
              {item.brand}
            </span>
            
            <h3 className="text-body text-zinc-200 line-clamp-1 group-hover:text-white mb-4">
              {item.name}
            </h3>

            <div className="mt-auto flex justify-between items-center border-t border-zinc-800 pt-4">
              <span className="text-xl font-light text-zinc-100">
                
              </span>
              <button className="text-[9px] uppercase tracking-widest text-zinc-500 border border-zinc-800 px-3 py-1.5 group-hover:border-brand-400 group-hover:text-brand-400 transition-colors">
                Specs
              </button>
            </div>
          </div>
        ))}
      </Grid>
    </Shelf>
  );
}
