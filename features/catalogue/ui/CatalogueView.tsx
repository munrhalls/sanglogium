import { cn } from "@/platform/utils/tailwind";
import React from "react";
import type { NavigationItem } from "@/features/catalogue/domain/catalogue";
import SliceHero from "./hero/SliceHero";
import SliceDetails from "./details/SliceDetails";

interface CatalogueViewProps {
  data: NavigationItem;
}

export function CatalogueView({ data }: CatalogueViewProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "sm:h-full",
        "landscape:h-full landscape:flex-row",
        "lg-desktop:overflow-hidden"
      )}
    >
      <SliceHero data={data} />
      <SliceDetails data={data} />
    </div>
  );
}
