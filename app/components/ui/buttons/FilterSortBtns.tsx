"use client";
import { Sliders, ArrowsDownUp } from "@phosphor-icons/react";
import DrawerToggleButton from "./DrawerToggleButton";

export default function FilterSortBtns() {
  return (
    <div className="z-40 flex flex-col items-center gap-1 2xs:flex-row md:hidden">
      <DrawerToggleButton
        param="filter"
        className="flex h-[24px] w-24 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-1 font-medium text-gray-800 transition-colors"
      >
        <Sliders size={13} />
        Filter
      </DrawerToggleButton>

      <DrawerToggleButton
        param="sort"
        className="flex h-[24px] w-24 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-1 font-medium text-gray-800 transition-colors"
      >
        <ArrowsDownUp size={13} />
        Sort
      </DrawerToggleButton>
    </div>
  );
}
