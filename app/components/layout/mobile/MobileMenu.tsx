"use client";

import React from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import Link from "next/link";
// import dynamic from "next/dynamic";
// import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";

// const Authentication = dynamic(
//   () => import("@/app/components/features/auth/Authentication"),
//   {
//     loading: () => (
//       <div className="flex text-white">
//         <div className="mx-auto h-[24px] w-[24px] animate-pulse rounded-full bg-blue-700" />
//         <span className="pl-2">Loading...</span>
//       </div>
//     ),
//     ssr: false,
//   }
// );

// TODO mobile menu has two parts - buttons and mobile drawers
// - entirely contained inside mobile menu component
// - drawers are position fixed and animated via framer motion
// - nuqs does two part url /drawer/<menu name>
// - /drawer is about shell that's on/off only
// - all menu's are inside that one shell
// - shell's job -> respond to on/off only (url)
// - menu manager inside shell, its only job -> read the url part after drawer and display the right menu accordingly
// - Mobile menu has 'mobile drawers' component and the buttons component
// - mobile drawers contains everything about responding to url with the proper drawer behavior

function MobileMenuButtons() {
  const pathname = usePathname();
  // drawer
  const { isOpen, openDrawer, closeDrawer } = useDrawer();

  return (
    <div className="flex h-full items-center justify-around px-4">
      {/* {isMenuOpen ? (
          <Link href={pathname} className="flex flex-col items-center">
            <X size={24} />
          </Link>
        ) : (
          <Link
            href={`${pathname}?menu=true`}
            className="flex flex-col items-center"
          >
            <Menu className="h-5 w-5" />
            <span className="mt-1 hidden text-xs sm:inline-block">Menu</span>
          </Link>
        )} */}

      <button
        onClick={() => (isOpen ? closeDrawer() : openDrawer("catalogue"))}
        className="flex flex-col items-center cursor-pointer touch-manipulation"
        type="button"
        style={{ isolation: 'isolate' }}
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
        <span className="mt-1 hidden text-xs sm:inline-block">Menu</span>
      </button>

      <Link
        href={`${pathname}?search=true`}
        className="flex flex-col items-center cursor-pointer touch-manipulation"
        type="button"
        style={{ isolation: 'isolate' }}
      >
        <Search className="h-5 w-5" />
        <span className="mt-1 hidden text-xs sm:inline-block">Search</span>
      </Link>

      {/* <Authentication /> */}
      <Link href="/basket" className="flex flex-col items-center cursor-pointer touch-manipulation"
        type="button"
        style={{ isolation: 'isolate' }}
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="mt-1 hidden text-xs sm:inline-block">Basket</span>
      </Link>
    </div>
  );
}

export default function MobileMenu() {
  return (
    <div className="z-10 fixed bottom-0 left-0 right-0 h-[var(--mobile-menu-h)] border-t border-white bg-brand-800 text-white lg:hidden">
      <MobileMenuButtons />
    </div>
  );
}
