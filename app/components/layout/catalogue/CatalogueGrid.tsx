export default function CatalogueGrid() {
  return (
    <div className="grid h-full w-full grid-cols-12 grid-rows-12">
      <div className="col-span-5 col-start-2 row-span-4 row-start-1 bg-blue-700"></div>

      <div className="col-span-5 col-start-1 row-span-4 row-start-5 bg-blue-800"></div>

      <div className="col-span-5 col-start-3 row-span-4 row-start-9 bg-blue-700"></div>
      <div className="col-span-6 col-start-7 row-span-5 row-start-4 bg-brand-400"></div>
    </div>
  );
}
