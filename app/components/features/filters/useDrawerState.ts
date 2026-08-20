"use client";

import { useEffect, useSyncExternalStore } from "react";

let drawerOpen = false;
const subscribers = new Set<() => void>();

function getSnapshot() {
  return drawerOpen;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function setDrawerOpen(value: boolean) {
  if (drawerOpen === value) return;
  drawerOpen = value;
  subscribers.forEach((cb) => cb());
}

/**
 * Shared mobile filter-drawer open/close state, decoupled from facet data.
 * The trigger button lives in SortAndCountBar, which renders instantly;
 * the drawer's content lives in ProductsToolbar, which waits on facet data.
 * Sharing this state lets the trigger work immediately even before the
 * drawer's content has mounted.
 */
export function useDrawerState() {
  const isOpen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const onPopState = () => setDrawerOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const open = () => {
    if (drawerOpen) return;
    window.history.pushState({ filterDrawer: true }, "");
    setDrawerOpen(true);
  };

  const close = () => {
    if (!drawerOpen) return;
    setDrawerOpen(false);
    window.history.back();
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="open-filters-button"]')
        ?.focus();
    });
  };

  return { isOpen, open, close };
}
