'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ensureLocationChangeEvents } from '@/lib/catalogue/urlChangeEvents';

const DEBOUNCE_MS = 300;

/**
 * Product Grid + Server, tracer bullet 3: "wait a beat, then react."
 *
 * Watches the URL (never Filters & Sorting UI directly — see
 * north-star-story.md chapter 7) and, once it settles for DEBOUNCE_MS with no
 * further changes, asks the Server for fresh results by calling
 * `router.refresh()`. This is the only thing this component does — it never
 * calls `router.push`/`replace` itself, because writing the URL is not this
 * actor's job.
 *
 * Renders nothing. Purely a side-effect watcher, mounted once near the
 * product grid in page.tsx.
 *
 * Why polling-adjacent rather than a single event: browsers give us
 * `popstate` for back/forward, but same-document `history.pushState` /
 * `replaceState` calls (how a future Filters & Sorting UI is expected to
 * write the URL instantly) fire no native event at all. `ensureLocationChangeEvents`
 * patches history once so both cases surface as one `locationchange` event.
 *
 * Cancellation of stale requests: `router.refresh()` re-issues the RSC fetch
 * for the current URL and Next.js's own router supersedes an in-flight
 * navigation when a newer one starts, so an intermediate refresh triggered
 * before the debounce window closes can never win a race against the final,
 * settled one. Combined with the debounce meaning most intermediate URL
 * states during a rapid-fire burst never trigger a refresh call at all, only
 * the final settled URL's results are ever asked for. This piece is flagged
 * in README.md as needing real human review — a visual glance does not prove
 * a race condition is actually closed.
 */
export function ProductGridURLSync() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string | null>(null);

  useEffect(() => {
    ensureLocationChangeEvents();
    // Baseline: the URL Next.js already rendered this page for. Only react
    // to changes away from this, not to the initial mount.
    lastSearchRef.current = window.location.search;

    const handleChange = () => {
      const current = window.location.search;
      if (current === lastSearchRef.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastSearchRef.current = current;
        router.refresh();
      }, DEBOUNCE_MS);
    };

    window.addEventListener('locationchange', handleChange);
    return () => {
      window.removeEventListener('locationchange', handleChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return null;
}
