import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";
import { getAccessoryProducts } from "./getAccessoryProducts";

export default async function Accessories() {
  const { cables, earpads, storage } = await getAccessoryProducts();

  return (
    <div className="w-full space-y-20">
      <AccessoriesHeader />
      {cables.length > 0 && (
        <CategorySection category={{ name: "Cables", filter: "" }} items={cables as any} />
      )}
      {earpads.length > 0 && (
        <CategorySection category={{ name: "Pads", filter: "" }} items={earpads as any} />
      )}
      {storage.length > 0 && (
        <CategorySection category={{ name: "Storage", filter: "" }} items={storage as any} />
      )}
    </div>
  );
}
