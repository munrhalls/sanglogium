import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";
import { getAccessoryProducts } from "./getAccessoryProducts";

export default async function Accessories() {
  const { cables, earpads } = await getAccessoryProducts();

  return (
    <article className="w-full relative overflow-hidden bg-brand-700">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-[1280px] py-16 space-y-12">
          <AccessoriesHeader />
          {cables.length > 0 && (
            <CategorySection category={{ name: "Cables", filter: "" }} items={cables as any} />
          )}
          {earpads.length > 0 && (
            <CategorySection category={{ name: "Pads", filter: "" }} items={earpads as any} />
          )}
        </div>
      </div>
    </article>
  );
}
