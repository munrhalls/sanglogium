"use client";

import React from "react";
import { ListIcon, XIcon, List as Menu, MagnifyingGlass as Search, ShoppingBag } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import { cn } from "@/lib/utils/tailwind";
// TODO: Import from new basket store when implemented
// import { useBasketStore, selectBasketCount, selectHasHydrated } from "@/store/store";



function ActionButtons() {
  const pathname = usePathname();
  const { isOpen, openDrawer, closeDrawer } = useDrawer();
  // TODO: Re-implement when new basket store is available
  // const basketCount = useBasketStore(selectBasketCount);
  // const hasHydrated = useBasketStore(selectHasHydrated);
  const basketCount = 0; // TODO: Remove placeholder
  const hasHydrated = true; // TODO: Remove placeholder

  return (
    <div className="flex h-full items-center justify-around px-4">


      <button
        onClick={() => (isOpen ? closeDrawer() : openDrawer("catalogue"))}
        className="flex cursor-pointer touch-manipulation flex-col items-center"
        type="button"
        style={{ isolation: "isolate" }}
      >
        {/* TODO: use phosphor icons - when the menu is open, the button should turn to close X icon */}
        {isOpen ? (
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* The Circle Highlight */}
            <div className="absolute h-6 w-6 rounded-full bg-white/5 ring-1 ring-white/10" />

            {/* The Icon */}
            <XIcon className="relative h-5 w-5 text-brand-200" weight="bold" />
          </div>
        ) : (
          <ListIcon className="h-5 w-5" weight="bold" />
        )}
        <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
          Menu
        </span>
      </button>

      <Link
        href={`${pathname}?search=true`}
        className="flex cursor-pointer touch-manipulation flex-col items-center"
        type="button"
        style={{ isolation: "isolate" }}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
          Search
        </span>
      </Link>

      {/* <Authentication /> */}
      <Link
        href="/basket"
        className="flex cursor-pointer touch-manipulation flex-col items-center relative"
        type="button"
        style={{ isolation: "isolate" }}
      >
        <ShoppingBag className="h-5 w-5" />
        {hasHydrated && basketCount > 0 && (
          <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-brand-400 text-brand-900 text-xs flex items-center justify-center font-bold rounded-[2px]">
            {basketCount > 99 ? '99+' : basketCount}
          </span>
        )}
        <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
          Basket
        </span>
      </Link>
    </div>
  );
}

export default function ActionBar() {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "h-[var(--mobile-menu-h)] border-t border-white bg-brand-800 text-white",
        "lg-touch:hidden lg-desktop:hidden"
      )}
    >
      <ActionButtons />
    </div>
  );
}
