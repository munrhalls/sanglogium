"use client";
import data from "./data.json";
import AccessoriesHeader from "./AccessoriesHeader";
import CategorySection from "./CategorySection";

export default function Accessories() {
  const categories = [
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
