import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";
import { getAccessoryProducts } from "./getAccessoryProducts";

export default async function Accessories() {
  const { cables, earpads } = await getAccessoryProducts();

  return (
    <div className="w-full w-max-[1280px] space-y-12">
      <AccessoriesHeader />
      {cables.length > 0 && (
        <CategorySection category={{ name: "Cables", filter: "" }} items={cables as any} />
      )}
      {earpads.length > 0 && (
        <CategorySection category={{ name: "Pads", filter: "" }} items={earpads as any} />
      )}
    </div>
  );
}
