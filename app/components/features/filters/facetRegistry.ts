'use client';

// Category-aware selector over the per-category facet modules: headphones
// has its own module under lib/filter-sort/headphones/, while
// audio-electronics and accessories have minimal modules under
// lib/filter-sort/<slice>/ and use the production URL hook. Before
// sang-logium-3rv.6, FilterSidebar/FilterControls/ActiveFilterChips imported
// headphones' module unconditionally, so /products/audio-electronics and
// /products/accessories silently rendered headphones' groups and facets --
// this file is the single place that picks the right one per route.
//
// The three modules are structurally identical (same FacetDef/FacetGroup
// shape, same useFilterParam/useClearAllFilters contract) but each has its
// own FacetGroupId union and product type, so cross-category typing here is
// intentionally loose (AnyFacetDef / any) rather than importing one
// category's concrete types as if they applied to all three.

import * as headphones from '@/lib/filter-sort/headphones/facetConfig';
import * as audioElectronics from '@/lib/filter-sort/audio-electronics/facetConfig';
import * as accessories from '@/lib/filter-sort/accessories/facetConfig';
import { useFilterParam as useHeadphonesFilterParam, useClearAllFilters as useHeadphonesClearAll } from '@/lib/filter-sort/headphones/useFilterParam';
import { useFilterParam as useCatalogueFilterParam, useClearAllFilters as useCatalogueClearAll } from '@/app/hooks/nuqs/useFilterSort';
// Re-exported below for existing client-side importers -- the canonical
// definitions live in ./category.ts (a non-'use client' module) so Server
// Components can use them without crossing the client boundary.
import { CATEGORIES, isCategory, type Category } from './category';

export { CATEGORIES, isCategory, type Category };

export type Option = { value: string; label: string };
export type FacetOptionCount = { value: string; count: number };

/** Structural shape actually read by FilterSidebar/FilterControls/
 *  ActiveFilterChips -- id/label/control/options/unit/min/max. `field` (a
 *  keyof-per-category-product-type) and `group`/`itemNo`/`status` deliberately
 *  excluded: never read by these render-only components (sang-logium-3rv.5). */
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
  useFilterParam: (key: string, optionOverrides?: { history?: 'push' | 'replace' }) => [any, any];
  useClearAllFilters: () => () => void;
}

const MODULES: Record<Category, FacetModule> = {
  headphones: {
    FACETS: headphones.FACETS,
    FACET_GROUPS: headphones.FACET_GROUPS,
    facetsForGroup: headphones.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: headphones.SORT_OPTIONS,
    SORT_DEFAULT: headphones.SORT_DEFAULT,
    useFilterParam: useHeadphonesFilterParam,
    useClearAllFilters: useHeadphonesClearAll,
  },
  'audio-electronics': {
    FACETS: audioElectronics.FACETS,
    FACET_GROUPS: audioElectronics.FACET_GROUPS,
    facetsForGroup: audioElectronics.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: audioElectronics.SORT_OPTIONS,
    SORT_DEFAULT: audioElectronics.SORT_DEFAULT,
    useFilterParam: useCatalogueFilterParam,
    useClearAllFilters: useCatalogueClearAll,
  },
  accessories: {
    FACETS: accessories.FACETS,
    FACET_GROUPS: accessories.FACET_GROUPS,
    facetsForGroup: accessories.facetsForGroup as FacetModule['facetsForGroup'],
    SORT_OPTIONS: accessories.SORT_OPTIONS,
    SORT_DEFAULT: accessories.SORT_DEFAULT,
    useFilterParam: useCatalogueFilterParam,
    useClearAllFilters: useCatalogueClearAll,
  },
};

export function getFacetModule(category: Category): FacetModule {
  return MODULES[category];
}

/** Bespoke per-group rail icons for audio-electronics' and accessories' own
 *  taxonomies are a content/design decision (which icon best fits "Turntables
 *  & Vinyl"?), not a wiring fix -- out of scope here, tracked as a follow-up
 *  (sang-logium-3rv.6). Both categories get one neutral fallback per group
 *  until that follow-up lands; headphones keeps its existing bespoke set,
 *  passed in by the caller. */
export function resolveGroupIcon<T>(category: Category, groupId: string, headphoneIcons: Record<string, T>, fallback: T): T {
  if (category === 'headphones') return headphoneIcons[groupId] ?? fallback;
  return fallback;
}
