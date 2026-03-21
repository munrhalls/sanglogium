"use client";

import React from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
// import dynamic from "next/dynamic";
// import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import { cn } from "@/lib/utils/tailwind";

// const Authentication = dynamic(
//   () => import("@/app/components/features/auth/Authentication"),
//   {
//     loading: () => (
//       <div className="flex text-white">
//         <div className="mx-auto h-[24px] w-[24px] animate-pulse rounded-full bg-blue-700" />
//         <span className="sr-only text-cap pl-2">Loading...</span>
//       </div>
//     ),
//     ssr: false,
//   }
// );



function ActionButtons() {
  const pathname = usePathname();
  const { isOpen, openDrawer, closeDrawer } = useDrawer();

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
        className="flex cursor-pointer touch-manipulation flex-col items-center"
        type="button"
        style={{ isolation: "isolate" }}
      >
        <ShoppingBag className="h-5 w-5" />
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
      style={{ display: "var(--mobile-menu-display)" }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "h-[var(--mobile-menu-h)] border-t border-white bg-brand-800 text-white"
      )}
    >
      <ActionButtons />
    </div>
  );
}
