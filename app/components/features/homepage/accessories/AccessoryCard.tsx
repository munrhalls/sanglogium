import Image from "next/image";

interface AccessoryItem {
  _id: string;
  name: string;
  brand: string;
  imageUrl: string;
  displayPrice: number;
}

export default function AccessoryCard({ item }: { item: AccessoryItem }) {
  return (
    <div className="bg-brand-800/10 border border-brand-800/20 p-4 group transition-all duration-500 hover:border-brand-400/40">
      <div className="h-32 w-full flex items-center justify-center p-2 mb-4 bg-black/20">
        <div className="relative w-full h-full">
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" 
            sizes="(max-width: 768px) 100vw, 33vw" 
          />
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-400">
          {item.brand}
        </span>
        <h4 className="text-[11px] font-medium leading-tight text-brand-100 line-clamp-2 h-8">
          {item.name}
        </h4>
        <div className="flex justify-between items-center pt-2 border-t border-brand-800/30">
          <span className="text-xs font-bold text-brand-200">${item.displayPrice}</span>
          <button className="text-[9px] font-bold text-brand-400 uppercase hover:text-brand-100 transition-colors">
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}