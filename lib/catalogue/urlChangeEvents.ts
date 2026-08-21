// Product Grid + Server: same-document URL change notifications.
//
// Browsers fire `popstate` for back/forward navigation, but NOT for
// same-document `history.pushState`/`replaceState` calls — and that's
// exactly how a future Filters & Sorting UI is expected to write the URL
// instantly (per north-star-story.md chapter 6) without waiting on this
// actor. So this module patches `history.pushState`/`replaceState` exactly
// once per page load to also dispatch a `locationchange` event, giving
// ProductGridURLSync something to listen for either way.
//
// Isolated here (rather than inlined into the watcher component) so the
// patching logic is reusable and independently readable/testable.

let patched = false;

/**
 * Idempotently patch `history.pushState`/`replaceState` to also dispatch a
 * `locationchange` event on `window`. Safe to call from multiple components;
 * only patches once per page load. No-op during SSR (no `window`).
 */
export function ensureLocationChangeEvents(): void {
  if (typeof window === 'undefined' || patched) return;
  patched = true;

  const dispatch = () => window.dispatchEvent(new Event('locationchange'));

  const originalPushState = window.history.pushState.bind(window.history);
  window.history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPushState(...args);
    dispatch();
  };

  const originalReplaceState = window.history.replaceState.bind(window.history);
  window.history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState(...args);
    dispatch();
  };

  window.addEventListener('popstate', dispatch);
}
