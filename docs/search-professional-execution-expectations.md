# Sang Logium — Search: Professional Execution Expectations

*2026-08-19. Intel gathered from: (1) authoritative framework docs — **nuqs v2.8.9** docs
(`nuqs.dev/docs/*`), **Next.js 15.5.x** pinned docs (`nextjs.org/docs/15/...`), **React 19**
reference (`react.dev`), **Sanity GROQ** docs (the `match` operator); (2) the repo's own
requirement matrix (`tests/catalogue/filters-sorting-matrix.spec.ts`, tags A*/B*/T* — the
catalogue program's requirements that the search surface is expected to match); (3) verified
current source state. Basis for `docs/search-professional-audit-gaps.md`.*

---

## Part A — What "professional execution" means in this stack (intel distillate)

1. **The URL is the single source of truth.** Query state (`q`, `sort`, `page`) must be
   deep-linkable and shareable; the server renders from the awaited `searchParams` page prop
   and the client writes through one shared parser contract (`nuqs/server` `createLoader` +
   the same parsers in `useQueryState`) so SSR and CSR can never drift.
2. **`shallow:false` + SSR-friendly throttling.** nuqs's own invariant (error 422):
   `limitUrlUpdates: debounce` should be used in SSR scenarios **with** `shallow: false`;
   throttle URL writes, use `clearOnDefault` for clean URLs.
3. **Server truth, streamed.** Next.js 15: `searchParams` is a Promise, awaited in the page;
   pass promises into `<Suspense>` children so the shell renders immediately. React `cache()`
   dedupes; `Promise.all` fans out independent queries (count + window).
4. **`useSearchParams` requires a Suspense boundary** in client components during prerender.
5. **Search results must respect the user's explicit ordering.** Relevance scoring is the
   *default* ordering; once the user picks a sort, that sort must be the actual order of the
   page window (applied before slicing), not a tiebreaker inside relevance buckets.
6. **Security by construction.** Sort values are allowlisted → literal GROQ `order` clauses;
   query strings are trimmed and never concatenated into the query except as a GROQ `match`
   parameter; the CDN read client (`useCdn:true`) is the only public path.
7. **Edge states are designed, not accidental.** Empty query, zero results (with next
   actions), out-of-range page (clamp, don't lie), Sanity failure (graceful empty + error
   surface with retry).
8. **SEO parity with URL state.** `/search` base is indexable; query permutations
   (`?q=`, `?sort=`, `?page=`) are `noindex,follow`; ordering is deterministic.
9. **Accessibility is non-negotiable.** Search input labelled, autocomplete follows the ARIA
   combobox/listbox pattern (`role=listbox`, `role=option`, `aria-activedescendant`,
   `aria-expanded`, `aria-controls`), mobile overlay is a real dialog (Escape-to-close,
   focus restore to trigger, focus trap).
10. **Performance discipline.** Debounce + abort autocomplete requests; server-side GROQ
    with parallel count+window; no client filter runtime; 6-item autocomplete cap.
