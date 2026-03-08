import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function AccessoryCard({ item }: { item: any }) {
  return (
    <div className="bg-brand-800/10 border border-brand-800/20 p-4 group transition-all duration-500 hover:border-brand-400/40">
      <CarouselMediaBox src={item.imageUrl} alt={item.name} />
      <div className="space-y-2">
        <span className="text-small text-cap font-bold uppercase text-brand-400">{item.brand}</span>
        <h4 className="text-body font-medium leading-tight text-brand-100 line-clamp-2 h-12">{item.name}</h4>
        <div className="flex justify-between items-center pt-2 border-t border-brand-800/30">
          <span className="text-body font-bold text-accent-500">${item.displayPrice}</span>
          <button className="text-small text-cap font-bold text-brand-400 uppercase hover:text-brand-100 transition-colors">+ Add</button>
        </div>
      </div>
    </div>
  );
}
