import { cn } from "@/platform/utils/tailwind";
import React from "react";
import type { NavigationItem } from "@/features/catalogue/core/rules/catalogue";
import CategoryHero from "./hero/CategoryHero";
import CategoryDetails from "./detail/CategoryDetails";

interface CategoryPanelProps {
  data: NavigationItem;
}

export function CategoryPanel({ data }: CategoryPanelProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "sm:h-full",
        "landscape:h-full landscape:flex-row",
        "lg-desktop:overflow-hidden"
      )}
    >
      <CategoryHero data={data} />
      <CategoryDetails data={data} />
    </div>
  );
}
