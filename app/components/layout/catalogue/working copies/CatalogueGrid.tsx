// export default function CatalogueGrid() {
//   return (
//     <div className="grid h-full w-full grid-cols-12 grid-rows-12">
//       <div className="col-span-5 col-start-2 row-span-4 row-start-1 aspect-square bg-blue-700"></div>

//       <div className="col-span-5 col-start-1 row-span-4 row-start-5 aspect-square bg-blue-800"></div>

//       <div className="col-span-5 col-start-3 row-span-4 row-start-9 aspect-square bg-blue-700"></div>
//       <div className="col-span-6 col-start-7 row-span-3 row-start-5 aspect-square bg-brand-400"></div>
//     </div>
//   );
// }
export default function CatalogueGrid() {
  const satellites = [
    {
      id: 1,
      label: "Top Sub",
      pos: "top-0 left-1/2 -translate-x-1/2",
      color: "bg-blue-700",
    },
    {
      id: 2,
      label: "Middle Sub",
      pos: "top-1/2 left-0 -translate-y-1/2",
      color: "bg-blue-800",
    },
    {
      id: 3,
      label: "Bottom Sub",
      pos: "bottom-0 left-1/2 -translate-x-1/2",
      color: "bg-blue-700",
    },
  ];

  return (
    <div className="relative mx-auto h-[80vh] w-full max-w-md p-4">
      {satellites.map((item) => (
        <div
          key={item.id}
          className={`absolute ${item.pos} flex aspect-square w-32 items-center justify-center rounded-xl p-2 text-center text-white shadow-lg ${item.color}`}
        >
          {item.label}
        </div>
      ))}

      <div className="absolute right-0 top-1/2 flex aspect-square w-40 -translate-y-1/2 items-center justify-center rounded-full bg-brand-400 font-bold text-white shadow-2xl">
        MAIN HUB
      </div>
    </div>
  );
}
