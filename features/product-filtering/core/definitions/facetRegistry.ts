// Category-aware selector over the per-category facet configs under
// features/product-filtering/core/definitions/slices/ (headphones, audio-electronics, accessories).
// This file is the single place that picks the right module per route --
// it only selects the slice's facet config (FACETS, groups, sort options);
// it does not select a URL hook. Consumers import the shared URL-param
// and clear-all hooks directly from the catalogue's nuqs hook module
// (all categories share that one hook).
//
// The three modules are structurally identical (same FacetDef/FacetGroup
// shape) but each has its own FacetGroupId union and product type, so
// cross-category typing here is intentionally loose (AnyFacetDef / any)
// rather than importing one category's concrete types as if they applied
// to all three.

import * as headphones from './slices/headphones';
import * as audioElectronics from './slices/audio-electronics';
import * as accessories from './slices/accessories';
// Re-exported below for existing client-side importers -- the canonical
// definitions live in ./category.ts (a module with no client directive) so Server
// Components can use them without crossing the client boundary.
import { CATEGORIES, isCategory, type Category } from './category';

export { CATEGORIES, isCategory, type Category };

export type Option = { value: string; label: string };
export type FacetOptionCount = { value: string; count: number };

/** Structural shape actually read by FilterSidebar/FilterControls/
 *  ActiveFilterChips -- id/label/control/options/unit/min/max. `group`
 *  deliberately excluded: never read by these render-only components
 *  (sang-logium-3rv.5). */
export interface AnyFacetDef {
  id: string;
  label: string;
  control: 'checkbox' | 'boolean' | 'range';
  options?: Option[] | 'derived';
  unit?: string;
  min?: number;
  max?: number;
  /** Optional sub-section heading FilterSidebar renders above this facet's
   *  control, for grouping a few facets under one label inside a shared
   *  FACET_GROUP (e.g. "Cable Properties" above Detachable Cable + Foldable). */
  subheading?: string;
}

export interface FacetGroupDef {
  id: string;
  label: string;
  note?: string;
}

export interface FacetModule {
  FACETS: AnyFacetDef[];
  FACET_GROUPS: FacetGroupDef[];
  facetsForGroup: (groupId: string) => AnyFacetDef[];
  SORT_OPTIONS: Option[];
  SORT_DEFAULT: string;
}

const MODULES: Record<Category, FacetModule> = {
  headphones: {
    FACETS: headphones.FACETS,
    FACET_GROUPS: headphones.FACET_GROUPS,
    facetsForGroup: headphones.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: headphones.SORT_OPTIONS,
    SORT_DEFAULT: headphones.SORT_DEFAULT,
  },
  'audio-electronics': {
    FACETS: audioElectronics.FACETS,
    FACET_GROUPS: audioElectronics.FACET_GROUPS,
    facetsForGroup: audioElectronics.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: audioElectronics.SORT_OPTIONS,
    SORT_DEFAULT: audioElectronics.SORT_DEFAULT,
  },
  accessories: {
    FACETS: accessories.FACETS,
    FACET_GROUPS: accessories.FACET_GROUPS,
    facetsForGroup: accessories.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: accessories.SORT_OPTIONS,
    SORT_DEFAULT: accessories.SORT_DEFAULT,
  },
};

export function getFacetModule(category: Category): FacetModule {
  return MODULES[category];
}

/** Per-category rail icons: each category passes its own group-id -> icon map
 *  (a slice may omit a group or the whole map); any group without an entry
 *  gets the caller's neutral fallback. */
export function resolveGroupIcon<T>(category: Category, groupId: string, iconsByCategory: Partial<Record<Category, Record<string, T>>>, fallback: T): T {
  return iconsByCategory[category]?.[groupId] ?? fallback;
}
