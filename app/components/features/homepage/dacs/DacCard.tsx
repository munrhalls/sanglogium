import Image from "next/image";

interface DacCardProps {
  item: {
    _id: string;
    name: string;
    brand: string;
    imageUrl: string;
    displayPrice: number;
  };
}

export default function DacCard({ item }: DacCardProps) {
  return (
    <div className="group relative border-l border-brand-800/30 pl-6 py-4 hover:border-brand-400 transition-colors duration-500">
      <div className="aspect-video mb-6 overflow-hidden bg-brand-800/10 flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </div>
      <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase text-cap">
        {item.brand}
      </span>
      <h3 className="text-body font-medium text-brand-100 mt-1 mb-4 line-clamp-1 group-hover:text-white transition-colors">
        {item.name}
      </h3>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-brand-50">
          ${item.displayPrice.toLocaleString()}
        </span>
        <button className="text-[10px] uppercase tracking-widest text-brand-400 border border-brand-800/50 px-3 py-1 group-hover:border-brand-400 group-hover:text-brand-100 transition-all">
          Specs
        </button>
      </div>
    </div>
  );
}