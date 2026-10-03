"use client";

import { useEffect } from "react";
import { REVEAL_SCRIPT } from "./ImageRevealScript";

/* Client companion to <ImageRevealScript> — makes the blur→sharp reveal
 * resilient to client navigation and history restore, without owning or gating
 * image visibility (it renders nothing; the real load event still drives every
 * first-view reveal — AI_LESSONS L02/L11).
 *
 * Three gaps the inline <script> alone leaves:
 *
 *  1. Soft navigation onto a grid route when the first landing page was NOT a
 *     grid route (e.g. home → /products). React does not execute an inline
 *     <script dangerouslySetInnerHTML> inserted during client rendering, so the
 *     capture-phase load listener would never be installed. This effect injects
 *     REVEAL_SCRIPT once (a real <script> node executes synchronously on
 *     append); its own `window.__slImageReveal` guard makes re-injection a
 *     no-op when the inline copy already ran.
 *
 *  2. Back / Forward (bfcache or RSC router cache) replays a finished tree whose
 *     images are already painted. `pageshow` (persisted) re-scans; the scan
 *     marks those `data-instant` so they resolve sharp with no fake ease. */
export function ImageRevealClient() {
  useEffect(() => {
    const w = window as unknown as {
      __slImageReveal?: number;
      __slImageRevealScan?: (instant?: boolean) => void;
    };

    // `__slImageReveal` truthy here means the inline <script> already ran at
    // parse time — i.e. this is a hard load of a grid route. Leave that path
    // entirely to the inline script (its eased first-view reveal is what
    // sang-logium-7j8 signed off); only wire up history restore below.
    const inlineRan = !!w.__slImageReveal;

    if (!inlineRan) {
      // Soft nav onto a grid route from a non-grid first page: install the
      // mechanism now, then instant-reveal whatever already painted (images
      // still downloading are eased by the script's load listener).
      const el = document.createElement("script");
      el.textContent = REVEAL_SCRIPT;
      document.head.appendChild(el);
      el.remove();
      w.__slImageRevealScan?.(true);
    }

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) w.__slImageRevealScan?.(true);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
