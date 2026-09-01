"use client";

import React from "react";
import { ListIcon, XIcon, List as Menu, MagnifyingGlass as Search, ShoppingBag, User as UserIcon, SignIn as SignInIcon, UserPlus } from "@phosphor-icons/react";
import Link from "next/link";
import { useDrawer } from "@/app/hooks/nuqs/useDrawer";
import { useSearchOverlay } from "@/app/hooks/nuqs/useSearchOverlay";
import { cn } from "@/lib/utils/tailwind";
import useBasketStore, { selectTotalItemsCount, selectHasHydrated } from "@/store/basketStore";



interface ActionButtonsProps {
  isAuthenticated: boolean;
}

function ActionButtons({ isAuthenticated }: ActionButtonsProps) {
  const { isOpen, openDrawer, closeDrawer } = useDrawer();
  const { isSearchOpen, openSearch, closeSearch } = useSearchOverlay();
  const basketCount = useBasketStore(selectTotalItemsCount);
  const hasHydrated = useBasketStore(selectHasHydrated);

  const displayCount = hasHydrated ? basketCount : 0;

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

      <button
        id="mobile-search-trigger"
        onClick={() => (isSearchOpen ? closeSearch() : openSearch())}
        className="flex sm:hidden cursor-pointer touch-manipulation flex-col items-center"
        type="button"
        style={{ isolation: "isolate" }}
        aria-label={isSearchOpen ? "Close search" : "Open search"}
      >
        {isSearchOpen ? (
          <XIcon className="h-5 w-5" />
        ) : (
          <Search className="h-5 w-5" />
        )}
        <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
          Search
        </span>
      </button>

      {isAuthenticated ? (
        <Link
          href="/account"
          className="flex cursor-pointer touch-manipulation flex-col items-center"
          type="button"
          style={{ isolation: "isolate" }}
        >
          <UserIcon className="h-5 w-5" />
          <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
            Account
          </span>
        </Link>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="flex cursor-pointer touch-manipulation flex-col items-center"
            type="button"
            style={{ isolation: "isolate" }}
          >
            <SignInIcon className="h-5 w-5" />
            <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
              Sign In
            </span>
          </Link>
          <Link
            href="/sign-up"
            className="flex cursor-pointer touch-manipulation flex-col items-center"
            type="button"
            style={{ isolation: "isolate" }}
          >
            <UserPlus className="h-5 w-5" />
            <span className="sr-only mt-1 hidden text-xs text-cap sm:inline-block">
              Sign Up
            </span>
          </Link>
        </>
      )}

      <Link
        href="/basket"
        className="flex cursor-pointer touch-manipulation flex-col items-center relative"
        type="button"
        style={{ isolation: "isolate" }}
        data-testid="basket-button"
      >
        <ShoppingBag className="h-5 w-5" />
        {hasHydrated && basketCount > 0 && (
          <span data-testid="basket-badge" className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-brand-400 text-brand-900 text-xs flex items-center justify-center font-bold rounded-[2px]">
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

export default function ActionBar({ isAuthenticated }: ActionButtonsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "h-[var(--mobile-menu-h)] border-t border-white bg-brand-800 text-white",
        "lg-touch:hidden lg-desktop:hidden"
      )}
    >
      <ActionButtons isAuthenticated={isAuthenticated} />
    </div>
  );
}
