import data from "./data.json";

export default function Accessories() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 border-b border-zinc-100 pb-4">
          Essentials & Accessories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item) => (
            <div key={item._id} className="group border border-zinc-100 p-4 hover:shadow-lg transition-shadow bg-white">
              <div className="aspect-square mb-4 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">{item.brand}</p>
              <h3 className="text-sm font-medium text-zinc-800 line-clamp-2 min-h-[40px] mt-1">
                {item.name}
              </h3>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-900">${item.displayPrice}</span>
                <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-500 uppercase">In Stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}