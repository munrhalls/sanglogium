"use client";

import React from "react";
import { ListIcon, XIcon, List as Menu, MagnifyingGlass as Search, ShoppingBag, User as UserIcon, SignIn as SignInIcon, UserPlus } from "@phosphor-icons/react";
import Link from "next/link";
import { useDrawer } from "@/app/components/layout/drawers/useDrawer";
import { useSearchOverlay } from "@/features/product-search";
import { cn } from "@/platform/utils/tailwind";
import { useBasketStore, selectTotalItemsCount, selectHasHydrated } from "@/features/basket";



interface ActionButtonsProps {
  isAuthenticated: boolean;
}

function ActionButtons({ isAuthenticated }: ActionButtonsProps) {
  const { isOpen, openDrawer, closeDrawer } = useDrawer();
  const { isSearchOpen, openSearch, closeSearch } = useSearchOverlay();
  const basketCount = useBasketStore(selectTotalItemsCount);
  const hasHydrated = useBasketStore(selectHasHydrated);

  const displayCount = hasHydrated ? basketCount : 0;

  // Every control shares one full-height, equal-width hit area (the bar is 44px
  // tall, the minimum touch target) and carries an accessible name: the labels
  // beneath the icons are hidden visually, so aria-label is the only name.
  const item =
    "flex h-full min-w-11 flex-1 cursor-pointer touch-manipulation items-center justify-center";
  const iso = { isolation: "isolate" } as const;

  return (
    <div className="flex h-full items-stretch justify-around px-2">
      <button
        onClick={() => (isOpen ? closeDrawer() : openDrawer("catalogue"))}
        className={item}
        type="button"
        style={iso}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* The Circle Highlight */}
            <div className="absolute h-6 w-6 rounded-full bg-white/5 ring-1 ring-white/10" />

            {/* The Icon */}
            <XIcon className="relative h-5 w-5 text-brand-200" weight="bold" aria-hidden="true" />
          </div>
        ) : (
          <ListIcon className="h-5 w-5" weight="bold" aria-hidden="true" />
        )}
      </button>

      <button
        id="mobile-search-trigger"
        onClick={() => (isSearchOpen ? closeSearch() : openSearch())}
        className={cn(item, "sm:hidden")}
        type="button"
        style={iso}
        aria-label={isSearchOpen ? "Close search" : "Open search"}
        aria-expanded={isSearchOpen}
      >
        {isSearchOpen ? (
          <XIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Search className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isAuthenticated ? (
        <Link href="/account" className={item} style={iso} aria-label="Account">
          <UserIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
      ) : (
        <>
          <Link href="/sign-in" className={item} style={iso} aria-label="Sign in">
            <SignInIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/sign-up" className={item} style={iso} aria-label="Sign up">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </Link>
        </>
      )}

      <Link
        href="/basket"
        className={item}
        style={iso}
        data-testid="basket-button"
        aria-label={
          displayCount > 0
            ? `Basket, ${displayCount} ${displayCount === 1 ? "item" : "items"}`
            : "Basket"
        }
      >
        <span className="relative flex">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {hasHydrated && basketCount > 0 && (
            <span
              data-testid="basket-badge"
              aria-hidden="true"
              className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-[2px] bg-brand-400 text-xs font-bold text-brand-900"
            >
              {basketCount > 99 ? "99+" : basketCount}
            </span>
          )}
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
