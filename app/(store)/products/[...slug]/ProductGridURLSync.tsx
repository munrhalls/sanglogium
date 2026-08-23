"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  installLocationChangeEvent,
  LOCATION_CHANGE_EVENT,
} from "@/lib/catalogue/urlChangeEvents";

/** How long the URL must sit still before we ask the Server again. */
const DEBOUNCE_MS = 300;

/**
 * Watches the URL and re-asks the Server once it has settled.
 *
 * This is the Product Grid actor "waiting a beat" — the URL writer (Filters &
 * Sorting) updates the address bar instantly and is never blocked by this
 * component; only the re-fetch is debounced. Intermediate URLs during a
 * rapid-fire burst never trigger a request at all, and because Next supersedes
 * an in-flight RSC fetch on a newer one, only the latest state can ever land.
 *
 * Renders nothing. Reads the URL, never writes it — `router.refresh()` only,
 * never `push`/`replace`. Knows nothing about how the URL got its value.
 */
export function ProductGridURLSync() {
  const router = useRouter();
  // The URL state we have already asked the Server for. Seeded on mount so the
  // initial server render never triggers a redundant refresh.
  const appliedSearch = useRef<string | null>(null);

  useEffect(() => {
    installLocationChangeEvent();

    if (appliedSearch.current === null) {
      appliedSearch.current = window.location.search;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const onUrlChange = () => {
      // Restart the window on every change, so a burst collapses into one
      // refresh fired only after the URL has been quiet for DEBOUNCE_MS.
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const settled = window.location.search;
        // A burst that ends where it started is a no-op — nothing to re-ask.
        if (settled === appliedSearch.current) return;
        appliedSearch.current = settled;
        router.refresh();
      }, DEBOUNCE_MS);
    };

    window.addEventListener(LOCATION_CHANGE_EVENT, onUrlChange);
    window.addEventListener("popstate", onUrlChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener(LOCATION_CHANGE_EVENT, onUrlChange);
      window.removeEventListener("popstate", onUrlChange);
    };
  }, [router]);

  return null;
}
