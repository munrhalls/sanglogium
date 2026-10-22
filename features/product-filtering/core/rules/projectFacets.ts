import { deriveControl } from './deriveControl';
import { deriveOptions } from './deriveOptions';
import { applyOptionLabels } from './applyOptionLabels';
import type { SliceSelector } from '@/features/product-filtering/core/definitions/facetSelector';
import type { FieldInventory, ProjectedFacet } from '@/features/product-filtering/core/types/facetProjection';

/** Project one slice's selector through its product-data inventory: the human
 *  picks (id/attribute/label/group/unit) joined with what the data derives for
 *  each picked attribute — control, numeric bounds, and for checkboxes the
 *  labelled options. Selector order is preserved. */
export function projectFacets(selector: SliceSelector, inventory: FieldInventory): ProjectedFacet[] {
  return selector.facets.map((facet): ProjectedFacet => {
    const stat = inventory[facet.attribute];
    const control = stat ? deriveControl(stat) : null;
    const projected: ProjectedFacet = { ...facet, control };
    if (stat && control === 'checkbox') {
      projected.options = applyOptionLabels(facet.attribute, deriveOptions(stat));
    }
    if (stat && control === 'range' && stat.min !== null && stat.max !== null) {
      projected.min = stat.min;
      projected.max = stat.max;
    }
    return projected;
  });
}
