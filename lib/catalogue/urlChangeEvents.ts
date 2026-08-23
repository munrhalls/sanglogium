// Same-document URL change notifications.
//
// Browsers fire `popstate` for back/forward, but NOTHING for a same-document
// `history.pushState`/`replaceState` — which is exactly how a client-side URL
// writer (e.g. nuqs) updates `?sort=` and `?f=`. This module patches both
// methods exactly once so they also dispatch a `locationchange` event.
//
// Deliberately knows nothing about who writes the URL or why — it only
// announces that the URL changed. The Product Grid actor reads the URL; it
// never writes it.

export const LOCATION_CHANGE_EVENT = 'locationchange';

const PATCHED_FLAG = '__locationChangePatched__';

type PatchableHistory = History & { [PATCHED_FLAG]?: boolean };

/**
 * Patch `history.pushState`/`replaceState` to also dispatch `locationchange`.
 * Idempotent: safe to call from every mount, in Strict Mode, and after fast
 * refresh — the flag lives on the History object itself, so a second call is a
 * no-op rather than a double-wrap that would fire the event twice.
 */
export function installLocationChangeEvent(): void {
  if (typeof window === 'undefined') return;

  const history = window.history as PatchableHistory;
  if (history[PATCHED_FLAG]) return;
  history[PATCHED_FLAG] = true;

  const dispatch = () => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
  };

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function patchedPushState(...args: Parameters<History['pushState']>) {
    originalPushState(...args);
    dispatch();
  };

  history.replaceState = function patchedReplaceState(...args: Parameters<History['replaceState']>) {
    originalReplaceState(...args);
    dispatch();
  };
}
