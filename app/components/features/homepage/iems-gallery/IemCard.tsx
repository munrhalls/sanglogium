import GridMediaBox from "@/app/components/layout/grid/GridMediaBox";

export default function IemCard({ iem }: { iem: any }) {
  return (
    <div className="group cursor-pointer">
      <GridMediaBox src={iem.imageUrl} alt={iem.name} />
      <div className="mt-4 space-y-1">
        <p className="text-small text-cap uppercase font-bold text-brand-400">{iem.brand}</p>
        <h3 className="text-body font-medium text-brand-100 line-clamp-1">{iem.name}</h3>
        <p className="text-small text-secondary-400">${iem.displayPrice}</p>
      </div>
    </div>
  );
}
