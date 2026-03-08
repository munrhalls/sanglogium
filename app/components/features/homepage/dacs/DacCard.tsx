import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function DacCard({ item }: { item: any }) {
  return (
    <div className="group p-4 bg-brand-800/10 border border-brand-800/20 hover:border-brand-400/40 transition-all">
      <CarouselMediaBox src={item.imageUrl} alt={item.name} />
      <div className="space-y-1">
        <span className="text-small text-cap font-bold text-brand-400 uppercase">{item.brand}</span>
        <h4 className="text-body font-medium text-brand-100 line-clamp-1">{item.name}</h4>
        <p className="text-body font-bold text-accent-500">${item.displayPrice}</p>
      </div>
    </div>
  );
}
