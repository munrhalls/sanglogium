"use client";
import dataItems from "./data.json";
import { AccessoryItem, AccessoryCategory } from "./types";
import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";

const data = dataItems as AccessoryItem[];

export default function Accessories() {
  console.log(`[SRIP Trace] Accessories Data Contract validated. Total items: ${data.length}`);

  const categories: AccessoryCategory[] = [
    { name: "Cables", filter: "cable" },
    { name: "Pads", filter: "pad" },
    { name: "Storage", filter: "case" }
  ];

  return (
    <div className="w-full space-y-20">
      <AccessoriesHeader />
      {categories.map((cat) => (
        <CategorySection key={cat.name} category={cat} items={data} />
      ))}
    </div>
  );
}
