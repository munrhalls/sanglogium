"use client";

import data from "./data.json";

export default function Accessories() {
  const categories = [
    { name: "Cables", filter: "cable" },
    { name: "Pads", filter: "pad" },
    { name: "Storage", filter: "case" }
  ];

  return (
    <div className="w-full bg-white py-10 px-4 md:px-12">
      <div className="max-w-screen-2xl mx-auto space-y-12">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-3xl font-bold uppercase italic text-black">
            Essentials <span className="text-brand-400">&</span> Accessories
          </h2>
        </div>

        {categories.map((cat) => (
          <CategorySection key={cat.name} category={cat} />
        ))}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: { name: string, filter: string } }) {
  const filteredItems = data.filter(item =>
    item.name.toLowerCase().includes(category.filter) ||
    item.category?.toLowerCase() === category.filter
  );

  if (filteredItems.length === 0) return null;

  return (
    <section>
      <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-brand-400" />
        {category.name}
      </h3>

      {/* Native Scroll Container: 2 columns on mobile, no extra JS wrappers */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {filteredItems.map((item) => (
          <div
            key={item._id}
            className="min-w-[130px] w-[calc(50%-12px)] md:w-[220px] flex-shrink-0 snap-start border border-zinc-100 p-2 group"
          >
            {/* Forced Height Image Container */}
            <div className="h-28 w-full bg-zinc-50 flex items-center justify-center p-4 mb-2">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[7px] font-black uppercase tracking-tighter text-brand-500">
                {item.brand}
              </span>
              <h4 className="text-[10px] font-medium leading-tight text-zinc-800 line-clamp-2 h-7">
                {item.name}
              </h4>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                <span className="text-[11px] font-bold text-black">

                </span>
                <button className="text-[9px] font-bold text-brand-500 uppercase">
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
