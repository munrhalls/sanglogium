import { deriveControl } from './deriveControl';
import { deriveOptions } from './deriveOptions';
import { applyOptionLabels } from './applyOptionLabels';
import type { SelectedFacet } from '@/features/product-filtering/core/definitions/facetSelector';
import type { FieldInventory, ProjectedFacet } from '@/features/product-filtering/core/types/facetProjection';

/** Project the drawn facets — the fixed commercial ones plus the owner's
 *  picks — through the product-data inventory: each facet's presentation
 *  (id/attribute/label/group/unit) joined with what the data derives for its
 *  attribute — control, numeric bounds, and for checkboxes the labelled
 *  options. Facet order is preserved. */
export function projectFacets(facets: SelectedFacet[], inventory: FieldInventory): ProjectedFacet[] {
  return facets.map((facet): ProjectedFacet => {
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
