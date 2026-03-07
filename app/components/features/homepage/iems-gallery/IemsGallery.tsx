import Image from "next/image";
import iems from "./data.json";
import Grid from "@/app/components/layout/grid/Grid";
import Shelf from "@/app/components/layout/general/Shelf";

export default function IemsGallery() {
  return (
    <div className="w-full">
      <div className="mb-12">
        <h2 className="text-display-2 font-bold uppercase italic leading-none">
          IEM Collection
        </h2>
        <p className="text-brand-400 font-mono text-xs uppercase tracking-[0.2em] mt-2">
          Precision Engineered Audio
        </p>
      </div>

      <Grid cols={4}>
        {iems.map((iem) => (
          <div
            key={iem._id}
            className="group bg-brand-800/10 border border-brand-800/20 p-5 rounded-sm hover:border-brand-400/50 transition-all duration-500"
          >
            <div className="aspect-square mb-6 overflow-hidden bg-black/40 flex items-center justify-center p-4">
              <div className="relative w-full h-full"><Image src={iem.imageUrl} alt={iem.name} fill className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 33vw" /></div>
            </div>

            <p className="text-[10px] font-mono text-brand-400 uppercase tracking-widest mb-1">
              {iem.brand}
            </p>

            <h3 className="text-body font-medium text-brand-100 line-clamp-2 min-h-[3rem] leading-snug">
              {iem.name}
            </h3>

            <div className="mt-4 pt-4 border-t border-brand-800/30 flex justify-between items-baseline">
              <p className="text-xl font-bold text-brand-50">${iem.displayPrice}</p>
              <span className="text-[10px] font-mono text-brand-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                View Details
              </span>
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}

