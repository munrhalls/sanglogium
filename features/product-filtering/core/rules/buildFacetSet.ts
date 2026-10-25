// The FacetSet one product set supports: the fixed commercial facets plus the
// owner's picks (which come from the CMS picklist), each joined with what the
// products' own data says about it (fieldInventory -> projectFacets), plus the
// query-only facets. Pure: the caller passes the products.

import {
  COMMERCIAL_FACETS,
  COMMERCIAL_GROUP,
  FACET_SELECTOR,
  MORE_GROUP,
  QUERY_ONLY_FACETS,
  type FieldMeta,
  type SelectedFacet,
  type SelectorGroup,
} from '@/features/product-filtering/core/definitions/facetSelector';
import type { Category } from '@/features/product-filtering/core/definitions/category';
import type { FacetSet, NarrowingFacet, ProjectedFacet, RenderedFacet } from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import { deriveControl } from './deriveControl';
import { facetKey } from './facetKey';
import { fieldInventory } from './fieldInventory';
import { projectFacets } from './projectFacets';

/** A slice's facets, or 'commercial': only the group every slice shares (brand, in stock), for /search results that span slices. */
export type FacetScope = Category | 'commercial';

/** 'wearingStyle' -> 'Wearing Style': dots become word breaks, camelCase
 *  humps become word breaks, every word is capitalised. */
function humanizeAttribute(attribute: string): string {
  return attribute
    .replace(/\./g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** A picked field with no selector entry still draws: humanized label, "More filters" group, no unit. */
function fallbackMeta(attribute: string): FieldMeta {
  return { label: humanizeAttribute(attribute), group: MORE_GROUP.id };
}

/** The fixed commercial facets plus the picked fields, each with its selector
 *  presentation or the code fallback. 'commercial' scope ignores the picks. */
function selectionFor(scope: FacetScope, picks: string[]): { groups: SelectorGroup[]; facets: SelectedFacet[] } {
  if (scope === 'commercial') {
    return { groups: [COMMERCIAL_GROUP], facets: COMMERCIAL_FACETS };
  }
  const { groups, fields } = FACET_SELECTOR[scope];
  const attributes = [...new Set(picks)].filter(
    (attribute) => attribute !== 'brand' && attribute !== 'inStock' && attribute !== 'price',
  );
  let needsMoreGroup = false;
  const picked = attributes.map((attribute): SelectedFacet => {
    const meta = fields[attribute];
    if (!meta) needsMoreGroup = true;
    return { id: facetKey(attribute), attribute, ...(meta ?? fallbackMeta(attribute)) };
  });
  return {
    groups: needsMoreGroup ? [...groups, MORE_GROUP] : groups,
    facets: [...COMMERCIAL_FACETS, ...picked],
  };
}

/** The sidebar draws a facet only when the data gave it a control. In stock is the exception: availability is
 *  computed from the stock fields of every product, so its toggle needs no stored field. */
function withKnownControl(facet: ProjectedFacet): RenderedFacet | null {
  const control = facet.control ?? (facet.id === 'inStock' ? 'boolean' : null);
  return control === null ? null : { ...facet, control };
}

/** Brand keeps no option list: its options and their names are counted from the products (brandRef.name),
 *  not derived from slugs. */
function withoutBrandOptions(facet: RenderedFacet): RenderedFacet {
  if (facet.id !== 'brand') return facet;
  const { options, ...rest } = facet;
  return rest;
}

export function buildFacetSet(products: RawProduct[], scope: FacetScope, picks: string[] = []): FacetSet {
  const inventory = fieldInventory(products);
  const selection = selectionFor(scope, picks);

  const facets = projectFacets(selection.facets, inventory)
    .map(withKnownControl)
    .filter((facet): facet is RenderedFacet => facet !== null)
    .map(withoutBrandOptions);

  const renderedAttributes = new Set(facets.map((facet) => facet.attribute));
  const queryOnly = QUERY_ONLY_FACETS.flatMap(({ id, attribute }): NarrowingFacet[] => {
    if (renderedAttributes.has(attribute)) return [];
    const stat = inventory[attribute];
    const control = stat ? deriveControl(stat) : null;
    if (control === null) return [];
    // The URL vets selections against the same derivation: a checkbox facet's
    // legal values are the distinct values the data actually holds.
    return [control === 'checkbox' ? { id, attribute, control, values: stat.values } : { id, attribute, control }];
  });

  return { groups: selection.groups, facets, queryOnly };
}
