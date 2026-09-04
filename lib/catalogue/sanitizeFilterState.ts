// sang-logium-jw8.3 — drop URL filter values that can never match anything on
// this route, so a bogus `?brand=notabrand` / `?driverType=banana` is INERT
// (full unfiltered list, no dead-end empty page) instead of narrowing the GROQ
// query to nothing.
//
// Junk sort values are already neutralised upstream by the parser
// (`parseAsStringLiteral` → default "featured"); this covers the array facets
// the parser cannot vet, because their vocabulary is either category-specific
// or data-derived.
//
// PURE: no JSX, no data access.
//   • Closed-vocabulary facets (enum / multi with a real `valueVocab`) validate
//     against `facetMap`.
//   • Data-derived facets (brand — placeholder `valueVocab`) can only be
//     validated against the option set the catalogue page already computes, so
//     the caller passes it in as `dataVocab`. Without an entry there, that
//     facet's values pass through untouched (never guess in the wrong layer).
//
// Only values matching nothing in the known vocab are dropped (risk A2): a value
// the shopper could legitimately re-add is never removed, and the clean-URL /
// clearOnDefault semantics are untouched — this never writes the URL.

import { FILTER_FACETS, isPlaceholderVocab } from './facetMap';
import type { ProductQueryState } from './buildProductQuery';

export function sanitizeFilterState(
  state: ProductQueryState,
  dataVocab: Record<string, string[]> = {},
): ProductQueryState {
  const next: ProductQueryState = { ...state };

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price' || facet.urlParam === 'inStock') continue;
    if (facet.type === 'boolean') continue;

    const raw = next[facet.urlParam];
    if (!Array.isArray(raw) || raw.length === 0) continue;

    let allowed: Set<string> | null = null;
    if (isPlaceholderVocab(facet.valueVocab)) {
      const known = dataVocab[facet.urlParam];
      if (known) allowed = new Set(known.map((v) => v.toLowerCase()));
    } else {
      allowed = new Set(facet.valueVocab.map((v) => v.toLowerCase()));
    }
    if (!allowed) continue;

    const allowedSet = allowed;
    const cleaned = raw.filter((v) => allowedSet.has(String(v).toLowerCase()));
    if (cleaned.length !== raw.length) next[facet.urlParam] = cleaned;
  }

  return next;
}
