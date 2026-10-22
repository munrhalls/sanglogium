// sang-logium-jw8.3 — drop URL filter values that can never match anything on
// this route, so a bogus `?brand=notabrand` / `?driverType=banana` is INERT
// (full unfiltered list, no dead-end empty page) instead of narrowing the GROQ
// query to nothing.
//
// Junk sort values are already neutralised upstream by the parser
// (`parseAsStringLiteral` → default "featured"); this covers the array facets
// the parser cannot vet, because their vocabulary is data-derived.
//
// PURE: no JSX, no data access. The vocabulary comes from the caller's
// FacetSet — the same derivation the sidebar and the counts use:
//   • a rendered checkbox facet's legal values are its `options`,
//   • a query-only checkbox facet's are its `values`,
//   • a facet carrying neither (brand) is vetted against the option set the
//     caller passes in as `dataVocab`; without an entry there its values pass
//     through untouched (never guess in the wrong layer).
//
// Only values matching nothing in the known vocab are dropped (risk A2): a value
// the shopper could legitimately re-add is never removed, and the clean-URL /
// clearOnDefault semantics are untouched — this never writes the URL.

import type { FacetSet, NarrowingFacet, RenderedFacet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';

/** The selectable values a facet carries, when it carries them: a rendered
 *  facet's options, a query-only facet's values. */
function carriedValues(facet: RenderedFacet | NarrowingFacet): string[] | undefined {
  if ('options' in facet && facet.options) return facet.options.map((o) => o.value);
  return 'values' in facet ? facet.values : undefined;
}

export function sanitizeFilterState(
  state: ProductQueryState,
  facetSet: FacetSet,
  dataVocab: Record<string, string[]> = {},
): ProductQueryState {
  const next: ProductQueryState = { ...state };

  for (const facet of [...facetSet.facets, ...facetSet.queryOnly]) {
    if (facet.control !== 'checkbox') continue;

    const raw = next[facet.id];
    if (!Array.isArray(raw) || raw.length === 0) continue;

    const known = carriedValues(facet) ?? dataVocab[facet.id];
    if (!known) continue;

    const allowed = new Set(known.map((v) => v.toLowerCase()));
    const cleaned = raw.filter((v) => allowed.has(String(v).toLowerCase()));
    if (cleaned.length !== raw.length) next[facet.id] = cleaned;
  }

  return next;
}
