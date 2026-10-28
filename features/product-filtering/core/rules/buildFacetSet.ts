// The FacetSet one product set supports: the fixed commercial facets (they carry
// their own control) plus the owner's picks (which come from the CMS picklist),
// each pick joined with what the products' own data says about it
// (fieldInventory -> projectFacets), plus the query-only facets. Pure: the
// caller passes the products.

import {
  COMMERCIAL_FACETS,
  COMMERCIAL_GROUP,
  MORE_GROUP,
  QUERY_ONLY_FACETS,
} from '@/features/product-filtering/core/definitions/awaitingLaterChunks';
import type {
  FacetGroup,
  FacetSet,
  NarrowingFacet,
  ProjectedFacet,
  RenderedFacet,
  SelectedFacet,
} from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import { deriveControl } from './deriveControl';
import { facetKey } from './facetKey';
import { fieldInventory } from './fieldInventory';
import { projectFacets } from './projectFacets';

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

/** The picked fields: a picked field becomes a facet from its name alone — id from facetKey,
 *  label humanized, "More filters" group. The groups to draw follow from whether any pick is left. */
function selectionFor(picks: string[]): { groups: FacetGroup[]; picked: SelectedFacet[] } {
  const attributes = [...new Set(picks)].filter(
    (attribute) => attribute !== 'brand' && attribute !== 'inStock' && attribute !== 'price',
  );
  const picked = attributes.map((attribute): SelectedFacet => ({
    id: facetKey(attribute),
    attribute,
    label: humanizeAttribute(attribute),
    group: MORE_GROUP.id,
  }));
  return {
    groups: picked.length ? [COMMERCIAL_GROUP, MORE_GROUP] : [COMMERCIAL_GROUP],
    picked,
  };
}

/** The sidebar draws a pick only when the data gave it a control. */
function hasControl(facet: ProjectedFacet): facet is RenderedFacet {
  return facet.control !== null;
}

export function buildFacetSet(products: RawProduct[], picks: string[] = []): FacetSet {
  const inventory = fieldInventory(products);
  const selection = selectionFor(picks);

  const facets = [...COMMERCIAL_FACETS, ...projectFacets(selection.picked, inventory).filter(hasControl)];

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
