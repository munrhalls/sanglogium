import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";
import type { AccessoryData } from "@/sanity-cms/lib/homepage/getHomepageData";

interface AccessoriesProps {
  accessoriesData: AccessoryData;
}

const CATEGORIES: { key: keyof AccessoriesProps["accessoriesData"]; name: string }[] = [
  { key: "cables", name: "Cables" },
  { key: "interconnects", name: "Interconnects" },
  { key: "adapters", name: "Adapters" },
  { key: "earpads", name: "Pads" },
  { key: "eartips", name: "Eartips" },
  { key: "careCleaning", name: "Care & Cleaning" },
  { key: "storage", name: "Storage" },
];

export default async function Accessories({ accessoriesData }: AccessoriesProps) {
  return (
    <article className="w-full relative overflow-hidden bg-brand-700">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content space-y-12 px-6 py-4 md:py-6 lg:py-3 lg-touch:py-2 lg:px-8">
          <div className="text-brand-700">
            <AccessoriesHeader />
          </div>
          {CATEGORIES.map(({ key, name }) => {
            const items = accessoriesData[key];
            if (!items || items.length === 0) return null;
            return (
              <CategorySection
                key={key}
                category={{ name, filter: "" }}
                items={items as any}
              />
            );
          })}
        </div>
      </div>
    </article>
  );
}
