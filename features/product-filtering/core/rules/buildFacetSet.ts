// The FacetSet one product set supports: the selector's picks joined with what the products' own data
// says about each (fieldInventory -> projectFacets), plus the query-only facets. Pure: the caller passes
// the products.

import { FACET_SELECTOR, QUERY_ONLY_FACETS, type SliceSelector } from '@/features/product-filtering/core/definitions/facetSelector';
import type { Category } from '@/features/product-filtering/core/definitions/category';
import type { FacetSet, NarrowingFacet, ProjectedFacet, RenderedFacet } from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import { deriveControl } from './deriveControl';
import { fieldInventory } from './fieldInventory';
import { projectFacets } from './projectFacets';

/** A slice's facets, or 'commercial': only the group every slice shares (brand, in stock), for /search results that span slices. */
export type FacetScope = Category | 'commercial';

function selectorFor(scope: FacetScope): SliceSelector {
  if (scope !== 'commercial') return FACET_SELECTOR[scope];
  // Brand and in stock are the same in every slice.
  const { groups, facets } = FACET_SELECTOR.headphones;
  return {
    groups: groups.filter((group) => group.id === 'commercial'),
    facets: facets.filter((facet) => facet.group === 'commercial'),
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

export function buildFacetSet(products: RawProduct[], scope: FacetScope): FacetSet {
  const inventory = fieldInventory(products);
  const selector = selectorFor(scope);

  const facets = projectFacets(selector, inventory)
    .map(withKnownControl)
    .filter((facet): facet is RenderedFacet => facet !== null)
    .map(withoutBrandOptions);

  const queryOnly = QUERY_ONLY_FACETS.flatMap(({ id, attribute }): NarrowingFacet[] => {
    const stat = inventory[attribute];
    const control = stat ? deriveControl(stat) : null;
    if (control === null) return [];
    // The URL vets selections against the same derivation: a checkbox facet's
    // legal values are the distinct values the data actually holds.
    return [control === 'checkbox' ? { id, attribute, control, values: stat.values } : { id, attribute, control }];
  });

  return { groups: selector.groups, facets, queryOnly };
}
